# OpenTalk Outlook-Add-in 2.0

## Debugging in Outlook Web

> [!important]
> This setup currently only works in Firefox and Safari. Chrome has issues due to same origin policy.

Unfortunately there is no Outlook desktop application for Linux, so you have to use the web version of Outlook, which does not support the "automatic" installation that `office-addin-debugging` tries to do for the desktop application when running `pnpm start`. The good news is that once installed, the add-in is bound to your account and can be tested from any device. You only have to reinstall the add-in when making changes to the [`manifest.xml`](manifest.xml) (which is not necessary often) and **not** when making code changes.

### Testing environment

Start the [`testing-environment`](https://git.opentalk.dev/opentalk/backend/tools/testing-environment) with profiles `frontend` and `backend`.

`docker compose --profile frontend --profile backend up`

## Add certificate

It is required to install a certificate anchor locally, which is necessary for Outlook to load the Add-in (Outlook does not allow loading Add-ins without https, even for development).

Run `pnpm exec office-addin-dev-certs install`. This will create certificates in `~/.office-addin-dev-certs` and add a trust anchor under `/etc/ca-certificates/trust-source/anchors`.

### Outlook

1. Visit https://outlook.live.com/owa/?path=/options/manageapps (this page often breaks in Firefox, so you might want to use a different browser)
1. Select _My add-ins_ &rarr; _Add a custom add-in_
1. Select the [`manifest.xml`](manifest.xml)

Afterwards you can work with the add-in by running the dev server with `pnpm run dev-server` and opening Outlook in your preferred web browser. You can access the add-in when creating an event in Outlook under the ... menu on the upper right-hand side.

## Troubleshooting

In case your browser refuses to accept the certificate after installing it as described above, try adding the certificate to the trust store of your browser.

### Firefox

1. Import the CA into Firefox’s certificate store

GUI: Settings → Privacy & Security → Certificates → View Certificates → Authorities → Import → select ~/.office-addin-dev-certs/ca.crt → trust for websites → OK → restart Firefox

2. Restart Firefox

## Test production version

First build the docker container from the root
`docker build -t opentalk-outlook-addin -f ci/Dockerfile .`

In dev mode, the SSL certificates are being served by the dev server.
Now, as you are going to run the production version, you need to serve those certificates somehow different.

One possibility is to do it, is using [`caddy`](https://caddyserver.com/) as reverse proxy

As a prerequisite install `caddy` on your system

1. Start add-in container on some port, other than `localhost:3001`

`docker run --rm -e OPENTALK_OUTLOOK_WEBAPP_URL=http://localhost:3000 -p {addin_port}:80 opentalk-outlook-addin`

1. Copy SSL cerificates, that were created during development and were imported to your browser, to some known directory

1. Create a `Caddyfile` in the root and adapt the path to the certificates and proxy port

```caddy
{
  admin 0.0.0.0:2020
  auto_https off
}

:3001
tls {path_to_certificate}/localhost.crt {path_to_certificate}/localhost.key
reverse_proxy localhost:{addin_port}
```

1. Start `caddy`

`caddy run --config ./Caddyfile`

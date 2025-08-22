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

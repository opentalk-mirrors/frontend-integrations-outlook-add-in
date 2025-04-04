# OpenTalk Outlook-Add-in 2.0

## Debugging in Outlook Web

Unfortunately there is no Outlook desktop application for Linux, so you have to use the web version of Outlook, which does not support the "automatic" installation that `office-addin-debugging` tries to do for the desktop application when running `pnpm start`. The good news is that once installed, the add-in is bound to your account and can be tested from any device. You only have to reinstall the add-in when making changes to the [`manifest.xml`](manifest.xml) (which is not necessary often) and **not** when making code changes. Follow the steps below to install the add-in in the web version:

1. Visit https://outlook.live.com/owa/?path=/options/manageapps
1. Select _My add-ins_ &rarr; _Add a custom add-in_
1. Select the [`manifest.xml`](manifest.xml)

Afterwards you can work with the add-in by running the dev server with `pnpm run dev-server` and opening Outlook in your preferred web browser.

#!/usr/bin/env sh

# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

# Create a config.json file with a config object. Populates the values of the
# config with environment variables that are present in the container.
HTML_ROOT=/usr/share/nginx/html
cat >$HTML_ROOT/config.json << EOF
{
  "opentalkOutlookOidcClientId": "${OPENTALK_OUTLOOK_OIDC_CLIENT_ID}",
  "opentalkOutlookOidcScopes": "${OPENTALK_OUTLOOK_OIDC_SCOPES}",
  "opentalkOutlookWebAppUrl": "${OPENTALK_OUTLOOK_WEBAPP_URL}"
}
EOF

# Allow configuring the deployment url of the addin using an environment variable
# Escape all forward slashes by adding a backward slash in front of them
url=$(echo "$OPENTALK_OUTLOOK_URL" | sed 's/\//\\\//g')
# Replace the development url with the deployment url in the manifest
sed --in-place "s/https:\/\/localhost:3001/$url/g" "$HTML_ROOT"/manifest.xml

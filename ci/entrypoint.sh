#!/usr/bin/env sh

# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

# Creates a config.json file with a config object. Populates the values of the
# config with environment variables that are present in the container.

HTML_ROOT=/usr/share/nginx/html
cat >$HTML_ROOT/config.json << EOF
{
  "opentalkOutlookOidcClientId": "${OPENTALK_OUTLOOK_OIDC_CLIENT_ID}",
  "opentalkOutlookHostUrl": "${OPENTALK_OUTLOOK_HOST_URL}"
}
EOF

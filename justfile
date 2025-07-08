# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
#
# This file can be used with the [`just`](https://just.systems) tool.

[no-exit-message]
_check_jq:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! jq --help &>/dev/null; then
        echo 'jq is not available, see https://github.com/jqlang/jq' >&2
        exit 1
    fi

[no-exit-message]
_check_git_cliff:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! git-cliff --help &>/dev/null; then
        echo 'git-cliff is not available, you can install it with `cargo install --git ssh://git@git.opentalk.dev:222/opentalk/tools/git-cliff.git`' >&2
        exit 1
    fi

# Prepare a release
prepare-release VERSION: (set-version VERSION) (update-changelog VERSION)

# Sets the version in the Cargo.toml and updates the Cargo.lock
set-version VERSION:
    echo "$(jq '.version= "{{ VERSION }}"' package.json)" > package.json

# Update the changelog
update-changelog VERSION: _check_git_cliff
    # Update Changelog
    GITLAB_TOKEN=$(cat ~/.gitlab_token) \
    GITLAB_API_URL=https://git.opentalk.dev/api/v4 \
    GITLAB_REPO=opentalk/frontend/integrations/outlook-add-in \
    git-cliff -vv \
        --config opentalk \
        --unreleased \
        --tag "v{{ VERSION }}" \
        --prepend CHANGELOG.md

# Create the release commit
commit-release: _check_jq
    #!/usr/bin/env bash
    set -eu -o pipefail
    VERSION=$(cat package.json | jq -r .version)
    git commit -a -m "chore(release): prepare release ${VERSION}"
    git log HEAD^..HEAD

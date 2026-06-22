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

[no-exit-message]
_check_glab:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v glab > /dev/null; then
        echo 'glab is not available, see https://gitlab.com/gitlab-org/cli' >&2
        exit 1
    fi

# Prepare a release
prepare-release VERSION: (set-version VERSION) (update-changelog VERSION) (update-public-code VERSION)

# Sets the version in the Cargo.toml and updates the Cargo.lock
set-version VERSION:
    echo "$(jq '.version= "{{ VERSION }}"' package.json)" > package.json

# Update the changelog
update-changelog VERSION: _check_git_cliff
    #!/usr/bin/env bash

    if [ -z "$GITLAB_TOKEN" ] && [ -f "$HOME/.gitlab_token" ]; then
        GITLAB_TOKEN=$(cat $HOME/.gitlab_token)
    fi

    # Update Changelog
    GITLAB_TOKEN=$GITLAB_TOKEN \
    GITLAB_API_URL=https://git.opentalk.dev/api/v4 \
    GITLAB_REPO=opentalk/frontend/integrations/outlook-add-in \
    git-cliff -vv \
        --config opentalk \
        --use-branch-tags \
        --unreleased \
        --tag "v{{ VERSION }}" \
        --prepend CHANGELOG.md

update-public-code VERSION:
    #!/usr/bin/env bash
    set -eu -o pipefail
    # Update publiccode.yml
    date=$(date --iso-8601)
    # go-yq does not support preserving the format (see https://github.com/mikefarah/yq/issues/465)
    # so we have to use sed.
    sed -E -i "s/releaseDate: '[0-9]{4}-[0-9]{2}-[0-9]{2}'/releaseDate: '$date'/" publiccode.yml
    sed -E -i "s/softwareVersion: v[0-9]+\.[0-9]+\.[0-9]+/softwareVersion: v{{ VERSION }}/" publiccode.yml

# Create the release commit
commit-release: _check_jq
    #!/usr/bin/env bash
    set -eu -o pipefail
    VERSION=$(cat package.json | jq -r .version)
    git commit -a -m "chore(release): prepare release ${VERSION}"
    git log HEAD^..HEAD

# Create a GitLab release from the current version tag
create-release: _check_jq _check_glab
    #!/usr/bin/env bash
    set -euo pipefail
    current_version=$(jq -r .version package.json)
    tag="v$current_version"

    # Extract the changelog section for this version
    notes=$(awk "/^## \\[$current_version\\]/{found=1; next} /^## \\[/{if(found) exit} /^\\[$current_version\\]:/{next} found{print}" CHANGELOG.md)

    if [ -z "$notes" ]; then
        echo "No changelog entry found for version $current_version" >&2
        exit 1
    fi

    glab release create "$tag" --notes "$notes"

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.7] - 2025-12-03

[0.2.7]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/v0.2.6-1...v0.2.7

### 🚀 New features

- (ci) Push to new registry ([!177](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/177), [#37](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/issues/37))

### 🐛 Bug fixes

- Reauthenticate after server-side logout ([!178](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/178), [#36](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/issues/36))
- (ci) Typo in env ([!180](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/180))

### 📦 Dependencies

- (deps) Update dependency eslint to ^9.37.0 ([!102](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/102))
- (deps) Update dev dependency form-data ([!149](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/149))
- (deps) Update dev dependency brace-expansion ([!149](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/149))

### ⚙ Miscellaneous

- Switch to internal kaniko image ([!144](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/144))

### Ci

- Update packages when building container ([!148](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/148))

## [0.2.6] - 2025-09-25

[0.2.6]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/v0.2.5...v0.2.6

### 🐛 Bug fixes

- Missing call-in translation ([!140](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/140))

### 📦 Dependencies

- (deps) Update dependency webpack-dev-server to v5.2.2 ([!105](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/105))
- (deps) Update node.js to v22.20.0 ([!109](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/109))
- (deps) Update pnpm to v10.17.1 ([!89](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/89))

## [0.2.5] - 2025-09-23

[0.2.5]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/v0.2.4...v0.2.5

### 🐛 Bug fixes

- Use relative path ([!135](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/135))

## [0.2.4] - 2025-09-22

[0.2.4]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/v0.2.3...v0.2.4

### 🐛 Bug fixes

- Translation files loading ([!133](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/133))

## [0.2.3] - 2025-09-19

[0.2.3]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/v0.2.2...v0.2.3

### 🚀 New features

- Add i18n ([!131](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/131))

## [0.2.2] - 2025-09-08

[0.2.2]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/v0.2.1...v0.2.2

### 🚀 New features

- Create guest link when creating an event ([!128](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/128))
- Get invitees from the outlook native invite atendees field ([!129](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/129))

### 🐛 Bug fixes

- Missing quotes for releaseDate ([!123](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/123))
- Screenshot for opencode ([!124](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/124))

### ⚙ Miscellaneous

- Add instructions for installing dev cert ([!127](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/127))
- Format publiccode.yml ([!125](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/125))
- (justfile) Update publiccode.yml when preparing a release ([!125](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/125))

## [0.2.1] - 2025-08-14

[0.2.1]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/v0.2.0...v0.2.1

### 🐛 Bug fixes

- Suppress e-mail when creating or editing events ([!119](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/119))
- Fix screenshots file type for publiccode.yml ([!121](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/121))

### ⚙ Miscellaneous

- Add publiccode.yml file ([!120](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/120))

## [0.2.0] - 2025-08-08

[0.2.0]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/v0.1.5...v0.2.0

### 🚀 New features

- Insert meeting details in the event description ([!117](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/117))

### 🐛 Bug fixes

- Editing meeting description when updating event ([!117](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/117))

### ⚙ Miscellaneous

- Correct information provided in package.json ([!115](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/115))
- Add license files ([!115](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/115))
- Use port 3001 for the dev server ([!116](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/116))
- Remove unnecessarily disabled eslint rules ([!117](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/117))

### Ci

- Publish tags with a 'v' prefix ([!114](https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/merge_requests/114))

## [0.1.5] - 2025-07-08

[0.1.5]: https://git.opentalk.dev/opentalk/frontend/integrations/outlook-add-in/-/compare/de4e653...v0.1.5

This is the initial public release of the Outlook Add-in. Currently it supports creating, editing and deleting meetings. When creating or editing meetings, the following options are available:

- Title
- Description
- Start- and endtime/date
- Participants (including user search)
- Meeting details
- Waiting room
- Shared folder (if available the the deployment)

When a meeting is created, participants are invited via an e-mail sent by Outlook.
Furthermore, we insert a link to the meeting room in the description and in the location of the meeting. The link in the location allows to quickly join a meeting from the calendar view without having to open the event details.

To avoid confusion, **we strongly recommend disabling the "Add online meeting to all meetings" feature in Outlook**. This default setting automatically creates a Teams meeting and adds a "Join Meeting" link to every Outlook event. For obvious reasons, this is confusing when scheduling an OpenTalk meeting. To disable this setting:

1. Go to _Settings_ > _Calendar_ > _Events and invitations_
1. Disable the "_Add online meeting to all meetings_" toggle.

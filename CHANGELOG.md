# Parabol Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## 6.5.0 2021-Apr-01

### Added

- Create GH issue button in Sprint poker, currently hidden (#4799)
- GitHub tab in Sprint Poker (#4777)
### Removed

- Removed IM scopes from Slack integration, per Slack feedback (#4844)

### Fixed

- Sort order of poker votes (#4821)
- Add type safety to deleteUser (#4826)
- Push to story points type mismatch (#4854)

## 6.4.0 2021-Mar-24

### Added

- Add jira issue key to left nav in sprint poker #4794
- Add bugs animation to retro #4800
- Add "i dont vote" button for poker spectators #4791
- Add debug jira helper #4790
- Add postgres postdeploy migration hook #4787
- Add postgres writes for user and team table, backfill migrations #4787
- Add new logo color #4763
- Add new color pallette #4776
- Add scollbar to story card in poker estimate phase #4755

### Changed

- Bump elliptic dependency from 6.5.3 to 6.5.4 #4758

### Fixed

- Fix issues preventing approval for our Slack app directory submission #4792
- Fix poker subnav item styles #4798
- Fix domain change in gmail causing login issues #4806
- Fix selecting jira issue race condition #4719
- Fix calendar first month available bug #4797
- Fix non-integrated poker user can't see jira content #4793
- Fix "just started" snackbar error when changing facilitators #4780

## 6.3.1 2021-Mar-19

### Fixed

- Fix broken suOrgCount query due to incorrect enum type

## 6.3.0 2021-Mar-18

### Fixed

- Fix an issue where app crashes on revealing votes if there are people who did not vote #4747
- Fix security issue #46 #4698
- Fix user img upload #4746

## 6.2.0 2021-Mar-03

### Added

- Provide feedback for old browser bugs #4752

### Changed

- TypeError: Cannot destructure property 'atlassian' of 'r' as it is undefined. #4736
- Refactor gql2ts enums to unions #4693
- Prevent Poker drawer from jumping up #4743

## 6.2.1 2021-Mar-04

### Fixed

- Fix an issue where app crashes on revealing votes if there are people who did not vote #4737

## 6.2.0 2021-Mar-03

### Added

- Sort the reflection groups on server side after REFLECT phase #4696

### Changed

- Refactoring for CustomPhaseItem #4728
- Migrate RethinkDB Provider table to GitHubAuth #4727
- We’ve updated palette values and added a new palette const enums #4658

## 6.1.0 2021-Feb-25

### Added

- Robust message queue protocol (#4386)
- Freeze poker templates for meeting duration (#4695)

### Changed

- Meeting avatars are populated from MeetingMembers (#4652)

### Fixed

- Google oauth deleted account recreation email missing (#4654)
- Make SAML Issuer and AssertionConsumerServiceURL dynamic (#4679)
- Add Scale Value button goes missing (#4694)

## 6.0.0 2021-Feb-18

### Fixed

- User cannot delete prompts from retro templates
- Non-meeting members do not get meeting summary emails (#4681)

### Changed

- Threaded comments are fully expanded (#4647)

## 5.36.0 2021-Feb-16

### Added

- Release Sprint Poker (#4667)

## 5.35.0 2021-Feb-10

### Added

- postgres-json-schema PG extension to dev docker-compose (#4660)

### Fixed

- Hyperlinks in discussion thread comments (#4655)
- Poker Jira Filter includes all projects and avatars (#4663)
- Template dialog select button (#4653)
- Retro collapsing stack animation (#4643)

### Changed

- Logos & Static assets (#4645)
- Meeting members are only added when they enter the meeting (#4611)

## 5.34.0 2021-Feb-04

### Added

- New icebreakers in the icebreaker phase of a meeting (#4557)
- Make poker card deck slideable (#4604)
- Unique illustrations for default retro and poker meeting templates (#4642)
- OrgUserAudit table for better tracking & reporting (#4582)
- Postgres setup configurations for CI and prod (#4640)

### Fixed

- Retro column UI fixes (#4612)
- Fixed various undefined type errors reported by Sentry (#4620, #4627)
- Timeline events not scrolling (#4588)
- New meeting joiner infinite loop (#4625)
- Pinned agenda items removed on meeting end (#4641)

## 5.33.1 2021-Jan-28

### Fixed

- Fixed replicated org users (#4541)
- Fixed renderQuery failing to send error to Sentry (#4601)

## 5.33.0 2021-Jan-27

### Added

- Adds a placeholder with example JQL when JQL search is turned on (#4576)
- Added postgress to local dev environment allowing developers to run and manage postgres locally via docker-compose (#4580)

### Changed

- Shows the mock loading bars when a search is in progress. this is a little more jerky than ideal, but we need to show folks that a search is pending (#4576)

### Fixed

- Fixes a bug if JQL is turned on too fast (#4576)

## 5.32.0 2021-Jan-20

### Fixed

- Fixed a bug where tasks didn’t update #4556
- Fixed a bug with client tempId #4560
- Fixed a bug with the group title error message #4562

## 5.31.2 2021-Jan-14

### Added

- Making grouping columns responsive in retrospective meeting (#3614)

### Changed

- Links in discussion thread comments are now clickable links (#4345)
- More intuitive template dialog with FAB button (#4128)
- Preparation work for Slack migration (#4373)

### Fixed

- Sprint Poker meetings ended before Scoping phases shouldn't generate a summary (#4465)
- Better UI for many Jira projects import (#4512)
- Carousel scrolls to different meeting type after changing team (#4484)
- CSV export is malformed (#4489)
- Other performance improvements (#4488, #4506, #4513)

## 5.30.0 2021-Jan-06

### Changed

- Guarantee unique ID for redis jobs (#4487)

### Fixed

- Retro meeting fixes & add new emojis (#4499)
- Remove retro templates that have no prompts (#4486)

## 5.29.1 2020-Dec-23

### Fixed

- Bug on non-poker meeting summary

## 5.29.0 2020-Dec-22

### Added

- Support for multi-domain SAML (#4478)

### Changed

- Upgrade to Webpack v5 (#4455, #4477)

### Fixed

- Scale UI Fixups (#4472)

## 5.28.0 2020-Dec-17

### Added

- Added batch support for feature flags #4446
- Pre-validate jira field mappers #4445
- Adds Parabol stories to Sprint Poker Estimate phase #4420

### Changed

- Moved HubSpot Segment function inside the app #4451
- Scale editor UI refined #4435 #4430
- Sprint Poker UI refined #4416
- Bump ini from 1.3.5 to 1.3.7 #4434

### Fixed

- Fixed reactji spacing #4427
- User cannot update their preferred name #4456
- User cannot clone a public scale #4458
- Sprint Poker: can’t add Parabol tasks when integrated with Jira #4461
- Sprint Poker: can’t add new Jira tasks in Scope view
- Sprint Poker: Parabol task edits persist in Estimate phase #4464
- Thread empty state mentions tasks conditionally

## 5.27.0 2020-Dec-09

### Added

- Support avatar image uploads (#3957)
- Poker reveal voting button implemented (#4392)
- Use next button for participants (#4349)
- Implement final score for poker meeting (#4396)
- Add summary for poker meeting (#4397)
- Implement adding Parabol task during scope phase of poker meeting (#4359)

### Fixed

- Poker meeting fixups (#4381)

## 5.26.0 2020-Dec-2

### Added

- Set Sprint Poker final score and push it to Jira (#4368)

### Changed

- Updated Sprint Poker drawer discussion thread (#4364)
- Sprint Poker UI clean-up (#4377)

### Fixed

- Multiple Sprint Poker bug fixes & polish (#4376)
- Fixed remove agenda item & setAppLocation bugs (#4380)

## 5.25.1 2020-Nov-19

### Fixed

- Reverted back to using header to determine client IP

## 5.25.0 2020-Nov-18

### Added

- Sprint Poker template UI w/o scales (#4310)
- Poker peekers (#4334)

### Changed

- Upgraded uWS to v18, now with upgrade callback (#4357)
- Invitation lifespan to 30 days (#4353)
- Initial Poker template has a single dimension (#4347)
- Added curve to poker deck (#4337)

### Fixed

- A handle of client-side bugs found in Sentry, likely due to Relay (#4354)
- Centered meeting bottom control bar (#4344)
- Language for invitation expiration (#4341)

## 5.24.0 2020-Nov-12

### Added

- Sprint Poker UI deck animations #4334

### Changed

- Sprint Poker estimate stage display in sidebar #4318
- Refactor atlassian jira auth #4312
- Increased invitation expiration time to 30 days #4335

### Fixed

- Race condition occurring when a retro meeting starts while a checkin is taking place #4329

### Deprecated

- Deprecated the `startNewMeeting` and `endNewMeeting` mutations in favour of meeting specific mutations #4330

## 5.23.0 2020-Nov-04

### Added

- Poker estimate mutations #4306
- Added `voteForPokerStory` mutation #4304
- Add new Jira issues in poker scope phase #4282
- Outlook email parser #4288
- Added Sprint Poker template scale backend #4232
- Parabol scope search #4274
- Adds poker card deck #4278

### Changed

- Bumped `mediasoup-client` package to `^3.6.21` #4292
- New meeting view UI controls updated #4275

### Fixed

- Fixed bug when copying retro templates #4294
- Task migration hotfix #4302
- Fixed summary topic order #4206

## 5.22.0 2020-Oct-13

### Added

- CLI to create new mutations (#4270)
- Jira Issue card in Poker Estimate Phase (#4262, #4245)
- meetingCount to User for HubSpot (#4259)
- Search Menu and Persisted Query Menu for Jira Scope Phase (#4256)
- MediaSoup package (#4204)

### Fixed

- Icebreaker Editing & flexbox issue for Safari (#4254)
- Check-in Agenda State (#4242)
- Removing template prompt bug (#4236)

## 5.21.0 2020-Oct-07

### Added

- Added undo grouping button to completed gouping phase #4253
- Sprint Poker: Jira integration, search, and scoping implemented #4241, #4231
- Added new starter templates for retro meetings #4220

### Changed

- Friendlier UI for tasks without assignees #4164

### Fixed

- Remove link to offensive rally song

## 5.20.1 2020-Oct-06

### Fixed

- SegmentIo client page call signature for Google Analytics

## 5.20.0 2020-Sep-30

### Added

- Remove shared templates by archived teams #4201
- Added tab access for due date #4135
- Poker Jira front-end (behind feature flag) #4158

### Changed

- New user task view #4105
- Multi-connection user presence with Redis #4147
- Bump GraphQL to v15 #4193

### Fixed

- Bug fix for first item in menu #4200
- Filter out teamIds in backup organization #4221
- Assign team task card to viewer #4223

## 5.19.1 2020-Sep-25

### Added

- Publish timeline events when a meeting ends (#4179)

### Fixed

- Toggle timestamp bug in task casks (#4187)
- Corrected Segment Google Analytics schema (#4190)
- Demo end meeting bug (#4192)

## 5.18.1 2020-Sep-18

### Fixed

- Remove trailing slash from intranet graphql url to fix graphiql

## 5.18.0 2020-Sep-16

### Added

- robots.txt to nginx (#4160)
- Retro Template Illustations (#4172)
- Revisit Check-in meetings (#4020)

### Fixed

- Invite UI Copy (#4168)
- Bump Node to v14 (#4154)

## 5.17.0 2020-Sep-10

### Added

- Production Dockerfile (#4103)
- Base scaffolding for new sprint poker meeting (#4113)
- Beginnings of frontend scaffolding for new sprint poker meeting (#4141)
- Enable fetching data from Parabol org for local development (#4089)

### Fixed

- Fix dev server hmr (#4134)
- Fix various Hubspot Segment bugs (#4142)
- Hotfix for on-premise deployment regarding SAML (#4126)
- Improved UI via automatic parsing for bulk email invite (#4131)
- Fix control bar undefined bug (#4121)
- Fix connect presence logic (#4149)

### Changed

- Make enableSAMLForDomain an upsert (#4087)
- Set Google Analytics clientId to Segment anonymous ID (#4117)
- Exclude timeline events from uninteresting teams (#4132)

## 5.16.0 2020-Aug-28

### Added

- Show who is commenting (#4050)
- New integration test DB tarball (#4078)
- Sprint Poker meeting type in new meeting carousel behind a feature flag (#4104)

### Fixed

- Bottom bar cover and floating snackbar (#4036)
- Discussion styling thread with long URL link; Lightened up the grey "ready" checkmark in meeting control bar (#4094)
- A couple of good fixes for invitation workflow (#4082)

## 5.15.1 2020-Aug-21

### Fixed

- Fix emoji pop up causing page lock up (#4096)

## 5.15.0 2020-Aug-21

### Added

- backupOrganization private schema query (#4089)
- logging for redis timeout errors (#4095)

### Fixed

- More robust invoicing for multiple unpause on the same user (#4089)

## 5.14.0 2020-Aug-14

### Added

- Shared Templates (#3942)
- DB tables for TemplateDimension and TemplateScale (#4042)
- Archived Items Checkbox on Task View (#4035)

### Fixed

- Refactor CustomPhaseItem to ReflectPrmpt (#4053)
- Disabled editing and due date slection on archived cards (#4047)
- Segment client initated events (#3942)
- Summaries show groups even if meeting was ended early (#3956)
- Menu navigation keyboard shortcuts wrap around (#4056)

## 5.13.1 2020-Aug-06

### Fixed

- Update OrgBillingView when CC is updated/added #3983
- Removed position sticky from timeline task header #4023

### Changed

- Various UI polishes #4026
  - Remove color hack on agenda icon
  - Yank punctuation on impertive tooltip copy
  - Swap meeting and team name for hierarchy
  - Fixes reaction button alignment in thread comments
  - Change inner padding to prevent clipping of card box-shadow

## 5.13.0 2020-Jul-23

### Fixed

- Don't show overlimit copy if user is a member of any paid org #3808
- Added required properties to segment track call for GA destination #3974

## 5.12.1 2020-Jul-17

- Internal metrics query fix
- Team creation timeline event was left as inactive when created

## 5.12.0 2020-Jul-15

### Added

- Added thread comments to the CSV export #3948
- Added automated screenshots for Parabol demo #3907
- Added `enableSAMLForDomain` mutation for private schema #3986
- Customized prettier for the Typescript file generated by [gql2ts](https://github.com/amount/gql2ts) #3995

### Changed

- Optimized metrics query to run faster #3978
- Set up config to enable client code debugging in VS Code #3985
- Deprecated `meetingSettingsByTeamId` in favor of `meetingSettingsByType` #3973

### Fixed

- Fixed source maps to enable debugging with breakpoints in VS Code #3982
- Fixed a typo for `utm_source` in meeting summary URL parameters #3977
- Fixed a typo in `DemoCreateAccountButton` #3972
- Fixed duplicate agenda item pins #3996

## 5.11.1 2020-Jun-29

### Fixed

- Merge duplicate users together

## 5.11.0 2020-Jun-18

### Added

- More segment events for the marketing team (#3911)
- Redis cache for the User object (#3924)

### Fixed

- Correctly get company based on orgId (#3919)
- Demo Export to CSV feature (#3926)
- Remove duplicate segment page event (#3941)
- Early termination of Checkin Meeting doesn't archive tasks (#3941)

## 5.10.1 2020-Jun-15

### Fixed

- Email password reset is now case insensitive

## 5.10.0 2020-Jun-10

### Added

- Check-in meeting agenda has a discussion thread (#3891)
- Agenda items can be pinned and persist across check-in meetings (#3892)
- Users can delete the account and leave feedback (#3905)
- Allows for custom plans in enterprise invoices (#3906)

### Changed

- A tooltip prompts users to tap again to confirm advancing or ending the meeting
- Updates the bottom bar control UI color usage
- Removes the tooltip on the timeline meeting event card menu (#3881)
- Removes the calendar event CTA section from the check-in summary (#3877)

### Fixed

- Fixes breaking changes to the demo (#3908)
- Fixes to Segment function (#3903)
- Miscellaneous bug fixes (#3898)
- Fixes for Cypress and demo tests (#3869)
- Guarantees all emails are lowercase in the database (#3889)
- Fixes graphql pubsub unsub (#3894)

## 5.9.1 2020-Jun-05

### Added

- Added email to all segment track events for slack integration

## 5.9.0 2020-Jun-02

### Added

- Company entity to group organizations (#3883)
- Segment Destination functions (#3883)

## 5.8.0 2020-May-21

### Added

- Retro template prompts now have customizable colors (#3722)

### Changed

- The Social Check-In phase is now called Icebreaker (#3850)
- Moved the invitation shortlink to the env (#3865)

### Fixed

- Fixed identify on the client for hubspot (#3872)

## 5.7.1 2020-May-15

### Fixed

- Only prompt next confirmation when on the last stage in phase

## 5.7.0 2020-May-13

### Fixed

- Throw error instead of string when redis response times out (#3847)
- Topic links on meeting summary emails (#3843)
- Remove wait pattern in cypress demo_discuss tests (#3837)

### Added

- email attribute to segment page events (#3847)
- support for other mail providers (#3838)
- Confirm on next and end buttons (#3823)

## 5.6.1 2020-May-12

### Fixed

- Put timeout on fetch to google

## 5.6.0 2020-May-06

### Fixed

- Ghost snackbar covering up meeting control bar (#3819)
- Empty emails when meeting is killed early (#3819)
- Correct active meeting current state (#3819)
- Can start retro when action is in progress (#3819)
- Scrolling in development works in firefox (#3813)
- Stripe removing a paused user (#3810)
- \_\_dirname incorrect in dev mode (#3806)

## 5.5.1 2020-Apr-30

### Fixed

- Save progress in demo

## 5.5.0 2020-Apr-24

### Added

- Stateless GraphQL Executor (#3771)
- Toolbox webpack config built separetely
- 1 command development & build
- More cypress tests (#3795)
- Comment count to the retro summary (#3777)

### Changed

- Server assets now built with webpack (#3771)
- Illustrations for upgrades & meetings (#3785)
- .env now lives in the project root (#3771)

### Removed

- Google Analytics bootstrap (#3798)

## 5.4.0 2020-Apr-16

### Added

- Floating bottom bar in meetings (#3723)
- Ready button in meetings (#3723)
- Add utm params to emails (#3736)

### Fixed

- No redirect on meeting end if not in meeting (#3736)
- WebRTC DataChannel safely sends (#3747)

## 5.3.1 2020-Apr-10

### Added

- GQL Request logging

## 5.3.0 2020-Apr-03

### Fixed

- Demo Discussion Topics were all concated together
- Add Team button appears on dashboard's leftnav when using iOS mobile

### Added

- "Report feedback" for fatal bugs (#3714)
- Custom voting (#3707)
- "Settings & Integrations" link added to Team Dashboard

### Changed

- New Meeting Snackbar created for new meetings (<5 mins ago) (#3713)

## 5.2.1 2020-Mar-26

### Fixed

- Broken timer

## 5.2.0 2020-Mar-25

### Added

- Links to discussion items in the meeting summary (#3708)
- Links to old meetings in the timeline events (#3683)
- Ability to re-enter old meetings (#3683)
- Tests for Group phase (#3665)

### Fixed

- Sanitize jpg user avatar uploads (#3706)
- Show task errors in footer (#3696)
- Calls to stripe are Atomic and throttled (#3673)
- Handful of Sentry fixes (#3670)
- case-insensitive email addresses (#3667)

## 5.1.0 2020-Mar-22

### Added

- Internal slack pulse

## 5.0.1 2020-Mar-18

### Fixed

- createTask borked with segment

## 5.0.0 2020-Mar-16

### Added

- Threaded Discussions

### Changed

- Replaced .googlecloudkey with .env vars

## 4.24.0 2020-Mar-04

### Added

- Can now archive an organization (#3625)
- rel="canonical" tags on all public routes (#3623)
- tags to mailgun emails (#3616)

### Fixed

- Disabled ability to create multiple simultaneous check-in meetings (#3626)
- Handful of small sentry bugs (#3628)
- Require longpress on mobile to drag reflection cards (#3624)

### Changed

- Renamed action to check-in (#3620)
- Upgrade typescript, sucrase (#3618)
- Rename timebox to time limit (#3617)

## 4.23.2 2020-Mar-02

### Fixed

- Attempted fix to reduce unauthed clients to init websockets

## 4.23.1 2020-Feb-26

### Fixed

- Extra logs to track down why unauthed clients init websockets

## 4.23.0 2020-Feb-17

### Added

- graphql-jit for faster GraphQL resolutions (#3580)
- threadSource, threadId to task. Replaces agendaId, reflectionGroupId (#3579)
- Comment entity to backend (#3579)

### Removed

- assigneeId from Task (remnant of soft team members) (#3576)
- reflectionGroupId, agendaId from Task (#3579)

## 4.22.0 2020-Feb-11

### Added

- User-defined schema to RethinkDB types (#3556)
- Nagging snack for over limit copy (#3566)
- Left nav teams broken out by organization (#3567)
- Tooltip to Task icons (#3564)

### Changed

- Notification page to notification menu (#3556)
- Notifications are never deleted (#3556)
- Segment end meeting event (#3569)

## 4.21.1 2020-Feb-07

### Changed

- Increase max prompts from 5 to 12
- Add Accounts Payable email for enterprise invoices

### Fixed

- Drop reflection flicker regression
- Mass Invitation token did not always refresh

## 4.21.0 2020-Feb-04

### Added

- Meeting phase to active meeting menu (#3493)
- Real-time updating of meeting name (#3532)
- Page name to mobile views (#3487)
- Blacklisted domains requiring email verification
- Refetch query on reconnect (#3020)

### Fixed

- No bouncing next when timer is running (#3495)
- Rename server secret .env var (#3482)
- Missing demo avatars (#3516)
- Missing demo timer (#3516)
- Collapse on escape (#3284)
- Janky grouping demo animations
- Bad reconnect logic (#3502)
- Editing status not firing (#3507)
- Cancel drags in expanded groups (#3560)
- Cards occassionally not being dragged

## 4.20.1 2020-Jan-30

### Fixed

- Reflection column height overflow (#3525)
- Team lead self-demote (#3530)
- Bork when inviting existing team member
- Hide facilitator bar when meeting is over
- Fix user-defined RegEx (#3201)
- Reflection expand/collapse animation (#3490)

## 4.20.0 2020-Jan-28

### Added

- Refresh button to check-in question
- Active meetings to the new meeting view

### Changed

- Upgraded to Relay v8.0.0
- Use meeting names in copy instead of the type of meeting

## 4.19.0 2020-Jan-23

### Changed

- Made a first pass at implementing the new dashboard IA see #3488
- Avatars only appear in the meeting when actually in the meeting view see #3496
- The meeting lobby remembers the last meeting type a team has run see #3501
- Updated uWS to v17.1.0 see #3512

### Fixed

- Made several bug fixes in a single PR see #3494
- Made minor fixes in the meeting lobby see #3500
- Bumped the version of uWS to clear up some errors see #3512

### Removed

- Dataloader caching per user see #3512
- Sending sentry errors for service worker scopes #3512

## 4.18.0 2020-Jan-15

### Added

- Reactjis during Discuss Phase
- Editable meeting name

## 4.17.5 2020-Jan-13

### Removed

- Disabled Datadog apm

## 4.17.4 2020-Jan-13

## Fixed

- Upgraded to Node v13.6.0, no longer treat RethinkDBError as an unhandledRejection

## 4.17.3 2020-Jan-12

## Added

- pm2 to production deploy with mem limit (~1.2G)
- Datadog apm

## 4.17.2 2020-Jan-10

### Fixed

- Safely handle closing websocket that doesn't yet have a connection context

## 4.17.1 2020-Jan-10

### Fixed

- Use forwarded IP address instead of IP of reverse proxy

## 4.17.0 2019-Dec-20

### Fixed

- ratelimiter for forgot example/bad login
- Memory leak in Relay SSR

### Added

- uWebSockets.js
- Session invalidation on password reset

### Removed

- Express.js, cws
- Auth0

### Changed

- Refactored dataloader to be much more memory efficient
- Shorter mass invite links #3469

## 4.16.1 2019-Dec-18

### Fixed

- querystring parsing for SAML urls with search params

## 4.16.0 2019-Dec-10

### Changed

- Broke GraphQL into 2 services
- Refactored objects to classes for easier memory leak debugging

### Added

- DataLoaderCache
- GraphQLRedisPubSub

### Fixed

- Memory leak traced to resolve fn in pullQueue of graphql-redis-subscription
- Borked version of GraphiQL

### Removed

- dataloader-warehouse
- graphql-redis-subscriptions

## 4.15.0 2019-Dec-04

### Added

- New meeting lobby (#3364)
- Optional check-in phase (#3364)
- console.logs for monitor when meeting summary does not scroll (#3397)
- Initial support for VSCode (#3398)
- Server debugger support for VSCode (#3400)
- A lightweight heap profiler that runs every hour (#3399)
- A heavy duty heap dumper that should only be run when there is no server load (#3399)

### Fixed

- GraphiQL Public Schema (#3397)
- Cannot vote on optimistic reflection groups (#3397)
- Snackbars can handle error string and object (#3397)
- GraphQL validation error when an abstract object could return a null or non-null of the same name (#3398)
- FOUC for Material Icons (#3400)
- Gracefully handle fetches that fail when Google's language API is down (#3400)
- Times in Slack notifications are relative to the timezone of whomever sent the message (#3400)
- Subscriptions work after initial login (#3400)
- AcceptTeamInnvitation has correct error when login credentials are wrong (#3405)

### Changed

- Disconnecting does not promote someone else to facilitator (#3397)

## 4.14.0 2019-Nov-27

### Added

- A subscription channel for each meeting (#3376)

### Removed

- Auth0 (#3372)

### Fixed

- Race condition to 2 votes (#3367)

## 4.13.1 2019-Nov-20

### Fixed

- Auto-checkin meeting members who joined the team after a meeting started
- Gracefully handle group/ungroup errors

## 4.13.0 2019-Nov-19

### Fixed

- Summary intermittently couldn't scroll (#3361)
- Errors caused by updateTask didn't show on the Task card (#3361)
- Empty reflections are now removed when completing the grouping phase (#3361)
- Empty tasks are removed before generating the meeting summary (#3361)
- Reflections being edited while advancing to the vote stage would stay editable (#3357)
- Drop animations for reflections at the bottom of a column (#3336)

### Added

- Back button to the Forgot Password view (#3358)
- Transitions to online avatars in the meetings (#3356)
- Backend support for an optional check-in round (#3355)
- Ability to add reflections from the Reflect phase while the Group phase is still in progress (#3354)

### Changed

- Invite Dialog View (#3351)
- Moved meetings from /meeting/:teamId to /meet/:meetingId to support future multi-meetings
- E4E Policy to reflect new funding round (#3347)
- Upgraded to Typescript 3.7
- Upgraded a bunch of other dependencies

## 4.12.0 2019-Nov-11

### Fixed

- Janky reflection animation when dropping & animating to the bottom of a scrollable column (#3297)
- Sentry bugs from Nov 6 - 11
- Regression where viewer could not add/remove reflect templates

### Removed

- Redux (#3323)

### Changed

- Refactored all old patterns that relied on unsafe react methods (#3323)

## 4.11.0 2019-Nov-06

## Fixed

- Janky expand/collapse reflection animation (#3322)
- Create reflections in demo group phase (#3321)
- Z-Index levels (#3320)
- Timer reset on stage change (#3319)
- Meeting sidebar headers (#3314)

### Changed

- Set client/server envs on Sentry (#3311)
- Upgraded to Relay v7 (#3306)

## 4.10.1 2019-Nov-04

## Fixed

- Mid-meeting invitation would reset meeting (hotfix)
- Bumped Cypress version to fix CI breaks

## 4.10.0 2019-Oct-31

### Fixed

- Randomize check-in order for retros (#3226)
- Removed a handful of calls to Sentry to reduce noise (#3292)

### Changed

- Moved to rethinkdb-ts driver from rethinkdbdash (#3285)

## 4.9.0 2019-Oct-16

### Fixed

- Editor crash on undefined mentions (#3272)
- Allow scrollable sections in meeting left nav (#3264)
- Fix team member name update (#3258)
- Redirect to correct meeting if hit the wrong url (#3257)

### Removed

- Legacy LoadableDraftJSModal (#3273)
- react-dnd & friends from deps (#3267)
- Active meeting dialog on team dash (#3262)

### Changed

- Meeting Avatar Group only shows connected members (#3266)
- Show retro groups without votes in discussion phase (#3260)

## 4.8.3 2019-Oct-15

### Fixed

- Delete single record for startNewMeeting race

## 4.8.2 2019-Oct-10

### Fixed

- Spelling error on sidebar "Faciltator" to "Facilitator"

## 4.8.1 2019-Oct-09

### Removed

- dumpy, the memory leak debugging tool, from starting on startup

## 4.8.0 2019-Oct-09

### Added

- New meeting sidebar
  - New mobile-friend control to appoint facilitator
  - Shows each meeting stage, and its completion status, more clearly
- Show discounts on invoices, other invoice calculaton and display improvements
- Adds better logging for console errors
- We now typecheck client & server in parallel
- Lazy make auth0 manager

### Fixed

- Hopefully fixes #3120, summary unable to be scrolled until refreshed
- Fix #3194, this.editorRef.current.focus is not a function
- Fix #3195, cannot read property 'findIndex' of undefined
- Fix #3196, TypeError: t is undefined
- Fix #3198, TypeError: Cannot read property 'firstElementChild' of undefined
- Fix #3229, add tolerance to matching up Stripe invoice data
- Clear dataloader cache for new account logins

## 4.7.0 2019-Oct-02

### Added

- Adds Google Tag Manager to SSR (PR #3215)

## 4.6.0 2019-Sep-25

### Added

- New retrospective grouping experience:
  - Preserves columns while grouping
  - Group across columns
  - Add and edit new items during grouping phase
  - Works on mobile
- New conversion squeeze modal which is turned on by an admin mutation

### Removed

- Refactor of the way our color palette is defined and used in the app

## 4.5.3 2019-Sep-23

### Removed

- Google language client (source of memory leak since v3.16.0)

## 4.5.2 2019-Sep-23

### Added

- Dumpy to dump stack heap info when SIGPIPE received

### Fixed

- make start meeting more transactional to avoid duplicate start meetings

## 4.5.1 2019-Sep-20

### Removed

- Test removing Sentry to verify memleak

## 4.5.0 2019-Sep-19

### Changed

- Moved webhook GraphQL handlers to the private schema

### Fixed

- Billing leaders now see inactivity tag on Org Member view

## 4.4.3 2019-Sep-18

### Fixed

- False positive for "Login with Google" when tms does not exist on auth0 token

## 4.4.2 2019-Sep-12

### Added

- Support moving multiple teams to a single org & archiving empty orgs

### Fixed

- Clean up legacy tables in DB
- Corrected JWT expiry

## 4.4.1 2019-Sep-11

### Fixed

- IdP-initiated login flow

## 4.4.0 2019-Sep-11

### Added

- Added enterprise invoicing (#3158)

## 4.3.2 2019-Sep-06

### Fixed

- Service worker no longer caches HTML documents, fixes SAML login
- Cypress credentials

## 4.3.0 2019-Sep-05

### Added

- SAML support

### Fixed

- UI touchups (Pro tag, timeline padding)

## v4.2.0 2019-Aug-28

### Added

- Modal at beginning of demo

### Removed

- Aprhodite in favor of emotion

### Fixed

- Various UI touch-ups:
  - uniform gutters for task column header
  - fixes ellipsis
  - fixes due date bg color
  - improves editing + due date block layout
  - Organization list now a responsive layout

## v4.1.0 2019-Aug-14

### Added

- Mobile-first reflect phase (#3087)
- New check-in questions (#3086)
- Task columns now use `react-beautiful-dnd`

### Changed

- Adds the lemma to the reflection when it is created/updated instead of when the reflect phase is complete (#3092)
- The Pro tier is now \$6 per user per month

### Fixed

- Many, many meeting bug fixes
- Fixed issues with tasks
- Fixed group demo animations & discuss overflow (#3097)
- Fixed another agenda scrolling regression

## v4.0.1 2019-Aug-09

### Fixed

- Temporarily remove tags from sentry to see if it caused mem leak

## v4.0.0 2019-Aug-05

### Added

- New repo, new major version: now a Parabol is a monorepo!
  - The client now has its own (much shorter) `package.json`
  - The client, server, testing suite, and service worker now all get their
    own tsconfig which means we can do much faster typechecking on incremental
    builds
  - We now use sucrase instead of babel to build the server, which means faster
    server startup (almost 75% faster!)
  - We can share `const enum` values across the client and server
- Added a service worker to manage the local cachng of files: Parabol is much
  snappier after it loads!
- Helpers to load cross-site SVG and Javascript files

### Fixed

- Timer snackbar z-index (#3050)
- Fix theme color (address bar on mobile)

### Removed

- We no longer depend on Fontawesome

## v3.17.2 2019-Jul-30

### Fixed

- Agenda list cannot be scrolled (#3070)

## v3.17.0 2019-Jul-26

### Added

- Segment events for team invites (#3040)
- Segment events for meeting timer (#3039)

### Changed

- Toasts to snackbar (#3026)
- Upgraded Relay to fork of v5 (#3014)
- Upgraded react-beautiful-dnd to v11 (#3041)
- Upgraded a bunch of smaller deps (#3041)

### Fixed

- Login bug for safari users (#3038)
- Calendar Schedule CTA in Action Meeting Summary (#3042)

### Removed

- auth0-js (#3038)
- iterall, known mem leak, but unsure if affects us (#3023)

## v3.16.2 2019-Jul-15

### Changed

- Updated sentry
- Send new error message for offline default facilitator
- Add tags to rate limiter sentry event
- Ignore 429 error and google nlp error for sentry

### Fixed

- Patched dataloader-warehouse
- Prevent duplicate SSE error events for the same user
- Prevent duplicate end meeting mutations sent from client
- Prevent missing getMasonry event on demo

## v3.16.1 2019-Jul-10

### Fixed

- ResizeObserverPolyfill wrong import

## v3.16.0 2019-Jul-10

### Added

- Mass invite link to the team invitation modal (#2994)
- Single cards can have group titles (#2990)
- Swipeable mobile left nav for dash and meeting (#3008)
- Improved logic for automatic facilitator selection (#3010, #2985)

### Fixed

- Timebox works on facilitator change (#2984)
- No bounce for async stage (#2982)
- Can’t remove child on portal (#2991)
- Scroll to agenda input if needed (#2900)
- Ignore unsupported Google NLP languages (#2850)
- Tags correctly sent to sentry (#2849)
- Handle rate limit reached (#2977)
- Improved responsive view styles (#3009)

## v3.15.0 2019-Jun-25

### Added

- Timer, Time Box, and associated Slack notifications
- Added SU permission to `resolveForBillingLeaders()`

### Fixed

- Segment fixes:
  - Capitailze first letter of meeting names
  - `identify()` events were occasionally passing the wrong HubSpot traits
  - renamed `name` trait to `parabolPreferredName`
  - Other misc fixes

### Removed

- Segment identify() call when viewer changes
- Some cruft from `ui.js`

### Fixed

- capitalized segment Meeting Completed events (#2916)

## v3.14.0 2019-Jun-19

### Changed

- Moved integration OAuth flow into their respective managers
- Refactored all flow components to typescript
- Improved handling of browsers without permissions API

### Removed

- Legacy Provider mutations
- Need for calling postdeploy in development

### Added

- Invite emails and dialog views conditionally have active team meeting context
- A primary button Create Free Account was added to the demo in the top bar and invite dialog

## v3.13.0 2019-Jun-12

### Changed

- Refactored the Slack integration to support target UX for team and personal notifications

### Fixed

- Create new stripe subscription after a failed payment followed by a CC update

### Removed

- Legacy meeting fields on the Team object in the DB

### Added

- New stripe per-event handling

## v3.12.0 2019-May-29

### Added

- Persist queryMap to DB, this allows folks to complete their old
  queries after a server upgrade.

### Fixed

- Org avatar input layout
- Team archive grid layout
- #2902 avatar shape
- Wonky invoice layout with wrapping div, bg colors

## v3.11.2 2019-May-28

### Fixed

- Meetings for safari users (support window.matchMedia)

## v3.11.1 2019-May-28

### Fixed

- Borked end action meeting (fast-rtc-swarm)
- Action Meeting Title

## v3.11.0 2019-May-15

### Changed

- Refactored Action meeting to new meeting format
- Refactored email summary to support GMail mobile app

### Fixed

- Redirect from /invtation-required

## v3.10.1 2019-May-14

### Fixed

- RemoveTeamMember now works (#2880)

## v3.10.0 2019-May-08

### Added

- New Segment events to track logins, adding Jira or GitHub cards, and opening help menus in the Retro

## v3.9.0 2019-May-01

### Added

- Fallback editor for Android

### Fixed

- Forgot password link

### Changed

- Use Google colors for OAuth2 Button
- Menus across entire app

## v3.8.2 2019-Apr-29

### Fixed

- call to missing primeStandardLoader

## v3.8.1 2019-Apr-25

### Fixed

- provider map borked team integrations if GitHub integration exists
- Error when publishing to Jira (#2829)

## v3.8.0 2019-Apr-24

### Added

- Jira integration for issues (#2807, #2814)
- GitHub integration direct from Task card (#2807)
- Extra traits on users when retro meeting ends (#2818)
- Extra call to identify on meeting end (#2795)
- Over free tier alert (#2797)
- Retro prompt descriptions (#2703)

### Removed

- Auto-end for long-running retrospective meetings (#2819)

### Changed

- Only allow 1 signup per email, regardless of OAuth or Email/pass

## v3.7.2 2019-Apr-03

### Fixed

- Borked demo from featureFlags

## v3.7.1 2019-Apr-02

### Added

- Improvements to beta video functionality (#2762)

## v3.7.0 - Unreleased

### Fixed

- New version toast (#2760)
- Superuser access to teams via orgs (#2754)

### Changed

- Tasks are blurred on Enter (#2751)

### Added

- Atlassian Integration OAuth via feature flag (#2743)
- Video alpha (#2726)

## v3.6.1 2019-Mar-14

### Fixed

- Demo was broken by #2712

## v3.6.0 2019-Mar-13

### Added

- Spellcheck to cards (#2706)
- Cypress.io tests
- Aggressive sub-powered query caching (#2712)

### Fixed

- Squelch Google NLP unsupported languages (again)
- Updated linter (#2725)
- Fix infinite recursion when facilitatorPhaseItem is invalid (#2724)
- Fix buld:dll (#2719)
- Lock check-in question editing to facilitator (#2718)
- Fix DashAlert when page is scrollable (#2714)
- Use Intersection Observer to detect when to load more (#2714)
- Bug allowing endNewMeeting to be called twice (#2650)
- Multiple logout bug (#2712)

### Removed

- Legacy invitation patterns & tables

## v3.5.1 2019-Feb-28

### Fixed

- OAuth Login problems
- Reset password problem

## v3.5.0 2019-Feb-25

### Added

- Sentry captures for OAuth failures (#2682)
- invitation-required fallback for visiting team-only view (#2667)

### Fixed

- Missing agendaId in demo (#2678)
- dataloader cache miss for missing NewMeeting (#2679)
- Sort ordering of template prompts (#2677)
- Squelch unsupported language errors from Google NLP (#2680)

### Changed

- Upgraded plenty of dependencies, notably Typescript (#2637)
- Re-implemented DLLs for faster development (#2637)
- Refactored all routes to use React.lazy (#2646)

### Removed

- react-portal-hoc (#2659)

## v3.4.1 2019-Feb-21

### Fixed

- Meeting Summaries available for archived teams

## v3.4.0 2019-Feb-08

### Fixed

- Can delete last card in demo (#2633)
- Bad teamId in url redirects to /me (#2635)
- Stuck floating card during group phase (#2610)
- Errors reported to sentry have a better stack trace (#2631)
- Viewer connection state updates when offline (#2555)
- Editing detection logic during Reflect phase (#2601)

### Added

- Source maps to app and sentry
- Active tasks column to team timeline
- Heuristics to detect phase completion (#2601)

### Changed

- User Settings renamed to User Profile
- Upgraded to Relay v2.0.0
- Use persisted queries instead of full query text

### Removed

- redux-form
- Usage of legacy React context

## v3.3.0 2019-Jan-31

### Added

- Timeline, Suggested Actions, What's New

### Fixed

- Stored XSS through SVGs
- Meta tags

### Removed

- Welcome wizard

## v3.2.0 2019-Jan-24

### Changed

- Switching between sign-up/sign-in forms now preserves entered email
- Add anonymous segmentId to login payload, aliasing to authenticated user
- Eased friction adding free users to organizations

## v3.1.0 2019-Jan-09

### Changed

- New invitation UX (see PRs #2550, #2556 and issues #2537, #2538, #2539, #2540)
- Refactored the relationship between organizations and their users (see PR #2560 and issue #2547)

### Fixed

- Check-in prompt editing UX #2548
- Organization help card styles #1968

## v3.0.0 2018-Dec-19

### Changed

- FREE! The whole thing is free!
- New Pro accounts cost \$12/user/mo

### Fixed

- Fixed due date color for past-due items
- Fixed check in question updates

## v2.21.0 2018-Dec-05

### Added

- Improvements to completed retro phases (PR #2518)
- Support page events for non-users (PR #2520)

### Changed

- Refactor redux out of toasts (PR #2501)

### Fixed

- Fixed remove provider (PR #2517)
- Fixed agenda input behavior issue for Safari (Issue #2521)

## v2.20.3 2018-Nov-27

### Fixed

- Can add GitHub repos #2347

## v2.20.2 2018-Nov-18

### Fixed

- When su permissions given: can run downgrade mutation & request certain
  nested team & org fields

## v2.20.0 2018-Nov-14

### Added

- Animations to demo help menu
- Downgrade mutation on the backend
- Click-to-expand ellipsis in the meeting summaries for reflections and tasks #2497

### Changed

- Team invite & notification emails look better

### Fixed

- Fix #2397 team name now updates without refresh
- Fix #2454 Use OS-specific keys in help modal
- Retro card groups now match the reflection group style
- Org Approvals are now visible to everyone on the team
- Minification bug caused export to CSV to fail
- Agenda list migrated to react-beautiful-dnd
- All components using react-beautiful-dnd now accurately update when dragging top to bottom

## v2.19.0 2018-Nov-07

### Added

- Added CSV download link to retrospective meeting summary email

### Fixed

- Fix #1956 bug: remove user from org fails
- Fix #2400 completed reflect phase is read only
- Fix #2432 resize grid when tasks update
- Fix #2468 retrospective demo bug on quick DnD/grouping
- Fix #2469 Support mentions in demo tasks
- Fix #2482 Delete Task not always working
- Many retrospective meeting demo copy updates

## v2.18.0 2018-Oct-31

### Added

- The Retro Demo, ready to try in marketing funnel
- A new Check-In question (#1531)

### Fixed

- Fixed invoice pagination for organizations

## v2.17.0 2018-Oct-25

### Added

- Demo (first pass, not advertised)
- End Meeting button to all phases
- Export to CSV button for retros

### Changed

- Bottom nav buttons in meeting
- Moved vote details to top of phase

## v2.16.0

### Added

- Completed switched to Material Design icons

### Removed

- Completely removed Font Awesome icons

## v2.15.0 2018-Oct-10

### Added

- Introduces Material Design icons (PR #2434)

### Fixed

- Fixed sidebar toggle in retro lobby (PR #2431)

### Removed

- Yanked serif typeface (PR #2433)

## v2.14.0 2018-Sep-26

### Added

- facilitator tooltip for focusing a reflection column

### Fixed

- button elevation
- reflection spacing inside grouping modal
- removed emoji popover when no results are found
- resize handling when editing reflections during reflect phase

## v2.13.1 2018-Sep-20

### Added

- GraphiQL now supports requests to the private schema

### Fixed

- Corrected the private schema (some mutations were listed as queries)
- Moved su\* queries from the public to private schema

### Removed

- Public schema no longer supports CLI (all relevant queries were moved to private schema)

## v2.13.0 2018-Sep-19

### Added

- Retro UI updates:
  - Discussion phase reflections and tasks are now layed out using masonry
  - Many cosmetic updates to card and stack styling
- Should loading the app from the CDN fail, we'll load it from the `/static` dir from
  location the app was served.
  - This may help the app load behind particularly restrictive corporate firewalls
- Build scripts now automatically rebuild the dll when yarn.lock changes

### Fixed

- #1349 no dupe team name during team creation & update
- #2169 no more double duck flashes when switching teams
- #2328 add waiting status after new team submit
- #2343 sort orgs by team
- #2351 due date picker can't change old dates
- #2383 Retrospective autogrouping
- Stale meetings should now automatically end, we've fixed the `endOldMeetings` mutation
- Graphiql works once again, now uses our new trebuchet transport
- Graphql endpoint can now fallback to vanilla HTTP transport

## v2.12.0 2018-Sep-13

### Added

- Retro prompt templates: users can select, customize, and create templates (PR #2366)
- Upgraded to Babel 7 (PR #2367)

### Fixed

- Reflection cards have the prompt footer during the discuss phase (#2304)

## v2.11.0 2018-Sep-05

### Added

- New reflect phase with personal stack & chits
- Typescript

## Fixed

- Meeting progress now requires 2 presses of the right arrow & disallows Enter #2356
- Closing a menu returns focus to the toggle #2333
- The grouping phase modal has a box shadow #2331

### Removed

- Removed all flow files that referenced typescript HOCs #2352

## v2.10.0 2018-Aug-23

### Added

- New layout for the Retro Discuss phase, PR #2320
- Retro meeting help menus link to our Retrospective Meetings 101 content, PR #2308
- App now falls back to SSE connections when websockets can’t be used, PR #2318
- New elevation system for UI inspired by Material Design, PR #2248

### Fixed

- Hides private cards in meeting summary, PR #2330

## v2.9.0 2018-Aug-15

### Added

- Completed transition to keyboard accessible Menu component to entire site

### Fixed

- Tasks are marked as being edited when a menu is open
- Fix Storybook & add support for Relay
- Fix admin route access
- Fix emoji menu clicks and enter handling
- Can join a meeting when its currently in the grouping phase

### Removed

- Legacy Menu component from /newteam, task column and integrations

## v2.8.0 2018-Aug-08

### Added

- Moved Facilitator voting controls from sidebar to bottom bar #2185
- Thumbs up emojis everywhere in Retros #2305

### Fixed

- Fixed voting race conditions fixes #2206 (see PR #2307)
- Changed log in/create account labels and language #2246
- Changed check marks to thumbs-up in all aspects of Retro voting phase #2241
- Group grid layout updates on sidebar toggle #2256
- `yarn storybook` fixed for Webpack 4 and Relay #2260

## v2.7.0 2018-Jul-24

### Fixed

- Fixed case no. 1 of retro group race bugs #2279
- Fixed reflection card overwrites, now caching in-progress reflection state #2280

## v2.6.0 2018-Jul-18

### Added

- More check-in questions #2251
- Collapsible new meeting sidebar #2243
- Rate limiting to invitation mutations #2275

### Fixed

- Promoting to billing leader auto-accepts their pending invites #2247
- All credit card modals use the updated components #2245

## v2.5.1 2018-Jul-17

### Fixed

- Hotfix preventing abuse sending email to particular domains

## v2.5.0 2018-Jul-09

### Added

- Changed Retrospective Reflect phase to submit new reflections on pressing
  the enter key
  - Shift-enter now creates newlines
- Re-implemented Retrospective grouping:
  - Uses grid-based "masonry" layout
  - Shows multiplayer drags from other users
  - Groups now expand to their own modal
  - Groups now display a count of how many cards are in the group
- Voting phase now uses thumbs-up icon following user feedback
- A variety of new check-in questions
- In-line affordances given to members on pending team invites,
  see #2108

### Fixed

- Clarified wording of cards auto-populated for new users #1067

## v2.4.1 2018-Jun-28

### Fixed

- Bug in uglify borking legacy credit card modal

## v2.4.0 2018-Jun-27

### Added

- Quietly working on custom scrollbars, not used in the app yet (#2113, #1763, #2198)

### Changed

- Refactored buttons throughout the app: button variants created using Emotion, styled components (#2193, #1928)
- More components moved from Aphrodite to Emotion

### Fixed

- Dashboard nav team name overflow (#1029)

## v2.3.0 2018-Jun-13

### Added

- Webpack v4 config for smaller, faster bundles

### Fixed

- Flash of login screen before loading dashboard
- Interrupting chicken during retro discuss phase

### Removed

- server-side rendering
- support for legacy browsers (IE11)

## v2.2.0 2018-May-30

### Added

- You can now reorder the discussion topics in a Retro meeting #2088
- Minor Retro meeting style improvements

### Fixed

- Help button now accounts for window.scrollX, remaining in it's proper place
  a when a user scrolls

## v2.1.0 2018-May-23

### Removed

- Removed the custom welcome email (#2110)

### Fixed

- Fixed the pending tooltip for team invites (#2116)
- Fixed the persistent bouncing button (#2099)

## v2.0.1 2018-May-22

### Fixed

- No meeting member when user joins team after meeting started
- Moving tasks to other teams does not update assigneeId (#2143)

## v2.0.0 2018-May-16

### Added

- Retrospectives for the general public
- Prettier and StandardJS style formatting
- Upgrade modal
- Segment analytics for socket connect/disconnect events

### Fixed

- Spotty page events for segment
- Multiple subscription bug #2053
- Card error in Meeting Summary #2034

## v1.9.0 2018-May-09

### Added

- Auto-grouping improvements: ignore plurality and case when grouping
- Added #2064 end meeting button to Action meeting
- Added #2087 due dates on Task cards
- Backend support for #1980, adding nudges for Personal-tier users to upgrade to Pro

### Fixed

- Fixed #2052 pad auth0 1-char names
- Fixed #2063 auto-grouping improvements
- Fixed #2097 empty reflections showing up in retrospective group phase
- Fixed #2094 overlap of deep stacks of reflection cards
- Fixed #2104 team unable to vote if team member joins after retro meeting started
- Strikethrough keyboard shortcut

## v1.8.0 2018-May-02

### Added

- Users now have a filter search control on My Dashboard #1887

### Changed

- Labels in the retro meeting: Group phase (Group was Theme), [Upvoted] Topic (Topic was Theme) #2041
- Improves rotation of check-in questions based on team #1578

### Fixed

- Fixed vote count in retro summary email
- Fixed false toast for not having web sockets #1955
- Fixed false positive for firewall detection
- Fixed logic for app upgrade without requiring refresh #2006
- Fixed navigational issues with the new meeting type #2062 #2060 #1979
- Trivial fix for suOrgCount query
- Suppresses task involvement notifications during meetings #1659
- Fixed archive bugs (card layout and scrolling to load) #1927 #1900

## v1.7.1 2018-Apr-26

### Fixed

- Various retro bugs
- replaced react-beautiful-dnd with react-dnd

## v1.7.0 2018-Apr-25

### Added

- new signin logic
- async emoji support in retros

### Fixed

- email invitations
- New meeting styles

### Removed

- Auth0-lock
- Persisted redux state in local storage

## v1.6.1 2018-Apr-19

### Fixed

- Minor retro bugs #2022

## v1.6.0 2018-Apr-18

### Added

- First end-to-end feature complete retrospective features
- Retrospective meetings now masked behind user feature flag, not server feature flag
- Ability to add user feature flags to emails matching regex via addFeatureFlag mutation
- First pass at styling the retrospective meeting
- New seed team ids following Auth0 dev/staging account "bankruptcy"

### Fixed

- #1997 fixed failure upon new account creation, Auth0 API exception

### Removed

- Reliance on Auth0 client API; now using Auth0 Management API exclusively

## v1.5.3 2018-Apr-12

### Fixed

- Possible login fix with extra logging

## v1.5.2 2018-Apr-12

### Added

- Error logging to login mutation

## v1.5.1 2018-Apr-12

### Fixed

- Regression in Draft-js #1993

## v1.5.0 2018-Apr-11

### Added

- Latest retro meeting progress behind the release flag
- A batch of UI style updates for consistency and improvements
- Ability to identify pro users accurately
- Help dialog content in Action meetings

### Fixed

- Segment identify logic #1901

## v1.4.0 2018-Apr-04

### Added

- More check-in questions

### Fixed

- Clear filter after leaving team dashboard #1871
- Make dash filter menus keyboard accessible
- Use react-emotion for global CSS styles

## v1.3.0 2018-Mar-28

### Added

- New authentication pages
- Many aesthetic UI updates:
  - Avatars now use new palette
  - Forms updated to match latest styles
  - Email templates match latest styles
  - Settings views updated
  - Notifications updated
  - Cards polished
- New button to start specific meeting types (behind feature flag)
- Upgraded Sentry to newest API version
- Retro reflect phase (behind feature flag)
- Retro card grouping backend (behind feature flag)
- Retro card auto grouping and auto-theme naming (behind feature flag)
- Retro card voting backend (behind feature flag)

### Fixed

- Fixes for Node v9.9
- Private tasks (#1863)

### Removed

- Stopped asking welcome wizard user for invitee's priority for the week
- Auth0 Lock

## v1.2.0 2018-Mar-21

### Added

- Retro card groups #1729 (behind feature flag)
- Retro social check-in #1741 (behind feature flag)
- Retro Backend: Creating & Editing Reflections #1742 (behind feature flag)

## v1.1.1 2018-Mar-19

### Fixed

- Regression that would mark team members present when absent was selected

## v1.1.0 2018-Mar-14

### Added

- Meeting views were updated to be closer to latest visual concepts
- Meeting views now have a designated control bar for grouping facilitation affordances
- Now using raven to handle server errors
- Added the new lobby UI for retro meetings

### Fixed

- Fixed #1866 infinite loop if you attempt to access admin without admin rights
- Fixed client-side error handling for graphql errors in http and ws
- Fixed #1740 phase navigation mutation on backend
- Fixed invoice history to show when truly paid instead of pending
- Fixed dataloader exceptions
- Fixed the ability for admins to impersonate

## v1.0.0 2018-Mar-07

### Added

- Client-side filtering behind the localFilter release flag
- A complete style makeover!
- React storybook!
- Retro cards inside storybook
- Hubspot tiering traits
- Retro meeting lobby (front-end without UI)

### Fixed

- Intranet GraphQL Ping query
- Auto-endMeeting now has dataloader and does not throw
- Notification bell highlighting goes away correctly #1806
- Team payment status is propagated in real time, no need for a refresh #1821
- Some links would refuse to be entered into a task #1791
- Wrong optimistic task when creating a task for someone else #1665
- Modal appears correctly and menu items inside it close correctly #1801
- Agenda doesn't jitter on the bottom #1734
- Agenda scrolls correctly #1802

### Removed

- Lengthy tests before deploying to development server

## v0.30.2 2018-Mar-05

### Fixed

- Don't log out when a bad invite token is attempted
- Keep dispatch after logout
- Show welcome toast to new team members (missing dispatch)

## v0.30.1 2018-Mar-01

### Fixed

- Hotfix for #1817, no longer require active subscription to update credit card

## v0.30.0 2018-Feb-28

### Added

- activeProOrgCount and activeProUserCount queries
- Change the team a card belogs to from _My Dashboard_ (#1474)
- Password recovery page (behind `newSignIn` release flag)
- Retro CTA to team dashboard

## v0.29.0 2018-Feb-21

### Fixed

- fixed withCoords
- added new sign-in page (controlled by `newSignIn` release flag)

## v0.28.1 2018-Feb-19

### Fixed

- unsentMessageQueue never released queries and mutations (#1775)

## v0.28.0 2018-Feb-14

### Added

- Done items in the meeting summary

### Fixed

- Connectivity messages for socket disconnects/reconnects/firewalls

### Removed

- SocketCluster in favor of vanilla uws

## v0.27.2 2018-Feb-11

### Fixed

- Regression caused by incomplete project -> task refactor (#1728)

## v0.27.0 2018-Feb-07

### Added

- Scroll to active agenda item during meeting
- Renamed Project to Task

### Fixed

- Minor style updates

## v0.26.1 2018-Jan-31

### Fixed

- E2E Timeouts

## v0.26.0 2018-Jan-31

### Added

- Soft team members

### Fixed

- Errors on removed team members (#1664)
- Regression in agenda list flow (#1668)
- Private cards showing up during updates phase (#1604)
- Vanishing links in cards (#1656)
- Integration regression (#1667)

## v0.25.0 2018-Jan-24

### Added

- Feature flags
- Message on websocket disconnects

### Removed

- Cashay. We're 100% Relay!

## v0.24.1 2018-Jan-10

### Fixed

- Unresponsive filtered add project button #1634

## v0.24.0 2018-Jan-08

### Added

- DataLoader to backend
- GraphQL mutation-based subscriptions
- Persisted presence

### Fixed

- Copy edits throughout meeting
- Scrolling card drag-n-drop
- Various notification bugs and inivtation logic

### Removed

- Dependencies on Cashay for all but user/org

## v0.23.0 2017-Nov-17

### Added

- Notifications when someone assigns/mentions you a task
- Create projects from your own meeting updates phase
- Send daily re-engagement emails when users have notifications in their Parabol inbox

### Fixed

- Security bug #17
- Homogenized notifications layout

### Fixed

- #1455 Database migration removing billing info from personal Organizations

## v0.22.2 2017-Nov-08

### Fixed

- #1455 Database migration removing billing info from personal Organizations

## v0.22.1 2017-Oct-26

### Fixed

- #1445 Regression where team archive was not viewable

## v0.22.0 2017-Sep-23

### Added

- Tooltip component
- Freemium UI implemented
- Invoices paginated
- End-to-end test framework and initial authentication tests
- Ability to edit the meeting check-in question for Pro teams

### Fixed

- Meeting link copier properly links to meeting lobby
- Toast alerts stay around for 10 seconds
- Stripe webhooks secured with webhook secret
- When moving to the next agenda item in a meeting, users adding project cards
  for the current agenda item stay behind until they're done editing
- Upgrade to React 16
- New Team/Organization workflow consolidated
- Authentication tokens get their own subscription channel
- Refactors
  - Moving GraphQL client code from Cashay to Relay Modern
  - Stripe webhook handlers change DB state through GraphQL

## v0.21.2 - 2017-Oct-23

### Fixed

- #1438 Fixed uncommon TypeError in SocketRoute component

## v0.21.1 - 2017-Oct-09

### Fixed

- #1373 Regression with null aud field on the JWT

## v0.21.0 - 2017-Sep-23

### Added

- When a user already belongs to Parabol, invitations arrive as notifications,
  not emails
- Moved the changeFacilitator, notification, invitation, and acceptance logic
  from cashay to relay
- Facilitation hints added to Updates, last Agenda Item
- Many new unit tests
- Smaller stuff:
  - Bumped node version to v8.5.0, bumped yarn version to v1.0.1
  - Card footer, owner label updates, ProjectEditor styles updated
  - Now loads Notifications system asynchronously
  - Improved leading blank line validation
  - Added more robust mock pub/sub for testing

### Fixed

- #788 adds meeting count to summary header
- #883 double alert modal layout
- #964 no same-day, same check-in question
- #1023, #1069, #1181, #1164, #1197, #1198, #1202, #1291, #1251, #1282 meeting
  process updates and fixes
- #1056, #1283 summary email content order
- #1119 correctly end stripe subscription for extendTrial
- #1175 focus url field when making link
- #1194 remove empty blocks from project top
- #1277 trial modal blocks left nav
- #1318 tagging seed projects
- #1340 bad invitation expirations on prod
- Fixed infinite loop & upgrade front-end router
- Segment event error when creating first team

### Removed

- Removed `webpack-shell-plugin`, `appTheme.json` now build from
  `npm run build:theme` and `npm run build:deps`; eliminates race condition
  during build

## v0.20.9 - 2017-Sep-02

### Added

- Upgrade to Node.js v8.4.0

### Fixed

- #1320, sendSegmentEvent exception (fixed by Node version update)
- #1317 TypeError: Cannot read property 'getIn' of undefined
  - Fixed by private fork of draft-js

## v0.20.8 - 2017-Aug-31

### Fixed

- #1312 getLength on truncateCard

## v0.20.7 - 2017-Aug-25

### Fixed

- #1303 Link Changer modal broke & caused an infinite loop

## v0.20.6 - 2017-Aug-24

### Fixed

- #1177 ensure that `teamId` and `orgId` are populated on most page load events
- #1179 no footer icons when menu is open
- #1193 teamIds to teamId
- #1206 semicolon delimitation on invites
- #1229 no space before new link
- #1233 add your first repo from meeting
- #1241 duplicate tags extracted from projects
- #1248 don't let repo admins unlink, destroy the repo if they get removed
- #1255 modal shudder
- #1258 Outcome Card editing state turns off when the link modal is open
- #1270 Archived Projects do not show up for some teams
- #1275 project placeholder
- #1279 portal remounts during unmount
- #1291 failed post-meeting emails
- #1298 failure on first github provider created
- #1299 bad rejoin facilitator logic

## v0.20.5 - 2017-Aug-16

### Removed

- Snyk (for now)

## v0.20.4 - 2017-Aug-16

### Fixed

- #1260 missing team names
- Upgraded to webpack 3, GraphQL 0.10.5, and much more

## v0.20.3 - 2017-Aug-14

### Fixed

- #1242 anyone can assign any team member
- #1252 fix several are editing bug
- #1253 regression on clicking card menus

## v0.20.2 - 2017-Aug-14

### Added

- add an adminUserId to every github integration

### Fixed

- #1239 Octocat styling regression

## v0.20.1 - 2017-Aug-14

### Fixed

- #1243 facilitator tethering issue
- #1246 be safe with createFromContent

## v0.20.0 - 2017-Aug-11

### Added

- Basic Slack integration:
  - Add integration in Team Settings to Slack channels of your choice
  - Get notified when a meeting begins and ends
- Basic GitHub integration:
  - Access integration settings from Team Settings
  - Create GitHub issues from project cards
  - Basic infrastructure laid for receiving webhooks from GitHub
- Pattern for animated transitions
- Fancy new menus for Project Cards
- Relay and our very own Relay pub/sub pattern

### Fixed

- #1135 yanks action email graphic
- #1128 toggle label for org members
- #1055 agenda prompt and create card UI text
- #1054 name prompt and #460 progress dots
- #1033 Updates is proper OOUX label
- #551 timestamp toggle

## v0.19.2 - 2017-Jun-29

### Fixed

- #1131 broken new team validation accepts blank name on client
- #1132 handle shouldValidate and handleSubmit on new team form

## v0.19.1 - 2017-Jun-26

### Fixed

- #914 improbable welcome wizard race condition
- #1047 refactor routing components to stop unnecessary rerenders
- #1086 teamId/orgId missing from Segment page events
- #1116 new cards during meeting shows incorrect owner
- #1117 meeting summary cards not rendering to HTML

## v0.19.0 - 2017-Jun-22

### Added

- Fancy new [draftjs](https://draftjs.org/)-based editor for
  Project cards

### Fixed

- #1085 Migrations on deploy broken (regeneratorRuntime not found)

## v0.18.3 - 2017-Jun-14

### Added

- #1070 Create segment event when meeting is automatically ended

### Fixed

- #1074 endOldMeetings: meeting already ended

## v0.18.2 - 2017-Jun-02

### Added

- Enhanced design of beta integrations configuration panel, starting with Slack

### Fixed

- Various dependency updates fixing potential security vulnerabilities

## v0.18.1 - 2017-May-18

### Added

- Removed references to "Action" as product name, now we're just going
  what people call us, "Parabol"
- Tech debt avoidance: switched to `react-router` v4 and now using
  `prop-types` module
- Added Slack notifications to CircleCI builds
- Copy updates on landing page
- During Check-In round, we now say "Here" instead of "Present" for
  our friends in the UK
- #990 new new Project card design

### Fixed

- #893 make card on team dash while user filter in on
- #924 Catch errors during auto-pause users cron job
- #970 Only send Segment Meeting Completed event for folks who were
  in the meeting
- #971 private not private when archived
- #972 tags don't exist in content
- #988 word-wrap for agenda placeholders
- #992 meeting link focus
- #994 DnD agenda items in team dash

## v0.18.0 - 2017-May-04

### Added

- Tags (#archive, #private)
- Calendar invites on first meeting Email Summary
- Integrator Microservice (Bull Job Queue, action-integrator)
- Slack integration (Naive meeting alerts)
- react-githubish-mentions
- emoji support in markdown

### Fixed

- CSS For auth0 modal on invitation route
- sorting first agenda item bug #896

### Removed

- Actions (in favor of private projects)
- redux-form from projects

## v0.17.6 - 2017-Apr-25

### Added

- Hello lang tooltips, we'll now tell you which language is saying
  hello to you during check-in round
- `teamId` added to most segment.io events, so we can account for
  metrics at the team level
- Various copy updates across the product

### Fixed

- #927 fix intranet query for un-ended meetings
- CircleCI `circle.yml` ssh key management regression fixed

## v0.17.5 - 2017-Apr-17

### Fixed

- typo in segment 'Meeting Completed' event
- fixes #350 and fixes #380 easter eggs
- fixes #498 column colors
- fixes #629 landing page
- fixes #867 free trial date copy change
- fixes #739 beta stamp
- fixes #864 team settings panel
- fixes #882 delete team button
- fixes #890 update voice of success copy

## v0.17.4 - 2017-Apr-07

### Added

- Team dash header changes: (hot lobby button! Team settings! and more!)
- New rallies!
- Updated copy for agenda last call

### Fixed

- #508 agenda input shortcut prompt
- #768 page title improvements
- Pencil after blur for editable
- Ensure meeting infinite loop fix
- Avatar group, dates

## v0.17.3 - 2017-Apr-05

### Added

- Action meeting layout and check-in UI/UX changes:
  - #717 Simplified meeting check-in process
  - #627 More vertical height during project updates
  - New placement and look for callouts and avatars
- New counters on project columns

## v0.17.2 - 2017-Apr-04

### Added

- #555 can now archive teams
  - N.B. teams can't yet be unarchived, so be careful :)
- #878 superuser GraphQL endpoint `extendTrial` to extend trial time

### Fixed

- #866 trial date completion bug
- #868, #879 agendas items not marked as complete

## v0.17.1 - 2017-Mar-29

### Fixed

- #859 infinite redirect loop when deleting the last phaseItem

## v0.17.0 - 2017-Mar-27

### Added

- Start of many copy edits (watch for more changes in future versions),
  including #716 meeting lobby updates

### Fixed

- #643 summary email subject line
- #839 max chars for projects
- #857 mystery notification

## v0.16.12 - 2017-Mar-22

### Added

- #344 meeting agenda list now reflects location of Facilitator and participants
- #837 added `Facilitator` badge and styling added to meeting Facilitator

### Fixed

- Better fix for #850 r.createdAt.getTime is not a function

## v0.16.11 - 2017-Mar-22

### Fixed

- Hotfix #850 r.createdAt.getTime is not a function

## v0.16.10 - 2017-Mar-22

### Added

- Clearer direction to meeting participants when they want to skip ahead
  of the meeting facilitator (#806, #392)
- Project cards once again submit on enter, not tab
- #728, #794 markdown now renders in email summary

### Fixed

- Re-adds user traits as context and properties to all segment events
- #840 column order:
  - We're more orthodox Kanban now dashboards (time flows left to right),
    but intentionally reversed in meetings so things are covered in a
    productive order
- #848 eager-load error validation error for stripCard

## v0.16.9 - 2017-Mar-20

### Added

- #404 add automated error reporting if meeting state gets stuck
- #762 spinner component
- #820 Trial and payment segment events
- Added raven message to meeting infiniteLoop watchdog

### Fixed

- Patch for rejoin button styles
- Ensure graphql gets a promise back from newly non-awaited calls
- Refactored segment.io calls to only pass identity traits on login and change
- #442 action disappears when creator reassigns to different owner
- #444, #663 LeftNav view glitch in Chrome
- #487 skipping updates to agenda via progress bar causes router loop
- #553, #773 DnD acts strangly when user filter active on team dashboard
- #592 facilitator abandons meeting; allow others to end it
- #660 new team member invite bug
- #714 Can't delete team members
- #718 Notification for leaving a team
- #738 Navigate to Team Settings, error ensues
- #780 Team settings invite validation allows multiple emails
- #808 Hey, I wanna pay!
- #818 highlighted team no worky
- #821 actions list not showing in my dashboard
- #824 Editing/cursor bug workaround, root cause still unknown

## v0.16.8 - 2017-Mar-14

### Fixed

- #811 Rejoin facilitator button cursor is pointer
- fix orgName update
- Dependency bumps & linting

## v0.16.7 - 2017-Mar-13

### Fixed

- #808 hey I want to pay!

## v0.16.5 - 2017-Mar-11

### Added

- Awesome spinner component
- Billing unit tests
- A few modifications and final touches to invoices

### Fixed

- #755 filter handle alignment regression
- #759 regression: clients unable to accept invitations
- #793 no such customer exception

## v0.16.3 - 8-Mar-2017

### Added

- Unit tests for Action mutations
- #462 source maps added to minified production builds
- Individual team and user project drag-and-drop sort orders now combined
  into one, universal sorting order used across the system
- Dashboard notification bar is now implemented as a "DashAlert" modal
- #736 permutations on invoice

### Fixed

- #780 email regex allowed multiple emails
- #782 regression on Project index used by archived projects
- #783 ensured CC always exists on org, no longer using pagination for invoiceList
- #784 invoice icon styling bug in production
- #553 fine tune DnD
- #714 can't delete team members
- #724 top notification bar & dash modal overlap
- #733 team project columns (filtered by team member) cache/redux error on DnD

## v0.16.2 - 4-Mar-2017

### Added

- Rejoin facilitator button
- Switched to [migrate-rethinkdb](https://github.com/ParabolInc/migrate-rethinkdb)

## v0.16.1 - 2-Mar-2017

### Added

- New unit tests

### Fixed

- Fix upcoming vs pending on invoices
- #751 production deploy, assets.json not found
- #753 cannot read property 'bestCursor' of undefined
- #755 filter handle alignment regression
- #757 add new team, always shows orgs as "Loading..."

## v0.16.0 - 2017-Feb-25

### Added

- Organizations: teams can be tied together into organizations
- User trials & billing: hey look! A business model!
  - New & grandfathered users start a 30 day trial
  - Trial & access expiry
  - Payment information & stripe integration
  - Invoicing
- Notifications: a new channel to communicate with our users
- Portals: we're using [react-portal-hoc](https://github.com/mattkrick/react-portal-hoc)
  to implement our dropdown menus and modals
- Updated to Node.js 7.6.0, native async/await
- Switched to [jest](https://facebook.github.io/jest/) for unit testing
  - Added first suite of server unit tests
- Refactored drag-and-drop support
- Refactored `KICK_OUT` message onto `USER_MEMO` websocket channel
- Much improved development build time by dll-izing vendor package
  - See: `npm run build:dll`
- Added `npm run start:tunnel` to start [ultrahook](http://www.ultrahook.com/)
  to facilitate Stripe & future webhook development
- Server data validation pattern
- Badge component
- Presence added to dashboards (#523)

### Fixed

- #253 auth0 token tms out of sync with rethinkdb
- #277 graphql browser CSS trouble
- #437 TypeError: Cannot read property 'openArea' of undefined
- #517 server exception encountered when generating meeting summary
- #530 duplicate team selection after reordering
- #558 when renaming on team settings, validation styling bug
- #573 Amazon S3 returning 403 for VPN clients
- #578 meeting Stuck at First Call
- #583 allow production build without S3
- #598 fix GraphQL v0.8.0 breaking changes
- #608 square avatars are square (with rounded styling)
- #718 toast notification for leaving a team copy
- #725 acceptInvitation race condition

## v0.15.3 - 2017-Feb-11

### Added

- OutcomeCard components (Projects, Action) now re-render their last-updated
  time on a smart timer

### Fixed

- Generate 'Meeting Completed' on server-side, client was not reliably
  sending this event

## v0.15.2 - 2017-Feb-01

### Fixed

- Incremented `package.json` version to match tag – oops!

## v0.15.1 - 2017-Jan-31

### Added

- `(<TAB> saves)` string to OutcomeCard components when editing
- `npm run test:xunit` command for CircleCI 2.0

## v0.15.0 - 2017-Jan-30

### Added

- When version is upgraded, we now emit a toast asking the user to upgrade
  their client version
- Markdown support added to Action and Project cards

## v0.14.2 - 2017-Jan-29

### Fixes

- #646 the first-time message meeting completion message was not displaying
- #659 auth0 profile picture meta-information now updated when user changes
  profile image

## v0.14.1 - 2017-Jan-16

### Added

- Adopted CircleCI 2.0 beta. See [circle.yml](circle.yml). Now deploys
  securely to `staging` and `production` servers directly from CI servers.
- Added three seed projects for new team leaders as a simplified on-boarding
  experience before we implement more immersive tutorial. Implements #631.
- Segment.io event tracking for welcome wizard during step3 when users only
  want to kick the tires (#638)

### Removed

- Segment.io analytics from `npm run dev` and `npm run start` when running on
  development machine.
- Only allow for /email route in development (#637)

### Fixed

- Fixes CircleCI caching issues building native bcrypt modules.

## v0.14.0 - 2017-Jan-09

### Added

- Implements #595; upload of user avatar images to S3
  - Works by securely signing S3 PutObject URL
    see [documentation](./docs/s3.md)
- `npm run build:deploy` and `npm run build:min` commands

## v0.13.6 - 2016-Dec-20

### Added

- User impersonation, login as a user with knowing their credentials on route
  `/admin/impersonate/:userid`
- Expanded requireAuthAndRole with optional args
- Added segment.io event on 'New Team' creation

## v0.13.5 - 2016-Dec-12

### Fixed

- #556 archived cards no longer let you change the owner
- #557 blur agenda item input after submit
- #559 participants stopped following the leader after meeting "Last Call"

## v0.13.4 - 2016-Dec-08

### Fixed

- #564 Fix email validation

## v0.13.3 - 2016-Dec-05

### Added

- Validations system (see: `src/universal/validations/legitify.js`)
  - Added client and server validations for all mutations
- Allow team leaders to skip step 3 of the welcome wizard (see #354)
- S3 deploys into versioned directories within bucket (see #493)

### Fixed

- #547 welcome wizard step 3 cleanup
- #549 welcome wizard step 3: removing email calls submit

## v0.13.2 - 2016-Nov-27

### Added

- 'Player joined' message when teammate accepts invitation

### Fixed

- #543 unable to end action meeting

## v0.13.1 - 2016-Nov-25

### Added

- Can now filter by team member on team dashboard Views
- Updated FontAwesome to v4.7.0

### Fixed

- #514 Relabeling Actions and Projects during agenda processing
  - Copy now reads "New private action" and "New team project"
- #536 Cashay warning while proceeding through check-in round

## v0.13.0 - 2016-Nov-22

We tagged v0.13.0 on our 1,300th commit. What a coinkidink!

### Added

- Drag-and-drop everywhere: My Dashboard (actions, projects),
  Team Dashboards (meeting agenda queue, projects), meeting project updates,
  and meeting agenda items

### Fixed

- #508 Agenda items collapse around 1265px
- #517 Server exception encountered when generating meeting summary

## v0.12.1 - 2016-Nov-15

### Fixed

- #518 Removed team member does not redirect away while on team dashboard

## v0.12.0 - 2016-Nov-15

### Added

- Added Team Settings implementation
  - Can now rename teams
  - Can promote a new team leader
  - Can invite new team members
    - Can resend invitations
    - Can revoke invitations
  - Can remove team members (even if they are in a meeting)

### Fixed

- #512 Grant facilitation permission to every team member

## v0.11.0 - 2016-Nov-05

### Added

- Added S3 deployment to `npm run build:client-min` and application

### Fixed

- #482 Avatar style improvements
  - Restores a default box shadow, with the option for border styling
  - Makes lobby and last call primary buttons more prominent
- #492 minor UI updates
  - DashModal has updated border styling
  - SummaryHeader has button-styled link to team dashboard
  - LastCall pulls success expression from array

## v0.10.0 - 2016-Nov-02

### Added

- #458 Added ability to create and invite new teams
- #466 Can now press escape to blur agenda list input
- `redux-raven-middleware` to include redux events in error reporting

### Fixed

- #161, #162 Changed lobby copy to better illustrate when check-in round begins
- #379 Uncaught TypeError: Cannot read property 'openArea' of undefined
- #411 Fix `isFacilitating` box shadow
- #474 Can steal facilitator role with refresh
- Updated styles for waiting message on last call
- Increased contrast of avatar outlines, misc. styling improvements
- Updated email link copy to summary

## v0.9.6 - 2016-Oct-29

### Added

- Automatic election of new facilitator when old facilitator disconnects
- Refactor of socket management; added container decorator to maintain
  socket connection

### Fixed

- #438 fixed TypeError: Cannot read property 'id' of undefined
- #447 unable to signout and login properly
- Fixed race condition landing on meeting summary route at end of meeting
- Fixed short urls

## v0.9.5 - 2016-Oct-25

### Fixed

- #433 server crashing on localhost
- #440 sentry.io bug on `id` field
- #445 summary rendering “0” when there aren’t members without new outcomes

## v0.9.4 - 2016-Oct-24

### Fixed

- #428 makeAppLink
- #429 race to meeting summary and lobby
- #430 generate only 1 email
- #431 killMeeting

## v0.9.3 - 2016-Oct-24

### Added

- New meeting summary web view and email
- Segment.io adoption funnel and usage tracking:
  - Welcome wizard events, 'Meeting Completed' events
  - Added segmentEventPage, renamed segmentEvent -> segmentEventTrack
  - Added Helmet components to update title on key routes
- Simple singular, plural for Last Call (#419)

### Fixed

- Segment page events now report correct document title
- #413 fixes build minification

## v0.8.1 - 2016-Oct-19

### Added

- Sentry.io automated error reporting for server and client

### Fixed

- #68 use auth0 refreshToken to keep a user logged in during a meeting
- #393 do not require enter key to advance check-in during a meeting
- #394 end meeting button copy should differ depending on user context
- #395 going back one meeting phase doesn't update phaseItem
- #396 creating agenda items from last call doesn't register them in the
  total or summary
- #397 breaks on react-router infinite loop redirect
- #400 Doesn't submit twice when using Enter to submit outcome changes

## v0.8.0 - 2016-Oct-18

### Added

- End of meeting summary

## v0.7.5 - 2016-Oct-15

### Added

- Temporarily wired meeting last call button to endMeeting mutation to enable
  more user testing
- Re-added piping to reload server code when running `npm run dev`

### Removed

- Double dependency in `package.json` on `react-hot-loader`

### Fixed

- Re-added actions subscription channel, was still being used by user dashboard

## v0.7.4 - 2016-Oct-12

### Added

- #333 Distribute auth0 clientId and domain via SSR, allows configurability
  of differing auth0 domains

### Fixed

- #325 Adding new action during action meeting shows others that
  new project is being created
- #326 Unable to make initial assignment of Action/Project to user other than
  self
- #327 Agenda order processing broken
- #328 Adding new agenda item causes other users to navigate away
- #331 Enhance design of "Whatcha need?" prompt of agenda processing
- #338 Font variants not loading
- #346 Error during meeting crashes browser
- #347 Archive Card textarea disabled state
- #349 Cannot start meeting
- #351 Font loads twice error
- #373 Read-only team name outline/focus

## v0.7.1 - 2016-Oct-05

### Fixed

- Fixed: #322, #323, #334, #335, #336

## v0.7.0 - 2016-Oct-04

### Added

- Now using [aphrodite](https://github.com/khan/aphrodite) for styling
- Me dashboard now has buttons to add new outcomes for Actions and Projects
- Me dashboard now has a filter option to see Projects by a specific team

### Removed

- Removed [react-look](https://github.com/rofrischmann/react-look)

### Fixed

- Fixed: #124, #190, #221, #227, #252, #276, #282, #290, #295, #302, #305,
  #307, #313

## v0.6.3 - 2016-Sep-28

### Fixed

- Agenda processing order fix for issue #294

## v0.6.2 - 2016-Sep-27

### Added

- Processing of agenda items during meeting into new projects and actions

### Fixed

- Add/remove rethinkdb entity from cache problem, see: https://github.com/mattkrick/cashay/issues/125
- Editors multiplayer field regression

## v0.6.1 - 2016-Sep-23

### Added

- Now supports removal of agenda items
- Stubbed in meeting last call for agenda items
- Now uses Cashay @live directive in subscriptions
- Added agenda hotkeys
- Partial implementation of agenda processing
- Extraction of 3rd party CSS files into their own static assets
  - Decouples Graphiql from `react-look`
- Many, many aesthetic dashboard and card improvements
- Agenda list updates
- Archiving and un-archiving of project cards
- Equity for Effort documentation updates

## Removed

- Switched back to official segment snippet generation function

## Fixed

- First call for agenda items causing infinite loop
- Fixes for `moveMeeting` mutation & `makePhaseItemFactory`
- Fixes #202, adds correct auth0 management token
- Fixes for #119, #188, #225, #231, #241, #233, and #260
- Merged #267 autofocus fix

## v0.5.3 - 2016-Aug-30

### Added

- Project updates section
- Rally easter eggs
- Segment.io metrics tracking
- Randomized check-in questions

### Removed

- editingDuck in favor of Cashay computed props

### Fixed

- Invitations and team membership + rethinkdb query optimization
- Simplified check-in cards design
- Landing page spacing
- Lots of copy updates
- redux-socket-cluster disconnect timeout
- Refactored dashboard components into many clearer containers

## v0.4.1 - 2016-Aug-16

### Added

- Added partial `/me` dashboard implementation
- Wired up project status and ownership assignment on dashboards
- Added displayed of multiplayer card editing status to project cards
  - Uses sockets-based presence system (see `@socketWithPresence` decorator)
- Improved styling of project columns on dashboards
- Temporary patch allowing invitation links to add existing users to teams
  - Later this will be handled exclusively by the dashboard

### Removed

- Unused file `universal/utils/schema.js`

### Fixed

- onBlur handler for project cards (`OutcomeCardTextAreaField` component)

## v0.4.0 - 2016-Aug-13

### Added

- User invitations
  - _Note:_ invites only process currently for new users
- Lots of infrastructure for pub/sub through the app
- User presence (who's here? who's just left?)
- `/logout` route
- Action meeting:
  - Lobby
    - Connection states
    - Start meeting
  - Check-in round
    - Update check-in states
    - Navigate forward and backward
  - Placeholder project updates layout
- Team dashboard:
  - Agenda items
  - Add new projects in column
  - Edit project description
  - Data model for sorting above list items
  - Dashboard div marking it unavailable when meeting is in progress
- Refactored auth token meta-data to include team membership, & more
- Refactored authDuck to parse auth token
- `npm run lint:fix`
- Many redux unit tests

### Removed

- **Breaking change:** removed original migrations. You'll need to wipe your
  database and start again.

## v0.3.0 - 2016-Jul-04

### Added

- `rethink-migrate` back to project
- CircleCI
- Toast notifications based upon `react-notification-system`
- [Cashay](https://github.com/mattkrick/cashay)
- JSON theme generation using `WebpackShellPlugin`
- `redux-form`
- `redux-persist`
- Email generation
  - `mailgun` sending emails
  - `oy` for HTML4 email content generation
  - `mailcomposer` for MIME email creation
  - `cheerio` to parse HTML and custom code to embed images
- Refactored team leader on-boarding journey to use `cashay` and refactored into `Welcome` module
- Refactored authentication token handling system (see `ReduxAuthEngine`)
- Numerous components
- First suite of unit tests

### Removed

- ImmutableJS
- `react-hot-loader` from production configuration

### Fixed

- GraphiQL queries with variables

## v0.2.0 (untagged)

- Adopted `react-look` for inline styling
- Restructured styles into a computed set of themes
- Began UI pattern library
- Reintroduced migrations using `rethink-migrate`
- Implemented new team creation and invitations process

## v0.1.0

### Added

- Moved to the meatier stack
- Fixed JWT expiry handling
- Fixed FOUCs in dev mode
- Removed cookies
- Removed sessions
- Removed Sails
- Remove migrations
- Switched from Falcor to GraphQL
- Added GraphiQL
- Upgraded to Babel 6
- Upgraded to react-router
- Upgraded to react-router-redux

## v0.0.1 (untagged)

### Added

- Initial fork from
  [react-redux-universal-hot-example](https://github.com/erikras/react-redux-universal-hot-example) by @jrhusney
- Initial UX design by @jrhusney & @ackernaut
- Initial CSS by @ackernaut
- Demonstration model and
  [falcor-saddle](https://github.com/ParabolInc/falcor-saddle) integration
  by @jrhusney
- socket.io change feed → client Redux implementation by @jrhusney
- Demonstration of realtime collaboration by @jrhusney & @ackernaut
- Documentation by @jrhusney

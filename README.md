# Action

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)
[![Circle CI](https://img.shields.io/circleci/project/parabol/action/master.svg)](https://circleci.com/gh/ParabolInc/action)

## Overview

An open-source tool for meaningful meetings to build smarter, more
agile teams.

![Action Screencap Image](./docs/images/20160207_Action_Snapshot.gif)

From [Parabol, Inc](http://parabol.co).

Live demo: http://action-staging.parabol.co/

### Quick Links

* [Stack Information](#stack-information)
* [Setup](#setup)
* [Getting Involved](#getting-involved)
* [Releases](#releases)
* [About](#about)
* [License](#license)

## Stack Information

Action is a Node.js application based upon the meatier stack:

| Concern            | Solution                                                  |
|--------------------|-----------------------------------------------------------|
| Server             | [Node 5](https://nodejs.org/)                             |
| Server Framework   | [Express](http://expressjs.com/)                          |
| Database           | [RethinkDB](https://www.rethinkdb.com/)                   |
| Data Transport     | [GraphQL](https://github.com/graphql/graphql-js)          |
| Sockets            | [socketcluster](http://socketcluster.io/)                 |
| Client State       | [Redux](http://redux.js.org/)                             |
| Front-end          | [React](https://facebook.github.io/react/)                |
| Styling            | [react-look](https://github.com/rofrischmann/react-look/) |


## Setup

### Installation

#### Prerequisites

Action requires Node.js >=5.10.1. We recommend using
[n](https://github.com/tj/n) to install and manage your node versions.

Action also depends on [RethinkDB](https://rethinkdb.com/). Make sure
you have it installed. If you have OSX, we recommend homebrew so
upgrades are as easy as `brew update && brew upgrade rethinkdb`

#### Source code

```bash
$ git clone https://github.com/ParabolInc/action.git
$ cd action
$ rethinkdb # in a separate window
$ npm install
$ npm run quickstart
```
_Remember: if RethinkDB is running locally, you can reach its dashboard at
[http://localhost:8080](http://localhost:8080) by default._

### Client-side development

In this mode, webpack will hot swap your updated client modules without
restarting the server.
```bash
$ npm run dev
```
[http://localhost:3000/](http://localhost:3000/)

### Server-side development

In this mode, the server will build client bundle and start a production
server with the fresh code.
```bash
$ npm run bs
```
[http://localhost:3000/](http://localhost:3000/)

### Database development
Database schema version is managed by
[rethink-migrate](https://github.com/JohanObrink/rethink-migrate). These
migrations are stored in `./src/server/database/migrations`.

If you make changes to the Action schema, make certain to create a new
migration.

## Bringing your database up to date

```bash
$ npm run db:migrate
```

## Migrating backward and forward

The following commands are available to migrate your database instance
forward and backward in time:

   * `npm run db:migrate-up` - migrate up one schema version
   * `npm run db:migrate-up-all` - migrate upward to latest schema
   * `npm run db:migrate-down` - migrate down one schema version
   * `npm run db:migrate-down-all` - migrate downward completely (will erase everything)

## Exploring the data API:

While running the app in development mode, navigate to
http://localhost:3000/graphql for testing out new queries/mutations

## Exploring component design:

We've begun assembling a pattern library of all of the components we've created
for the app. Too see them, navigate to http://localhost:3000/patterns

## Getting Involved

Action is software built with the community for the community. We can't do
it without your help!

Our [Action waffle.io Board](https://waffle.io/ParabolInc/action) organizes
available design and development missions. Check it out, grab a mission
(or contribute your own) and we'll gladly (and thankfully!) merge your pull
request.

You're contribution won't go unrewarded: Parabol offers equity in our
young company for qualified contributions to Action.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on how to
get involved and how to get compensated.

## Releases

| Version            | Summary                                      |
|--------------------|----------------------------------------------|
| 0.2.0              | Added first pass at team creation/invitation |
| 0.1.0              | Things got a whole lot meatier               |
| 0.0.1              | Developer preview and architecture demo      |

## About

Authored and maintained by [Parabol](http://parabol.co).

### Parabol Core Team

* [jordanh](https://github.com/jordanh)
* [ackernaut](https://github.com/ackernaut)
* [mattkrick](https://github.com/mattkrick)
* [jrwells](https://github.com/jrwells)

### License

Copyright 2016 Parabol, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

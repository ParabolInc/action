# Parabol - We're [hiring](https://www.parabol.co/join)!

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)
[![CircleCI](https://circleci.com/gh/ParabolInc/parabol.svg?style=svg)](https://circleci.com/gh/ParabolInc/parabol)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/parabol-inc/parabol-multiplayer-web-app)

## Overview

[Parabol](https://www.parabol.co) is an open-source SaaS application for running team retrospectives and operating a
distributed organization. We publish our company's [history and business metrics](https://focus.parabol.co/), too.

![Dashboard](./docs/images/d2.gif)
![Discuss](./docs/images/d1.gif)

## Stack Information

| Concern                | Solution                                                       |
| ---------------------- | -------------------------------------------------------------- |
| Server                 | [Node](https://nodejs.org/)                                    |
| Server Framework       | [uWebSockts.js](https://github.com/uNetworking/uWebSockets.js) |
| Database (Legacy)      | [RethinkDB](https://www.rethinkdb.com/)                        |
| Database               | [PostgreSQL](https://www.postgresql.org/)                      |
| PubSub & Cache         | [Redis](https://redis.io)                                      |
| Data Transport         | [GraphQL](https://github.com/graphql/graphql-js)               |
| Real-time Connectivity | [trebuchet](https://github.com/mattkrick/trebuchet-client)     |
| Client Cache           | [Relay](https://facebook.github.io/relay/)                     |
| UI Framework           | [React](https://facebook.github.io/react/)                     |
| Styling                | [Emotion](https://emotion.sh/)                                 |
| Integration Testing    | [Cypress](https://cypress.io)                                  |

## Setup

### Prerequisites

- [Node](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/cli/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Watchman](https://facebook.github.io/watchman/docs/install.html) (Development only)

### Installation

```bash
$ git clone https://github.com/ParabolInc/parabol.git
$ cd parabol
$ cp .env.example .env # Add your own vars here
$ yarn
$ yarn db:start
$ yarn dev
```

If `yarn db:start` failed and `localhost:5050` isn't working, a docker
container, volume or image may be corrupted and need to be pruned.

Build for production and start application:

```bash
$ yarn && yarn build && yarn start
```

### RethinkDB

- Migrations are stored in `packages/server/database/migrations`
- RethinkDB Dashboard is at [http://localhost:8080](http://localhost:8080)

### PostgreSQL

- pgadmin is at [http://localhost:5050](http://localhost:5050)
- Connect using `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`
- Click "Add New Server" and fill out the forms with your `.env` values
  - General.name = POSTGRES_DB
  - Connection.host = 'postgres' (hardcoded from docker-compose dev.yml, not from .env!)
  - Connection.username = POSTGRES_USER
  - Connection.password = POSTGRES_PASSWORD
  - Connection.maintenanceDatabase = POSTGRES_DB
  - Connection.port = POSTGRES_PORT

- Fill out the form with values from your `.env`. Set the host to `postgres`

## Getting Involved

Parabol offers equity for qualified contributions.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on how to
get involved and how to get compensated.

## Releases

For details on all releases, refer to [CHANGELOG.md](./CHANGELOG.md).

## Parabol Core Team

- [jordanh](https://github.com/jordanh)
- [ackernaut](https://github.com/ackernaut)
- [mattkrick](https://github.com/mattkrick)

## License

Copyright (c) 2016-present, Parabol, Inc.

This codebase is dual-licensed under the GNU AFFERO GENERAL PUBLIC LICENSE,
Version 3.0 while holding, at Parabol's sole discretion, the right to create
new licenses. For details please read [LICENSE](LICENSE).

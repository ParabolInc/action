## README

Each file in this directory is a helper function that calls a generated query.
The helper functions are useful because they make code easier to manage:
- Add stricter types that PGtyped fails to generate
- Only take query params, they get the client pool themselves
- Return the first object when the query is guaranteed to only return 1 row

## /generated

The contents of this folder are created by running `yarn pg:build` from the project root.
It includes the raw SQL ASTs that are passed to PG as well as some rough typings.

## /src

These are all the annotated SQL files used by pgtyped to create the SQL ASTs.
PG typed handles all object & array expansion so things like inserting multiple rows is easy.

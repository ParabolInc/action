All the files in this directory implement the GraphQLIDParser interface.
The reason we do this is because sometimes an ID has extra information in it that we need to abstract.
For example, if we want to compare an optimistic object to an object from the server,
we'll need to know how the server computes its ID.
By having the transforms share a file, dependency tracing is easy in case the way the ID is generated ever changes.

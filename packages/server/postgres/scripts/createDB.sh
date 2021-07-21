#!/bin/bash

dbName=$1
echo "creating new db: $dbName"

dropdb -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER $dbName --if-exists
createdb -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -T template0 $dbName

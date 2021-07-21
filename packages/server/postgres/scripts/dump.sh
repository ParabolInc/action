#!/bin/bash

options=""
[[ ! -z "$1" ]] && options=$1
echo "calling pg_dump with options: $options"

pg_dump postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB $options

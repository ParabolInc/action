#!/bin/bash

options=""
[[ ! -z "$1" ]] && options=$1
echo "calling pg_restore with options: $options"

pg_restore -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER $options

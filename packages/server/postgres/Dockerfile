FROM postgres:12.3

ADD extensions /extensions

RUN apt-get update && apt-get install -y build-essential

RUN cd /extensions/postgres-json-schema && make install && make installcheck

COPY extensions/install.sql /docker-entrypoint-initdb.d/

#!/bin/bash

set -e

stage=${1:-dev}

services=(
  'kafka-cluster-config'
  'kafka-cluster'
  'kafka-event-logs'
  'kafka-mgmt'
  'legacydb-mssql'
  'legacydb-mgmt'
  'legacydb-connect'
  'aps-database'
  'aps-uploads'
  'aps-uploads-scan'
  'aps-app-api'
  'aps-stream-functions'
  'aps-ui-auth'
  'aps-ui'
  'aps-ui-src'
)

install_deps() {
  if [ "$CI" == "true" ]; then # If we're in a CI system
    if [ ! -d "node_modules" ]; then # If we don't have any node_modules (CircleCI cache miss scenario), run yarn install --frozen-lockfile.  Otherwise, we're all set, do nothing.
      yarn install --frozen-lockfile
    fi
  else # We're not in a CI system, let's yarn install
    yarn install
  fi
}

deploy() {
  service=$1
  pushd services/$service
  install_deps
  serverless deploy  --stage $stage
  popd
}

install_deps
export PATH=$(pwd)/node_modules/.bin/:$PATH

for i in "${services[@]}"
do
	deploy $i
done

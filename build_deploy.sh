#!/bin/bash

set -exv

# name of app-sre "application" folder this component lives in; needs to match for quay
export COMPONENT="insights-inventory" 
export APP_NAME=`node -e 'console.log(require("./package.json").insights.appname)'`
export IMAGE="quay.io/cloudservices/$COMPONENT-frontend"
export LC_ALL=en_US.utf-8
export LANG=en_US.utf-8
export APP_ROOT=$(pwd)
export WORKSPACE=${WORKSPACE:-$APP_ROOT}  # if running in jenkins, use the build's workspace
export IMAGE_TAG=$(git rev-parse --short=7 HEAD)
export GIT_COMMIT=$(git rev-parse HEAD)
cat /etc/redhat-release
COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master

npm ci
npm run verify

curl -sSL https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/nginx_conf_gen.sh | bash -s 
curl -sSL https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/quay_push.sh | bash -s 

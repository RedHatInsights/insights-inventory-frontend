#!/bin/bash

set -exv

APP_NAME=`node -e 'console.log(require("./package.json").insights.appname)'`
COMPONENT_NAME="insights-inventory-frontend"  # name of app-sre "resourceTemplate" in deploy.yaml for this component
IMAGE="quay.io/cloudservices/$COMPONENT_NAME"
IMAGE_TAG=$(git rev-parse --short=7 HEAD)

npm ci
npm run verify
# npx codecov

curl -sSL https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/nginx_conf_gen.sh | bash -s 
curl -sSL https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/quay_push.sh | bash -s 

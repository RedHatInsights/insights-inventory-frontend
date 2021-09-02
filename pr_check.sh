#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
# export APP_NAME="host-inventory" # name of app-sre "application" folder this component lives in
export APP_NAME=`node -e 'console.log(require("./package.json").insights.appname)'`
export IMAGE="quay.io/cloudservices/$APP_NAME"
export LC_ALL=en_US.utf-8
export LANG=en_US.utf-8
export APP_ROOT=$(pwd)
export WORKSPACE=${WORKSPACE:-$APP_ROOT}  # if running in jenkins, use the build's workspace
export IMAGE_TAG=$(git rev-parse --short=7 HEAD)
export GIT_COMMIT=$(git rev-parse HEAD)
cat /etc/redhat-release

# --------------------------------------------
# Options that must be configured by app owner
# --------------------------------------------
# COMPONENT_NAME="insights-inventory-frontend"  # name of app-sre "resourceTemplate" in deploy.yaml for this component
# Duplicating for now
IQE_PLUGINS="host_inventory"
IQE_MARKER_EXPRESSION="smoke"
IQE_FILTER_EXPRESSION=""

# ---------------------------
# Build and Publish to Quay
# ---------------------------

npm ci
npm run verify
# Issue with upload
# npx codecov

NPM_INFO="undefined"
PATTERNFLY_DEPS="undefined"
if [[ -f package-lock.json ]] || [[ -f yarn.lock ]];
then
  LINES=`npm list --silent --depth=0 --production | grep @patternfly -i | sed -E "s/^(.{0})(.{4})/\1/" | tr "\n" "," | sed -E "s/,/\",\"/g"` 
  PATTERNFLY_DEPS="[\"${LINES%???}\"]"
else PATTERNFLY_DEPS="[]" 
fi

if [[ -n "$APP_BUILD_DIR" &&  -d $APP_BUILD_DIR ]]
then
    cd $APP_BUILD_DIR
else
    cd dist || cd build
fi

echo $NPM_INFO > ./app.info.deps.json

echo "{
  \"app_name\": \"$APP_NAME\",
  \"src_hash\": \"$GIT_COMMIT\",
  \"patternfly_dependencies\": $PATTERNFLY_DEPS,
}" > ./app.info.json


PREFIX=""
if [[ "${TRAVIS_BRANCH}" = "master" ||  "${TRAVIS_BRANCH}" = "main" || "${TRAVIS_BRANCH}" =~ "beta" ]]; then
  PREFIX="/beta"
fi

echo "server { 
 listen 80;
 server_name $APP_NAME;

 location / {
  try_files \$uri \$uri/ $PREFIX/apps/chrome/index.html;
 }

 location $PREFIX/apps/$APP_NAME {
   alias /usr/share/nginx/html;
 }
}
" > ./nginx.conf

if [[ -z "$QUAY_USER" || -z "$QUAY_TOKEN" ]]; then
    echo "QUAY_USER and QUAY_TOKEN must be set"
    exit 1
fi

if [[ -z "$RH_REGISTRY_USER" || -z "$RH_REGISTRY_TOKEN" ]]; then
    echo "RH_REGISTRY_USER and RH_REGISTRY_TOKEN must be set"
    exit 1
fi


echo "LABEL quay.expires-after=3d" >> $APP_ROOT/$DOCKERFILE  # tag expires in 3 days
DOCKER_CONF="$PWD/.docker"
mkdir -p "$DOCKER_CONF"
docker --config="$DOCKER_CONF" login -u="$QUAY_USER" -p="$QUAY_TOKEN" quay.io
docker --config="$DOCKER_CONF" login -u="$RH_REGISTRY_USER" -p="$RH_REGISTRY_TOKEN" registry.redhat.io
docker --config="$DOCKER_CONF" build -t "${IMAGE}:${IMAGE_TAG}" $APP_ROOT -f $APP_ROOT/$DOCKERFILE
docker --config="$DOCKER_CONF" push "${IMAGE}:${IMAGE_TAG}"


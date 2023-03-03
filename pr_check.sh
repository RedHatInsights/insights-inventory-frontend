#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
export COMPONENT_NAME="host-inventory-frontend"
# IMAGE should match the quay repo set by app.yaml in app-interface
export IMAGE="quay.io/cloudservices/insights-inventory-frontend"
export WORKSPACE=${WORKSPACE:-$APP_ROOT} # if running in jenkins, use the build's workspace
export IMAGE_TAG=$(git rev-parse --short=7 HEAD)
export GIT_COMMIT=$(git rev-parse HEAD)
export APP_ROOT=$(pwd)
export NODE_BUILD_VERSION=15
COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master


export IQE_PLUGINS="host-inventory-frontend"
export IQE_MARKER_EXPRESSION="smoke"
export IQE_ENV="ephemeral"
export IQE_SELENIUM="true"
export IQE_CJI_TIMEOUT="30m"
export REF_ENV="insights-stage"


# Install bonfire repo/initialize
CICD_URL=https://raw.githubusercontent.com/RedHatInsights/bonfire/master/cicd
# shellcheck source=/dev/null
curl -s $CICD_URL/bootstrap.sh > .cicd_bootstrap.sh && source .cicd_bootstrap.sh
# source is preferred to | bash -s in this case to avoid a subshell
source <(curl -sSL $COMMON_BUILDER/src/frontend-build.sh)

# reserve ephemeral namespace
export DEPLOY_FRONTENDS="true"
export APP_NAME="host-inventory"

# Run smoke tests
# shellcheck source=/dev/null
source "${CICD_ROOT}/deploy_ephemeral_env.sh"
# shellcheck source=/dev/null
export COMPONENT_NAME="host-inventory"
source "${CICD_ROOT}/cji_smoke_test.sh"
# shellcheck source=/dev/null
source "${CICD_ROOT}/post_test_results.sh"

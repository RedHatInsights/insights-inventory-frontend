#!/bin/bash
set -e
set -x

if [[ "${TRAVIS_BRANCH}" = "master" ]]; then
    for env in ci qa
    do
        echo
        echo
        echo "PUSHING ${env}-beta"
        rm -rf ./build/.git
        .travis/release.sh "${env}-beta"
    done
    
elif [[ "${TRAVIS_BRANCH}" = "master-stable" ]]; then
    for env in ci qa
    do
        echo
        echo
        echo "PUSHING ${env}-stable"
        rm -rf ./build/.git
        .travis/release.sh "${env}-stable"
    done

elif [[ "${TRAVIS_BRANCH}" = "prod-beta" || "${TRAVIS_BRANCH}" = "prod-stable" ]]; then
    .travis/release.sh "${TRAVIS_BRANCH}"
fi

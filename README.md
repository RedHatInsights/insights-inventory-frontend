[![Build Status](https://img.shields.io/github/actions/workflow/status/RedhatInsights/insights-inventory-frontend/test.yml?branch=master)](https://github.com/RedHatInsights/insights-inventory-frontend/actions/workflows/test.yml) [![GitHub release](https://img.shields.io/github/release/RedHatInsights/insights-inventory-frontend.svg)](https://github.com/RedHatInsights/insights-inventory-frontend/releases/latest) [![codecov](https://codecov.io/gh/RedHatInsights/insights-inventory-frontend/branch/master/graph/badge.svg?token=XC4AD7NQFW)](https://codecov.io/gh/RedHatInsights/insights-inventory-frontend)

# Inventory Frontend

This is the frontend application for [Inventory](https://github.com/RedHatInsights/insights-inventory).
It is based on the [insights-frontend-starter-app](git@github.com:RedHatInsights/insights-frontend-starter-app.git).

## Table of contents

- [Getting started](#getting-started)
    - [Quick start](#quick-start)
    - [Running locally](#running-locally)
- [Testing](#testing)
  - [Unit testing](#unit-testing)
  - [E2E testing: Playwright](#e2e-testing-playwright)
    - [First time setup](#first-time-setup)
    - [Running Playwright tests](#running-playwright-tests)
- [Commit conventions](#commit-conventions)
- [Testing federated modules with another application](#testing-federated-modules-with-another-application)
- [Mocking Inventory API](#mocking-inventory-api)
- [Inventory table and detail](#inventory-table-and-detail)
  - [Applications using InventoryTable](#applications-using-inventorytable)
- [Component documentation](#component-documentation)
- [Release process](#release-process)
  - [Latest image and Stage deployment](#latest-image-and-stage-deployment)
  - [Pre-promotion verification](#1-pre-promotion-verification)
  - [Promoting to production](#2-promoting-to-production)
  - [Post-release verification](#3-post-release-verification)
- [Common Problems You Might Encounter](#common-problems-you-might-encounter)


## Getting started

### Quick start

1. Make sure you have [`Node.js`](https://nodejs.org/en/) (current LTS) and [`npm`](https://www.npmjs.com/) installed.
2. Run [script to patch your `/etc/hosts`](https://github.com/RedHatInsights/insights-proxy/blob/master/scripts/patch-etc-hosts.sh).
3. Make sure you are using [Red Hat proxy](http://hdn.corp.redhat.com/proxy.pac).

### Running locally

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Run development server with `npm run start:proxy`. See `dev.webpack.config.js` and `package.json` (npm scripts) for more options and parameters available.
4. Local version of the app will be available at `https://stage.foo.redhat.com:1337/insights/inventory/`. If you run with slightly different setup (for example, using production environment), you should still see the generated URL in your terminal, the webpack script output.

## Testing

### Unit testing

We use Jest with React Testing Library to write unit tests. For larger pieces of code or components, we utilize Cypress. For testing commands shortcuts (like `npm run test`, `npm run test:ct`, etc.), take a look at the package.json file which lists available scripts.

Before opening a pull request, you can run `npm run verify:local` to make sure your changes pass automated tests (Jest and Cypress) and linter (both JS and CSS linters). We also execute [husky](https://typicode.github.io/husky/) hooks with every commit to make sure the changes pass basic lint checks.

### E2E testing: Playwright

The E2E tests are located in the [_playwright-tests/](_playwright-tests/) directory. `playwright.config.js` is playwright configuration file - it serves as the "brain" for an automated testing suite, defining how, where, and with what settings your browser tests should run. All the helpers live in the [helpers](playwright/helpers/) directory.

#### First time setup

1. Copy the example env file (`playwright_example.env`) and create a file named `.env`. For local development only the `BASE_URL` - `https://stage.foo.redhat.com:1337` is required, which is already set in the example config.
You also need to update the `PLAYWRIGHT_USER` and `PLAYWRIGHT_PASSWORD` of your Stage testing account to the `.env` file.

2. Install the test runner:
```bash
npm install --save-dev @playwright/test
```

3. Install Playwright browsers and dependencies:
```bash
npx playwright install
```

OR

If using any OS other than Fedora/RHEL (i.e., Mac, Ubuntu Linux):
```bash
npx playwright install  --with-deps
```

#### Running Playwright tests

1. Start the local development stage server by running: `npm run start:stage`


2. Use the following commands to execute the Playwright test suite: 
* `npx playwright test` - run the complete playwright test suite
* `npx playwright test --headed` -  run the complete suite in a vnc-like browser so you can watch its interactions
* `npx playwright test test_navigation.test.ts` - run a specific test file
* `npx playwright test test_navigation.test.ts -g "Test name"` - run a specific test by its name

## Commit conventions

In order to keep our commits style consistent and the commits history easy to read, we utilize [semantic-release](https://github.com/semantic-release/semantic-release) which follows [Angular Commit Message Conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format). Also, there is a commitlint check run on all branches which ensures that all the commits meet the expected format (`<type>(<scope>): <short summary>`). Following this standard and specifying at least the type and summary for each commit helps to automatically generate a changelog of changes.


## Testing federated modules with another application

If you want to test federated modules (such as InventoryTable or SystemDetail) in another application, you can utilise `LOCAL_APPS` environment variable and deploy the needed application on separate ports. To learn more about the variable, see https://github.com/RedHatInsights/frontend-components/tree/master/packages/config#running-multiple-local-frontend-applications.

### Example

We'll take for example [insights-advisor-frontend](https://github.com/RedHatInsights/insights-advisor-frontend).

Open new terminal, navigate to Advisor repository, and run it on a separate port without proxy:

```
npm run start -- --port=8003
```

In a separate terminal, run Inventory with proxy enabled and list Advisor:

```
LOCAL_APPS=advisor:8003~http npm run start:proxy
```

## Mocking Inventory API

This is one of the advanced methods to test frontend locally without waiting for API to have desired endpoints available.

Inventory frontend has support for https://github.com/stoplightio/prism CLI. The CLI reads the OpenAPI schema, spins up a localhost server and serves dynamically generated responses for Inventory API endpoints (/hosts, /groups, etc.).

1. Verify package.json `config` section for the correct URL to OpenAPI schema (contains remote URL by default).
2. Verify dev.webpack.config.js `customProxy` settings. There you can specify which endpoints to proxy and modify request/response headers.
3. Run `npm run mock-server` to start the mock server. The first output must list the endpoints that are generated by the localhost server.
4. In another terminal, run `npm run start:mock` or `npm run start:mock:beta` to start the webpack server either in stage-stable or stabe-beta environment. The scripts set the MOCK variable to true and the customProxy is enabled.

## Inventory table and detail

We are serving inventory through federated modules, this means both inventory table and inventory detail is served to you in runtime. No need to install and rebuild when something changes in inventory.

### Applications using InventoryTable

These applications import `InventoryTable` component through federated modules:

- [vulnerability-ui](https://github.com/RedHatInsights/vulnerability-ui)
- [insights-remediations-frontend](https://github.com/RedHatInsights/insights-remediations-frontend)
- [sed-frontend](https://github.com/RedHatInsights/sed-frontend)
- [tasks-frontend](https://github.com/RedHatInsights/tasks-frontend)
- [compliance-frontend](https://github.com/RedHatInsights/compliance-frontend)
- [patchman-ui](https://github.com/RedHatInsights/patchman-ui)
- [malware-detection-frontend](https://github.com/RedHatInsights/malware-detection-frontend)
- [ros-frontend](https://github.com/RedHatInsights/ros-frontend)
- [insights-advisor-frontend](https://github.com/RedHatInsights/insights-advisor-frontend)


## Component documentation

The repository contains components covered with the documentation comments using JSDoc markup language. The HTML documentation can be generated with the `npm run docs` script. Additionally, the documentation is automatically built with the
[Generate and Release Documentation](/.github/workflows//docs.yml) GitHub action.
The deployed documentation is available at https://redhatinsights.github.io/insights-inventory-frontend.


## Release process

This section describes the process of getting a code change from a pull request all the way to production.

### Latest image and Stage deployment

When a new pull request is opened, some jobs are run automatically, like unit tests, code style tests, E2E playwright tests, etc.

When a pull request is merged to master, a new container image is built and tagged
as [insights-inventory-frontend:latest](https://quay.io/repository/cloudservices/insights-inventory-frontend?tab=tags).
This image is then automatically deployed to
the [Stage environment](https://console-openshift-console.apps.crcs02ue1.urby.p1.openshiftapps.com/k8s/cluster/projects/host-inventory-stage).

### 1. Pre-promotion verification

#### Verify E2E Test Status

We use Playwright E2E tests triggered via GitHub Actions.
Navigate to the Actions tab in GitHub and locate the [Stage: Daily Frontend Suite](https://github.com/RedHatInsights/insights-inventory-frontend/actions/workflows/stage-daily-pw-tests.yml) workflow:

* **Check latest results**: If no PRs have been merged recently, you may verify the latest daily run results.
* **Manual run (always recommended)**:
  * In `Stage: Daily Frontend Suite` workflow click `Run workflow` against the `master` branch.
  * Wait for completion to ensure the latest PR changes haven't introduced regressions.

### 2. Promoting to production

You have two methods to update the production image SHA:

#### Manual PR via `app-interface` (targeted release)

Use this if you need to promote a specific image version (e.g., rolling back to a previous known-good SHA or skipping a buggy commit).

* Open MR for [deploy-clowder.yml](https://gitlab.cee.redhat.com/service/app-interface/-/blob/master/data/services/insights/host-inventory/deploy-clowder.yml)
file.
* Update the `ref` for `prod-frontends` and `prod-multicluster-frontends` namespaces

#### Using the `app-interface-bot` (standard release)

The bot is designed to always promote the latest validated image from the master branch.

* Navigate to the to [Bot Pipelines](https://gitlab.cee.redhat.com/osbuild/app-interface-bot/-/pipelines)
* Click `New pipeline` (top right).
* Configure the following variables:
  * HMS_SERVICE: `host-inventory`
  * HOST_INVENTORY_FRONTEND: `master`
  * FORCE: Use `--force` only if GitHub CI is failing for an unrelated/known flake.
* Click Run Pipeline.
* Result: The bot will create a MR and post the link in the `#insights-release` Slack channel.

#### Approval and monitoring

Once the MR is open (either manually or via bot):
* Validation: Review the list of PRs included. Ensure all associated Jira cards are in "Release Pending" (no cards should be "On QA").
* Review: Request a review from another Inventory team member.
* Approval: The reviewer must comment `/lgtm` to trigger the automatic merge.
* Responsibility: The engineer who approved the MR is responsible for monitoring the rollout to ensure the production environment remains stable.


### 3. Post-release verification

After the changes have successfully landed in Production (verify the deployment is complete, not just merged):
* Trigger [Prod Post-Release Sanity](https://github.com/RedHatInsights/insights-inventory-frontend/actions/workflows/prod-post-release-pw-tests.yml) workflow.
* Confirm all E2E tests pass against the live production environment.


## Common Problems You Might Encounter

* Some APIs we use require the latest version of their client package in order to enjoy the latest properties they provide.
In case you checked the Network tab in the console and had a look at the requiered API call that should contain a property you need to fetch and use, but did not see this property in the list of properties in the Response tab, make sure you have the latest version of the client package that contains this API.
To make sure the versions align,
Have a look at your `package.json` file and compare the appropriate client package version (that should have the API you need) with the latest published version on npmjs.com.
In case they don't match, update this client package to it's latest version by running this command: `npm i @redhat-cloud-services/{name-of-client-package}@latest`

Then, re-install the modules by running this command: `rm -rf node_modules && npm install`

And re-run the application.
This should solve this issue.

In case these steps did not solve your issue, it is possible that the latest package had not been released yet.
Please contact the appropriate team to release the package you are using, and go over the described process of updating the client package version again.

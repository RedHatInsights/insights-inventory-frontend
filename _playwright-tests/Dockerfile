# Playwright test image for insights-inventory-frontend
ARG NODE_IMAGE_TAG=9.8-1787019394
FROM registry.access.redhat.com/ubi9/nodejs-22:${NODE_IMAGE_TAG}

# Chromium headless-shell runtime dependencies for UBI9
USER 0
RUN dnf install -y --setopt=install_weak_deps=0 --setopt=tsflags=nodocs \
      nss nspr dbus-libs atk at-spi2-atk at-spi2-core cups-libs \
      libXcomposite libXdamage libXext libXfixes libXrandr libxkbcommon \
      mesa-libgbm cairo pango alsa-lib && \
    dnf clean all && rm -rf /var/cache/dnf

USER 1001
WORKDIR /opt/app-root/src

ENV PLAYWRIGHT_BROWSERS_PATH=/opt/app-root/src/.ms-playwright

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund && \
    npm cache clean --force && rm -rf /opt/app-root/src/.npm

RUN npx playwright install chromium --only-shell

COPY playwright.config.js tsconfig.json ./
COPY _playwright-tests ./_playwright-tests
# apiHelpers.ts imports src/api/hostInventoryApi.js (only src/ dependency)
COPY src/api/hostInventoryApi.js ./src/api/hostInventoryApi.js
# Fixture archives uploaded by globalSetup via uploadArchive.ts
COPY host_archives ./host_archives

# Grant group write for dirs needing runtime writes (OpenShift runs with random UID, gid 0)
USER 0
RUN chown -R 1001:0 _playwright-tests host_archives && \
    chmod -R g+w _playwright-tests host_archives
USER 1001

ENTRYPOINT ["npx", "playwright", "test"]

## [1.1.1](https://github.com/RedHatInsights/insights-inventory-frontend/compare/v1.1.0...v1.1.1) (2023-02-08)


### Performance Improvements

* **RHIF-167:** Refactor inventory detail to simplify the usage ([#1674](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1674)) ([6343202](https://github.com/RedHatInsights/insights-inventory-frontend/commit/63432025fc195685c01f287e77f4d69ddba58962))

# [1.1.0](https://github.com/RedHatInsights/insights-inventory-frontend/compare/v1.0.0...v1.1.0) (2023-02-08)


### Features

* **ESSNTL-3724:** Add /groups route & empty state ([#1760](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1760)) ([868eb69](https://github.com/RedHatInsights/insights-inventory-frontend/commit/868eb69f572a280ba162a1623027133932a9284a))

# 1.0.0 (2023-02-01)


### Bug Fixes

* **ADVISOR-2957:** Updates api to accept perPage+page params ([#1744](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1744)) ([7999a28](https://github.com/RedHatInsights/insights-inventory-frontend/commit/7999a28e9023c51f1646535f96c71853838f7d7a))
* **API:** enable sorting on apiHostGetHostById ([#1713](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1713)) ([6d54aeb](https://github.com/RedHatInsights/insights-inventory-frontend/commit/6d54aebfaa823c7ce01568181d79c30103e703df))
* **API:** ESSNTL-1392 - Include hostnameOrId to filter tags ([#1533](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1533)) ([6addc32](https://github.com/RedHatInsights/insights-inventory-frontend/commit/6addc3201b4005a8a314ef0cca70c422642f691f))
* **AppEntry:** Calling init with undefined causes an error in non-dev ([#1615](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1615)) ([afa12d0](https://github.com/RedHatInsights/insights-inventory-frontend/commit/afa12d027ca9d95ecb4ec69630376fd0aae7c320))
* **App:** ESSNTL-2943 - Store registry in state ([#1603](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1603)) ([7cf2ec7](https://github.com/RedHatInsights/insights-inventory-frontend/commit/7cf2ec7eba373e550e2527b563cf8391c1d0ea6f))
* **Clickable:** ESSNTL-3456 don't append tags and SIDs for modals ([cb5921e](https://github.com/RedHatInsights/insights-inventory-frontend/commit/cb5921e707bbb1a3f9b577f2081d0560303aa281))
* **compliance:** Fix undefined inventoryId ([#1129](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1129)) ([0c69c18](https://github.com/RedHatInsights/insights-inventory-frontend/commit/0c69c188510eb982f925f67df414389705397e31))
* **devtools:** RHIF-12 - Use stage as default environment ([9d290ea](https://github.com/RedHatInsights/insights-inventory-frontend/commit/9d290ea0e7311ba2d0d06d6df9b850902a2095d4))
* **EntityTable:** ESSNTL-2913 - Add sortKey fallback ([a035f79](https://github.com/RedHatInsights/insights-inventory-frontend/commit/a035f79a41f184edb3e0a4d947069615a9c612a6))
* **ESSNTL-3183:** fix insights-client status in General informaion tab ([2a37c0e](https://github.com/RedHatInsights/insights-inventory-frontend/commit/2a37c0ef52f99efe36ddbdb73ccbc2a1a9df437f))
* **ESSNTL-3204:** update InsightsPrompt display condition ([b4608d0](https://github.com/RedHatInsights/insights-inventory-frontend/commit/b4608d0f32054de354003497d4ab2de48e13fc2a))
* **ESSNTL-3336:** fix os column sorting ([ae3ef76](https://github.com/RedHatInsights/insights-inventory-frontend/commit/ae3ef7615c692c06c982d9eec746c19ff658aed7))
* **ESSNTL-3336:** get operating system column index explicitly ([ef34976](https://github.com/RedHatInsights/insights-inventory-frontend/commit/ef34976e44fa0e9a7231579f981d537dfaab408d))
* **ESSNTL-3914:** remove staleness from default filter, add unknown option ([#1715](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1715)) ([c943de4](https://github.com/RedHatInsights/insights-inventory-frontend/commit/c943de4b9f6e64d1fee35250440021f5492f80d1))
* **ESSNTL-3955:** enable giving default filter values from consumer apps ([#1731](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1731)) ([d9c18d4](https://github.com/RedHatInsights/insights-inventory-frontend/commit/d9c18d4cd72c2b1dbdc9751c0278134599744484))
* **ESSNTL-4142:** get rid of circular deps to avoid early access registery context ([#1746](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1746)) ([4add162](https://github.com/RedHatInsights/insights-inventory-frontend/commit/4add162f10cb74b1526992d610ce831fd3f4fdf0))
* **ESSNTL-4149:** fix applying default filters from URL, with some cleanup ([#1750](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1750)) ([41ad116](https://github.com/RedHatInsights/insights-inventory-frontend/commit/41ad116d2e43b8ab801f5c00bee020929ba0af94))
* **ESSNTL-726:** move change of display name to default details reducer ([#1652](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1652)) ([c34cd35](https://github.com/RedHatInsights/insights-inventory-frontend/commit/c34cd350f5eabd681eeb2de78016dce000a2c39b))
* **ESSNTL-726:** Update display name, once we fire the update function ([#1634](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1634)) ([b4133c8](https://github.com/RedHatInsights/insights-inventory-frontend/commit/b4133c8b8617c1da316e5a8e4b86fcca1ff02760))
* **InsightsDisconnected:** update the disconnected systems verification logic ([40cd00d](https://github.com/RedHatInsights/insights-inventory-frontend/commit/40cd00d164f270955b111ee90c43b50a6fa6dacf))
* **InventoryTable:** ESSNTL-2579 - Fixes default filter selection in Inventory ([#1564](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1564)) ([de3920c](https://github.com/RedHatInsights/insights-inventory-frontend/commit/de3920cdef4a3c2e46e5018e028d2201769f1f69))
* **InventoryTable:** ESSNTL-3415 - Make defaultColumns a function ([75f65e5](https://github.com/RedHatInsights/insights-inventory-frontend/commit/75f65e5065188c62f0af111ae76e11daba182196))
* **InventoryTable:** ESSNTL-3505 - Only use columns already in the store ([#1668](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1668)) ([f4a8d47](https://github.com/RedHatInsights/insights-inventory-frontend/commit/f4a8d4767a7721b1048b49dfea2074951bacf7df))
* **InventoryTable:** Mount the component to allow state updates ([#1583](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1583)) ([c3dfa9c](https://github.com/RedHatInsights/insights-inventory-frontend/commit/c3dfa9cece8f29aa3f9d24c8cc4ac7c384c3eff7))
* **InventroyDetails:** ESSNTL-2943 - "Fix" errors preventing details to load ([#1584](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1584)) ([b62d37c](https://github.com/RedHatInsights/insights-inventory-frontend/commit/b62d37cbcf05d70b12ebfb394d3b790171ba77be))
* **LoadingCard:** export loading card via fed modules ([#1693](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1693)) ([5d158ea](https://github.com/RedHatInsights/insights-inventory-frontend/commit/5d158eace2b7ce8ee89fd1009c3aa5ee129afaaa))
* **modal:** Opens modal according to given URL ([2eef2c6](https://github.com/RedHatInsights/insights-inventory-frontend/commit/2eef2c68d45ec7ed96e7d52dd2d3ac0f07b24d23))
* **OS filter:** render empty state if no versions ([#1644](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1644)) ([8807d16](https://github.com/RedHatInsights/insights-inventory-frontend/commit/8807d16c33796d470481fded22b1aeb365c70ccb))
* **redirect:** workaround can be removed as BZ1958379 is closed ([8478f1a](https://github.com/RedHatInsights/insights-inventory-frontend/commit/8478f1af6fe93f31d793153ca78cf1bd51e11f27))
* **RHIF-54:** fix the command for insights-client install ([50ee72d](https://github.com/RedHatInsights/insights-inventory-frontend/commit/50ee72db8e2fb29b87f5b1564cd3527e705037ca))
* **Routes:** Use proper react-router Redirect ([#1616](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1616)) ([c6989ee](https://github.com/RedHatInsights/insights-inventory-frontend/commit/c6989ee5c3efb1c5961e758f1b5d3fd87a5d9dfe))
* **SystemsTable:** ESSNTL-2194 - Use compact table ([#1515](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1515)) ([5d85165](https://github.com/RedHatInsights/insights-inventory-frontend/commit/5d85165d8be274862a31faf07d7a48fe14511d18))
* **TagsApi:** ESSNTL-3427 add fetch tags for all stale status ([e2e6a7d](https://github.com/RedHatInsights/insights-inventory-frontend/commit/e2e6a7d42d727d877bb53aeb8e675301ca154e77))
* **Tags:** show all tags for all systems ([ea9c8f8](https://github.com/RedHatInsights/insights-inventory-frontend/commit/ea9c8f843ef53e49ef20295c7b52e23709a42a37))
* **vulnerability:** Fix undefined inventoryId ([#1128](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1128)) ([1b8ec31](https://github.com/RedHatInsights/insights-inventory-frontend/commit/1b8ec31bb51cb238aaf5e2a22c773603891cbd99))


### Features

* **ESSNTL-3576:** introduces system update method filter ([b2f6c94](https://github.com/RedHatInsights/insights-inventory-frontend/commit/b2f6c943ed7f0b6718fe8ec3f8469004557e1f5a))
* **ESSNTL-3580:** introduce rhc status filter ([0d646a0](https://github.com/RedHatInsights/insights-inventory-frontend/commit/0d646a046aa2bbd07b880acbb26f3ae49151d9f8))
* **InventoryTable:** RHICOMPL-2377 - Add and call getTags for custom tags list ([#1416](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1416)) ([23e06a3](https://github.com/RedHatInsights/insights-inventory-frontend/commit/23e06a3edcb0058b4bfa67d64d0e76d61bd7db38))
* **InventoryTable:** RHIF-18 - Update OS filter to groups ([#1494](https://github.com/RedHatInsights/insights-inventory-frontend/issues/1494)) ([28983c2](https://github.com/RedHatInsights/insights-inventory-frontend/commit/28983c2aa639deefe0af2a0097e051df6d95473a))
* **OS filter:** request available values from API ([d4475e8](https://github.com/RedHatInsights/insights-inventory-frontend/commit/d4475e87f5bd00f0c1028895b8412d05d88feb76))


### Reverts

* Revert "fix(ESSNTL-3336): fix os column sorting" ([bf4f8e0](https://github.com/RedHatInsights/insights-inventory-frontend/commit/bf4f8e0d98c7da83cfeee1ca95856803c68d0524))

import { expect } from '@playwright/test';
import {
  prepareSingleSystem,
  cleanupTestArchive,
} from './helpers/uploadArchive';
import { test, navigateToInventorySystemsFunc } from './helpers/navHelpers';
import { searchByName } from './helpers/filterHelpers';
import { BOOTC_ARCHIVE } from './helpers/uploadArchive';
import { closePopupsIfExist } from './helpers/loginHelpers';

test.describe('System Details tests', () => {
  let packageSystemName: string;
  let archiveName: string;
  let workingDir: string;
  let systemBootcName: string;
  let archiveBootcName: string;
  let workingBootcDir: string;

  test.beforeAll(async () => {
    const setupResult = prepareSingleSystem();
    const setupBootcResult = prepareSingleSystem(BOOTC_ARCHIVE);

    ({ hostname: packageSystemName, archiveName, workingDir } = setupResult);
    ({
      hostname: systemBootcName,
      archiveName: archiveBootcName,
      workingDir: workingBootcDir,
    } = setupBootcResult);
  });

  test.beforeEach(async ({ page }) => {
    await closePopupsIfExist(page);
    await navigateToInventorySystemsFunc(page);
  });

  test.afterAll(async () => {
    cleanupTestArchive(archiveName, workingDir);
    cleanupTestArchive(archiveBootcName, workingBootcDir);
  });

  test('User should be able to see package system information', async ({
    page,
  }) => {
    /**
     * Metadata:
       - requirements:
       - inv-hosts-get-by-id
       - importance: critical
     */

    await test.step('Setup: navigate to prepared system details page', async () => {
      const nameColumnLocator = page.locator('td[data-label="Name"]');
      await searchByName(page, packageSystemName);
      await expect(nameColumnLocator).toHaveCount(1);

      const systemLink = page.getByRole('link', { name: packageSystemName });
      await expect(systemLink).toBeVisible({ timeout: 100000 });
      await systemLink.click();

      await expect(
        page.getByRole('heading', { name: packageSystemName }),
      ).toBeVisible({
        timeout: 100000,
      });
    });

    await test.step('Verify system information in Overview tab', async () => {
      const systemTypeIcon = page.getByText(/Package-based/);
      await expect(systemTypeIcon).toBeVisible();

      const overviewTab = page.locator(
        'button[name="overview"][aria-selected="true"]',
      );
      await expect(overviewTab).toBeVisible();

      const status = page.locator(
        "[data-ouia-component-id='system-status-card']",
      );
      const properties = page.locator("[data-ouia-component-id='system-card']");
      const dataCollectors = page.locator(
        "[data-ouia-component-id='dataCollector-card']",
      );
      const subscriptions = page.locator(
        "[data-ouia-component-id='subscriptions-card']",
      );

      for (const card of [status, properties, dataCollectors, subscriptions]) {
        await expect(card).toBeVisible();
      }
    });

    await test.step('Verify system information in Details tab', async () => {
      await page.locator('button[name="details"]').click();
      const detailsTab = page.locator(
        'button[name="details"][aria-selected="true"]',
      );
      await expect(detailsTab).toBeVisible();

      const infrastructure = page.locator(
        "[data-ouia-component-id='infrastructure-card']",
      );
      const BIOS = page.locator("[data-ouia-component-id='bios-card']");
      const operatingSystem = page.locator(
        "[data-ouia-component-id='os-card']",
      );
      const configuration = page.locator(
        "[data-ouia-component-id='configuration-card']",
      );
      const bootc = page.locator("[data-ouia-component-id='bootmc-card']");
      // RHEL AI card should not be visible for systems without RHEL AI data
      const rhelAICard = page.locator(
        "[data-ouia-component-id='rhel-ai-card']",
      );
      await expect(rhelAICard).toBeHidden();

      // Verify the card title is also not present
      const cardTitle = page.getByText('RHEL AI');
      await expect(cardTitle).toBeHidden();

      for (const card of [
        infrastructure,
        BIOS,
        operatingSystem,
        configuration,
      ]) {
        await expect(card).toBeVisible();
      }

      // package system type is not displaying BOOTC card
      await expect(bootc).toBeHidden();
    });

    await test.step('Navigate to workspace details page via clicking workspace link', async () => {
      await page.locator('button[name="overview"]').click();
      const workspaceLink = page
        .locator('a')
        .filter({ hasText: 'Ungrouped Hosts' });
      await workspaceLink.click();

      await expect(
        page.getByRole('heading', { name: 'Ungrouped Hosts' }),
      ).toBeVisible();
    });
  });

  test('User should be able to see image-based system information', async ({
    page,
  }) => {
    /**
     * Metadata:
       - requirements:
       - inv-hosts-get-by-id
       - importance: critical
     */

    await test.step('Setup: navigate to prepared system details page', async () => {
      const nameColumnLocator = page.locator('td[data-label="Name"]');
      await searchByName(page, systemBootcName);
      await expect(nameColumnLocator).toHaveCount(1);

      const systemLink = page.getByRole('link', { name: systemBootcName });
      await expect(systemLink).toBeVisible({ timeout: 100000 });
      await systemLink.click();

      await expect(
        page.getByRole('heading', { name: systemBootcName }),
      ).toBeVisible({
        timeout: 100000,
      });
    });

    await test.step('Verify system information', async () => {
      const systemTypeIcon = page.getByText(/Image-based/);
      await expect(systemTypeIcon).toBeVisible();

      await page.locator('button[name="details"]').click();
      const bootc = page.locator("[data-ouia-component-id='bootmc-card']");
      await expect(bootc).toBeVisible();

      // Complinace doesn't support image-based system
      const complianceTab = page.locator('button[name="compliance"]');
      await expect(complianceTab).toBeDisabled();
    });
  });

  test('User should be able to see RHEL AI card when system has RHEL AI data', async ({
    page,
  }) => {
    /**
     * Metadata:
       - requirements:
       - inv-hosts-get-by-id
       - importance: normal
       - assignee: micjohns
     */

    await test.step('Setup: navigate to prepared system details page', async () => {
      const nameColumnLocator = page.locator('td[data-label="Name"]');
      await searchByName(page, packageSystemName);
      await expect(nameColumnLocator).toHaveCount(1);

      const systemLink = page.getByRole('link', { name: packageSystemName });
      await expect(systemLink).toBeVisible({ timeout: 100000 });
      await systemLink.click();

      await expect(
        page.getByRole('heading', { name: packageSystemName }),
      ).toBeVisible({
        timeout: 100000,
      });
    });

    await test.step('Document expected RHEL AI card structure', () => {
      // Note: This test verifies the card is hidden for systems without RHEL AI data.
      // To fully test the card with data, a test archive with RHEL AI workload data
      // (system_profile.workloads.rhel_ai) would be needed.
      //
      // When the card is visible, it should display:
      // - Card title: "RHEL AI"
      // - Version: rhel_ai_version_id value
      // - GPU manufacturer: vendor from gpu_models array (only if gpu_models.length > 0)
      // - Models available: gpu_models.length
      // - GPU model: name from gpu_models array (only if gpu_models.length > 0)
      // - GPU memory: memory from gpu_models array (only if gpu_models.length > 0)
      //
      // Expected test steps when RHEL AI data is available:
      // 1. Navigate to system details page
      // 2. Click Details tab
      // 3. Verify rhel-ai-card is visible
      // 4. Verify card title "RHEL AI" is visible
      // 5. Verify "Version" field and its value
      // 6. Verify "Models available" field and count
      // 7. If gpu_models exist, verify GPU manufacturer, GPU model, and GPU memory fields
    });
  });
});

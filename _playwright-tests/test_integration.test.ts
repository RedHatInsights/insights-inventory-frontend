import { ConsoleMessage, expect } from '@playwright/test';
import { test } from './helpers/navHelpers';

// URL constants
const systemsPageUrls = [
  { name: 'Patch', url: '/insights/patch/systems' },
  { name: 'Advisor', url: '/insights/advisor/systems' },
  {
    name: 'Advisor Recommendation Details ',
    url: '/insights/advisor/recommendations/hardening_logging_auditd%7CHARDENING_LOGGING_5_AUDITD',
  },
  { name: 'Vulnerability', url: '/insights/vulnerability/systems' },
  { name: 'Compliance', url: '/insights/compliance/systems' },
  { name: 'Malware', url: '/insights/malware/systems' },
  { name: 'Tasks', url: '/insights/tasks/available/insights-client' },
  {
    name: 'Remediation Plan',
    url: '/insights/remediations/e444a91d-17ae-4cd3-94cf-e5b472d3c50a?activeTab=plannedRemediations',
  },
];

// Error Strings
const failedLoadComponent =
  'Unable to load inventory component. Failed to load section';
const typeError =
  "TypeError: Cannot read properties of undefined (reading 'page')";
const scalprumError =
  "Scalprum encountered an error! Cannot read properties of undefined (reading 'page')";

test.describe('Inventory federated modules check @integration', () => {
  for (const service of systemsPageUrls) {
    test(`Verify Inventory Table in: ${service.name}`, async ({ page }) => {
      const logs: string[] = [];

      // Setup Listener BEFORE navigation
      page.on('console', (message: ConsoleMessage) => {
        const text = message.text();
        const isCriticalError =
          text.includes(failedLoadComponent) ||
          text.includes(typeError) ||
          text.includes(scalprumError);

        if (message.type() === 'error' && isCriticalError) {
          logs.push(text);
        }
      });

      await page.goto(service.url);
      // eslint-disable-next-line playwright/no-networkidle
      await page.waitForLoadState('networkidle');

      expect(
        logs,
        `Found ${logs.length} critical console errors on ${service.name}`,
      ).toHaveLength(0);
    });
  }
});

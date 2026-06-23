import type { ConsumerApplicationsData } from '@redhat-cloud-services/host-inventory-client';

/**
 * Column app types for Systems View. Add per-app sections here as columns
 * adopt shared count/link cell patterns (e.g. AppDataCount).
 */

/** Keys on vulnerability `app_data` from host-inventory-client. */
export type VulnerabilityField = keyof NonNullable<
  ConsumerApplicationsData['vulnerability']
>;

/** Fields rendered as linked count columns in vulnerability columnDefinitions. */
export type VulnerabilityCountField = VulnerabilityField | 'important_cves';

/**
 * Extended until important_cves ships in host-inventory-client.
 * TODO(host-inventory-client): remove when important_cves is on VulnerabilityAppData.
 */
export type VulnerabilityAppDataExtended = NonNullable<
  ConsumerApplicationsData['vulnerability']
> & {
  important_cves?: number | null;
};

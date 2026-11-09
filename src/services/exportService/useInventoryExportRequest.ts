import { useCallback, useEffect, useRef } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { DOWNLOAD_CHECK_INTERVAL, EXPORT_SERVICE_PATH } from './constants';
import { buildExportRequestJson, downloadFile } from './helpers';
import type { ExportFormat } from '../../components/SystemsView/export/types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Upper bound on how long an export may poll before giving up. Generous on
 * purpose — large orgs take a while to export — this only guards against a
 * stuck 'pending' that would otherwise keep the export menu disabled until
 * a page reload.
 */
export const MAX_POLL_DURATION_MS = 10 * 60 * 1000;

/**
 * Drives an inventory export-service request: creates the export from the
 * given request filters, polls until it completes, and downloads the file.
 *
 * The filters decide the export's scope: `{ configuration }` for a WYSIWYG
 * export of the current view, or `{}` for the legacy export of all systems.
 *
 * Resolves when the download has started and rejects on failure — the caller
 * (the SystemsView export menu) owns the toast lifecycle around this promise.
 * Polling (and the download) stop quietly if the host component unmounts
 * mid-export, e.g. when the user navigates away — the promise still resolves
 * in that case, so callers reporting outcomes must check their own mount
 * state rather than treat fulfillment as a completed download.
 */
export const useInventoryExportRequest = () => {
  const axios = useAxiosWithPlatformInterceptors();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(
    async (format: ExportFormat, filters: Record<string, unknown>) => {
      // The platform axios instance registers responseDataInterceptor, which
      // resolves requests with response.data (NOT the axios response) — so the
      // resolved values below are the export resource and its status directly.
      const exportResource = (await axios.post(
        `${EXPORT_SERVICE_PATH}/exports`,
        buildExportRequestJson(filters, format),
      )) as unknown as { id: string };

      // Poll until the export is ready to download.
      const pollStartedAt = Date.now();
      for (;;) {
        await sleep(DOWNLOAD_CHECK_INTERVAL);

        if (!isMounted.current) {
          // The host unmounted mid-export — stop polling quietly.
          return;
        }
        if (Date.now() - pollStartedAt > MAX_POLL_DURATION_MS) {
          throw new Error('Export timed out');
        }

        const exportStatus = (await axios.get(
          `${EXPORT_SERVICE_PATH}/exports/${exportResource.id}/status`,
        )) as unknown as { status: string };
        if (exportStatus.status === 'complete') {
          await downloadFile(
            `${EXPORT_SERVICE_PATH}/exports/${exportResource.id}`,
          );
          return;
        }
        if (exportStatus.status === 'failed') {
          throw new Error('Export failed');
        }
      }
    },
    [axios],
  );
};

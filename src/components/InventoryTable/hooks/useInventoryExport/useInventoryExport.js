import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { useCallback } from 'react';
import { EXPORT_SERVICE_PATH, EXPORT_FILE_FORMAT } from './constants';
import { buildExportRequestJson, downloadFile } from './helpers';
import useExportApi from './useExportApi';
import useExportDownloadCheck from './useExportDownloadCheck';

const CSV_ITEM_TEXT = 'Export all systems to CSV';
const JSON_ITEM_TEXT = 'Export all systems to JSON';

/**
 * A hook encapsulating functionality to provide an export configuration for the InventoryTable to request an export.
 *
 *  @param   {object} [options]         Options
 *  @param   {object} [options.filters] (unused) Filters currently active in the InventoryTable and passed along to the export request
 *  @param   {object} [options.axios]   Axios instance
 *
 *  @returns {object}                   [exportConfig] An object to pass to exportConfig
 *
 */
const useInventoryExport = ({ filters = {}, axios } = {}) => {
  const { create } = useExportApi(axios);
  const addNotification = useAddNotification();
  const onError = () => {
    addNotification({
      id: 'inventory-export-error',
      variant: 'danger',
      title: 'The requested export could not be created. Please try again.',
    });
  };
  const checkForDownload = useExportDownloadCheck({
    axios,
    onDownloadAvailable: async (exportToDownload) => {
      try {
        await downloadFile(
          EXPORT_SERVICE_PATH + '/exports/' + exportToDownload.id,
          {
            format: EXPORT_FILE_FORMAT,
          },
        );
        addNotification({
          id: 'inventory-export-download',
          variant: 'success',
          title: 'The requested export is being downloaded.',
        });
      } catch {
        onError();
      }
    },
    onError,
  });

  const onSelect = useCallback(
    (_, format) =>
      create(buildExportRequestJson(filters, format), {
        onError,
        onSuccess: (data) => {
          addNotification({
            id: 'inventory-export-success',
            variant: 'info',
            title:
              'The requested export is being prepared. When ready, the download will start automatically.',
          });
          checkForDownload(data.id);
        },
      }),
    [filters],
  );

  return {
    itemTexts: {
      csv: CSV_ITEM_TEXT,
      json: JSON_ITEM_TEXT,
    },
    onSelect,
  };
};

export default useInventoryExport;

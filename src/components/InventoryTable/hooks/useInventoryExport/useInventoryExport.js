import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { useCallback, useState } from 'react';
import { EXPORT_SERVICE_PATH, EXPORT_FILE_FORMAT } from './constants';
import { buildExportRequestJson, downloadFile } from './helpers';
import useExportApi from './useExportApi';
import useExportDownloadCheck from './useExportDownloadCheck';

const CSV_ITEM_TEXT = 'Export all systems to CSV';
const JSON_ITEM_TEXT = 'Export all systems to JSON';
const WYSIWYG_CSV_ITEM_TEXT = 'Export to CSV';
const WYSIWYG_JSON_ITEM_TEXT = 'Export to JSON';

/**
 * A hook encapsulating functionality to provide an export configuration for the InventoryTable to request an export.
 *
 *  @param   {object} [options]               Options
 *  @param   {object} [options.filters]       (legacy, unused by backend) Filters passed along to the export request
 *  @param   {object} [options.configuration] ViewConfiguration describing the table's current filters,
 *                                            columns, and sort. When provided, the export service replays it
 *                                            for a WYSIWYG export across all pages (SystemsView-based tables).
 *  @param   {object} [options.axios]         Axios instance
 *
 *  @returns {object}                         [exportConfig] An object to pass to exportConfig
 *
 */
const useInventoryExport = ({ filters = {}, configuration, axios } = {}) => {
  const { create } = useExportApi(axios);
  const addNotification = useAddNotification();
  const [isDisabled, setIsDisabled] = useState(false);
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
      } finally {
        setIsDisabled(false);
      }
    },
    onError,
  });

  const onSelect = useCallback(
    (_, format) => {
      setIsDisabled(true);
      const requestFilters = configuration
        ? { ...filters, configuration }
        : filters;
      create(buildExportRequestJson(requestFilters, format), {
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
      });
    },
    [filters, configuration, setIsDisabled],
  );

  return {
    itemTexts: {
      csv: configuration ? WYSIWYG_CSV_ITEM_TEXT : CSV_ITEM_TEXT,
      json: configuration ? WYSIWYG_JSON_ITEM_TEXT : JSON_ITEM_TEXT,
    },
    onSelect,
    isDisabled,
  };
};

export default useInventoryExport;

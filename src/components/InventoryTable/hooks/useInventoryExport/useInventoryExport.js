import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  exportSuccessNotifiction,
  exportErrorNotifiction,
  exportDownloadNotifiction,
} from '../../../../store/actions';
import { EXPORT_SERVICE_PATH, EXPORT_FILE_FORMAT } from './constants';
import { buildExportRequestJson, downloadFile } from './helpers';
import useExportApi from './useExportApi';
import useExportDownloadCheck from './useExportDownloadCheck';

const CSV_ITEM_TEXT = 'Export all systems to CSV';
const JSON_ITEM_TEXT = 'Export all systems to JSON';

/**
 * A hook encapsulating functionality to provide an export configuration for the InventoryTable to request an export.
 *
 *  @param   {object}   [options]         Options
 *  @param   {object}   [options.filters] (unused) Filters currently active in the InventoryTable and passed along to the export request
 *
 *  @returns {object}                     [exportConfig] An object to pass to exportConfig
 *  @returns {Function}                   [exportConfig.onSelect] onSelect callback for the exportConfig called when a export format is selected
 *
 */
const useInventoryExport = ({ filters = {} } = {}) => {
  const dispatch = useDispatch();
  const { create } = useExportApi();
  const onError = () => {
    dispatch(exportErrorNotifiction());
  };
  const checkForDownload = useExportDownloadCheck({
    onDownloadAvailable: async (exportToDownload) => {
      try {
        await downloadFile(
          EXPORT_SERVICE_PATH + '/exports/' + exportToDownload.id,
          {
            format: EXPORT_FILE_FORMAT,
          },
        );
        dispatch(exportDownloadNotifiction());
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
          dispatch(exportSuccessNotifiction());
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

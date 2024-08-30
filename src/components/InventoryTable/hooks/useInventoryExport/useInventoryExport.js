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

const useInventoryExport = ({ filters = {} } = {}) => {
  const dispatch = useDispatch();
  const { create } = useExportApi();
  const checkForDownload = useExportDownloadCheck({
    onDownloadAvailable: async (exportToDownload) => {
      await downloadFile(
        EXPORT_SERVICE_PATH + '/exports/' + exportToDownload.id,
        {
          format: EXPORT_FILE_FORMAT,
        }
      );
      dispatch(exportDownloadNotifiction());
    },
    onError: () => {
      dispatch(exportErrorNotifiction());
    },
  });

  const onSelect = useCallback(
    (_, format) =>
      create(buildExportRequestJson(filters, format), {
        onError: () => {
          dispatch(exportErrorNotifiction());
        },
        onSuccess: (data) => {
          dispatch(exportSuccessNotifiction());
          checkForDownload(data.id);
        },
      }),
    [filters]
  );

  return {
    onSelect,
  };
};

export default useInventoryExport;

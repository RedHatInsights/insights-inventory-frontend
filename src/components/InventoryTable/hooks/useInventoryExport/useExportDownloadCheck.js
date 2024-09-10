import { useRef, useState, useEffect, useCallback } from 'react';
import { DOWNLOAD_CHECK_INTERVAL } from './constants';
import useExportApi from './useExportApi';

/**
 *  A hook to periodically check for an available download for an export
 *
 *  @param {object} [options] Options
 *  @param {object} [options.onDownloadAvailable] Callback function, called when the requested export is available to download
 *  @param {object} [options.onError] Callback function, called when the requested export failed or an error occured
 *
 *  @returns {function} Function to set an export ID to check for
 *
 */
const useExportDownloadCheck = ({ onDownloadAvailable, onError }) => {
  const { status } = useExportApi();
  const checking = useRef(false);
  const [checkForDownload, setCheckForDownload] = useState();

  const checkDownloads = useCallback(
    async (checkForExportId) => {
      checking.current = true;
      try {
        const exportStatus = await status(checkForExportId);

        if (exportStatus.status === 'complete') {
          setCheckForDownload(undefined);
          checking.current = false;
          await onDownloadAvailable?.(exportStatus);
        } else if (exportStatus.status === 'failed') {
          throw new Error('Export failed');
        } else {
          checking.current = false;
          console.log('No download for ', checkForExportId);
        }
      } catch (error) {
        checking.current = false;
        console.error(error);
        setCheckForDownload(undefined);
        onError?.(error);
      }
    },
    [status, onDownloadAvailable, checking, onError]
  );

  useEffect(() => {
    if (checkForDownload) {
      const downloadCheck = setInterval(async () => {
        if (!checking.current) {
          await checkDownloads(checkForDownload);
        }
      }, DOWNLOAD_CHECK_INTERVAL);

      return () => {
        setCheckForDownload(undefined);
        clearInterval(downloadCheck);
      };
    }
  }, [checkForDownload]);

  return setCheckForDownload;
};

export default useExportDownloadCheck;

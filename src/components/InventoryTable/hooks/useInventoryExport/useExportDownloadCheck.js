import { useRef, useState, useEffect, useCallback } from 'react';
import { DOWNLOAD_CHECK_INTERVAL } from './constants';
import useExportApi from './useExportApi';

const useExportDownloadCheck = ({ onDownloadAvailable, onError }) => {
  const { list } = useExportApi();
  const checking = useRef(false);
  const [checkForDownload, setCheckForDownload] = useState();

  const checkDownloads = useCallback(
    async (checkForExportId) => {
      checking.current = true;
      try {
        const exportsToDownload = await list();
        const exportToDownload = exportsToDownload.data.find(
          ({ id, status }) => id === checkForExportId && status === 'complete'
        );

        if (exportToDownload) {
          setCheckForDownload(undefined);
          checking.current = false;

          await onDownloadAvailable?.(exportToDownload);
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
    [list, onDownloadAvailable, checking]
  );

  useEffect(() => {
    if (checkForDownload) {
      const downloadCheck = setInterval(async () => {
        if (checking.current) {
          return;
        }

        await checkDownloads(checkForDownload);
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

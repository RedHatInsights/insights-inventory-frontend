import React from 'react';
import Status from './Status';
import { getDeviceStatus } from './helpers';

export const edgeColumns = [
  {
    key: 'ImageName',
    title: 'Image',
    sort: false,
    renderFunc: (imageName, uuid) => {
      return <a href={`/edge/inventory/${uuid}`}>{imageName}</a>;
    },
    props: { isStatic: true },
  },
  {
    key: 'Status',
    title: 'Status',
    sort: false,
    renderFunc: (
      StatusText,
      DEVICE_ID,
      { UpdateAvailable, DispatcherStatus }
    ) => {
      const deviceStatus = getDeviceStatus(
        StatusText,
        UpdateAvailable,
        DispatcherStatus
      );

      return deviceStatus === 'error' || deviceStatus === 'unresponsive' ? (
        <Status
          type={
            deviceStatus === 'error'
              ? 'errorWithExclamationCircle'
              : deviceStatus
          }
          isLink={true}
        />
      ) : (
        <Status
          type={
            deviceStatus === 'error'
              ? 'errorWithExclamationCircle'
              : deviceStatus
          }
        />
      );
    },
  },
];

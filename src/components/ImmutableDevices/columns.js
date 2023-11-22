import React from 'react';
import Status from './Status';
import { getDeviceStatus } from './helpers';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

const ImageNameCell = (imageName, __uuid, { ImageSetID }) => {
  return (
    <InsightsLink
      aria-label="image-name-link"
      to={`/manage-edge-images/${ImageSetID}`}
      app="image-builder"
    >
      {imageName}
    </InsightsLink>
  );
};

export const edgeColumns = [
  {
    key: 'ImageName',
    title: 'Image',
    renderFunc: ImageNameCell,
    props: { isStatic: true },
  },
  {
    key: 'Status',
    title: 'Status',
    props: { isStatic: true },
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

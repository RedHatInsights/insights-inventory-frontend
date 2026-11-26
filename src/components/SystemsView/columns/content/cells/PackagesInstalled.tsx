import React from 'react';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import CellValue from '../../CellValue';
import { PatchAppData } from '@redhat-cloud-services/host-inventory-client';

const PATCH_DATA_NOT_AVAILABLE =
  'Patch data has not been collected for this system';

interface PackagesInstalledProps {
  appData: PatchAppData | undefined;
  systemId: string;
}

const PackagesInstalled = ({ appData, systemId }: PackagesInstalledProps) => {
  if (!appData) {
    return <CellValue type="notAvailable" reason={PATCH_DATA_NOT_AVAILABLE} />;
  }

  const count = appData.packages_installed;

  if (count === null || count === undefined) {
    return <CellValue type="notAvailable" reason={PATCH_DATA_NOT_AVAILABLE} />;
  }

  if (count === 0) {
    return <CellValue type="present" value={count} />;
  }

  const patchSystemLink = {
    pathname: `/${systemId}`,
    search: 'appName=patch',
  };

  return (
    <CellValue
      type="present"
      value={
        <InsightsLink app="inventory" to={patchSystemLink} preview={false}>
          {count}
        </InsightsLink>
      }
    />
  );
};

export default PackagesInstalled;

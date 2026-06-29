import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import AdvisoryIcon from '../../../../AdvisoryIcon/AdvisoryIcon';
import {
  BugIcon,
  EnhancementIcon,
  FlagIcon,
  SecurityIcon,
} from '@patternfly/react-icons';
import { PatchAppData } from '@redhat-cloud-services/host-inventory-client';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import CellValue from '../../CellValue';

type AdvisoryCountsTuple = [
  rhea: number,
  rhba: number,
  rhsa: number,
  other: number,
];

/**
 * Maps patch `app_data.patch` advisory fields into counts for installable advisories.
 *
 *  @param appData - Raw patch appData object from the API.
 *  @returns       Tuple `[rhea, rhba, rhsa, other]` for advisory icons.
 */
function patchAppDataToInstallableCounts(
  appData: PatchAppData,
): AdvisoryCountsTuple {
  const suffix = '_installable';
  const getCount = (advisoryType: 'rhea' | 'rhba' | 'rhsa' | 'other') =>
    appData?.[`advisories_${advisoryType}${suffix}`] as number;

  return [
    getCount('rhea'),
    getCount('rhba'),
    getCount('rhsa'),
    getCount('other'),
  ];
}

interface InstallableAdvisoriesProps {
  appData: PatchAppData | undefined;
  systemId: string;
}

const InstallableAdvisories = ({
  appData,
  systemId,
}: InstallableAdvisoriesProps) => {
  const [rhea, rhba, rhsa, other] = appData
    ? patchAppDataToInstallableCounts(appData)
    : [0, 0, 0, 0];
  const allZero = [rhea, rhba, rhsa, other].every((item) => item === 0);
  const patchSystemLink = { pathname: `/systems/${systemId}` };

  const value = !allZero ? (
    <Flex style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
      {rhsa !== 0 && (
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <InsightsLink app="patch" to={patchSystemLink} preview={false}>
            <AdvisoryIcon
              tooltipText="Security advisories"
              count={rhsa}
              Icon={SecurityIcon}
            />
          </InsightsLink>
        </FlexItem>
      )}
      {rhba !== 0 && (
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <InsightsLink app="patch" to={patchSystemLink} preview={false}>
            <AdvisoryIcon tooltipText="Bug fixes" count={rhba} Icon={BugIcon} />
          </InsightsLink>
        </FlexItem>
      )}
      {rhea !== 0 && (
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <InsightsLink app="patch" to={patchSystemLink} preview={false}>
            <AdvisoryIcon
              tooltipText="Enhancements"
              count={rhea}
              Icon={EnhancementIcon}
            />
          </InsightsLink>
        </FlexItem>
      )}
      {other !== 0 && (
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <InsightsLink app="patch" to={patchSystemLink} preview={false}>
            <AdvisoryIcon tooltipText="Other" count={other} Icon={FlagIcon} />
          </InsightsLink>
        </FlexItem>
      )}
    </Flex>
  ) : null;

  return (
    <CellValue
      value={appData ? value : undefined}
      fallback="No installable advisories"
    />
  );
};

export default InstallableAdvisories;

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
  value: PatchAppData;
}

const InstallableAdvisories = ({ value }: InstallableAdvisoriesProps) => {
  const [rhea, rhba, rhsa, other] = patchAppDataToInstallableCounts(value);
  const allZero = [rhea, rhba, rhsa, other].every((item) => item === 0);

  return (
    <Flex style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
      {allZero && 'No installable advisories'}
      {rhsa !== 0 && (
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <InsightsLink
            app="patch"
            to={{
              pathname: '/advisories',
            }}
            preview={false}
          >
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
          <InsightsLink
            app="patch"
            to={{
              pathname: '/advisories',
            }}
            preview={false}
          >
            <AdvisoryIcon tooltipText="Bug fixes" count={rhba} Icon={BugIcon} />
          </InsightsLink>
        </FlexItem>
      )}
      {rhea !== 0 && (
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <InsightsLink
            app="patch"
            to={{
              pathname: '/advisories',
            }}
            preview={false}
          >
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
          <InsightsLink
            app="patch"
            to={{
              pathname: '/advisories',
            }}
            preview={false}
          >
            <AdvisoryIcon tooltipText="Other" count={other} Icon={FlagIcon} />
          </InsightsLink>
        </FlexItem>
      )}
    </Flex>
  );
};

export default InstallableAdvisories;

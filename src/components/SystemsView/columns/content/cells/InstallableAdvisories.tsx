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

const PATCH_DATA_NOT_AVAILABLE =
  'Patch data has not been collected for this system';
export const NOT_SET = 'No installable advisories';

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

interface AdvisoryIconWithLinkProps {
  count: number;
  tooltipText: string;
  Icon: React.ComponentType;
  systemId: string;
  advisoryType: 'security' | 'bugfix' | 'enhancement' | 'other';
}

const AdvisoryIconWithLink: React.FC<AdvisoryIconWithLinkProps> = ({
  count,
  tooltipText,
  Icon,
  systemId,
  advisoryType,
}) => {
  const patchSystemLink = {
    pathname: `/${systemId}`,
    search: `appName=patch&offset=0&filter[advisory_type_name]=${advisoryType}`,
  };

  const iconAndCount = (
    <AdvisoryIcon tooltipText={tooltipText} count={count} Icon={Icon} />
  );

  // Only link if count > 0
  if (count > 0) {
    return (
      <InsightsLink app="inventory" to={patchSystemLink} preview={false}>
        {iconAndCount}
      </InsightsLink>
    );
  }

  return iconAndCount;
};

interface InstallableAdvisoriesProps {
  appData: PatchAppData | undefined;
  systemId: string;
}

const InstallableAdvisories = ({
  appData,
  systemId,
}: InstallableAdvisoriesProps) => {
  if (!appData) {
    return <CellValue type="notAvailable" reason={PATCH_DATA_NOT_AVAILABLE} />;
  }

  const [rhea, rhba, rhsa, other] = patchAppDataToInstallableCounts(appData);

  // Check if all advisory data is missing (null/undefined)
  const allMissing = [rhea, rhba, rhsa, other].every(
    (count) => count === null || count === undefined,
  );

  if (allMissing) {
    return <CellValue type="notAvailable" reason={PATCH_DATA_NOT_AVAILABLE} />;
  }

  // Convert null/undefined to 0 for display (only if we have at least some valid data)
  const rheaCount = rhea ?? 0;
  const rhbaCount = rhba ?? 0;
  const rhsaCount = rhsa ?? 0;
  const otherCount = other ?? 0;

  const allZero = [rheaCount, rhbaCount, rhsaCount, otherCount].every(
    (count) => count === 0,
  );

  if (allZero) {
    return <CellValue type="notSet" value={NOT_SET} />;
  }

  return (
    <CellValue
      type="present"
      value={
        <Flex style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
          <FlexItem spacer={{ default: 'spacerXs' }}>
            <AdvisoryIconWithLink
              tooltipText="Security advisories"
              count={rhsaCount}
              Icon={SecurityIcon}
              systemId={systemId}
              advisoryType="security"
            />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacerXs' }}>
            <AdvisoryIconWithLink
              tooltipText="Bug fixes"
              count={rhbaCount}
              Icon={BugIcon}
              systemId={systemId}
              advisoryType="bugfix"
            />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacerXs' }}>
            <AdvisoryIconWithLink
              tooltipText="Enhancements"
              count={rheaCount}
              Icon={EnhancementIcon}
              systemId={systemId}
              advisoryType="enhancement"
            />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacerXs' }}>
            <AdvisoryIconWithLink
              tooltipText="Other"
              count={otherCount}
              Icon={FlagIcon}
              systemId={systemId}
              advisoryType="other"
            />
          </FlexItem>
        </Flex>
      }
    />
  );
};

export default InstallableAdvisories;

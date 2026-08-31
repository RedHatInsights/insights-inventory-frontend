import React from 'react';
import { Flex, FlexItem, Icon, Tooltip } from '@patternfly/react-core';
import {
  CriticalRiskIcon,
  AngleDoubleUpIcon,
  EqualsIcon,
  AngleDoubleDownIcon,
} from '@patternfly/react-icons';
import { AdvisorAppData } from '@redhat-cloud-services/host-inventory-client';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import CellValue from '../../CellValue';

const ADVISOR_DATA_NOT_AVAILABLE =
  'Advisor data has not been collected for this system';
export const NOT_SET = 'No recommendations';

interface SeverityIconProps {
  count: number;
  tooltipText: string;
  Icon: React.ComponentType;
  status?: 'danger' | 'warning' | 'info' | 'custom';
  iconColor?: string;
  systemId: string;
}

const SeverityIcon: React.FC<SeverityIconProps> = ({
  count,
  tooltipText,
  Icon: IconComponent,
  status,
  iconColor,
  systemId,
}) => {
  const advisorSystemLink = {
    pathname: `/${systemId}`,
    search: 'appName=advisor',
  };

  const iconAndCount = (
    <Tooltip content={tooltipText}>
      <Flex style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
        <FlexItem spacer={{ default: 'spacerSm' }}>
          {iconColor ? (
            <span style={{ color: iconColor }}>
              <IconComponent />
            </span>
          ) : (
            <Icon status={status}>
              <IconComponent />
            </Icon>
          )}
        </FlexItem>
        <FlexItem spacer={{ default: 'spacerSm' }}>{count}</FlexItem>
      </Flex>
    </Tooltip>
  );

  // Only link if count > 0
  if (count > 0) {
    return (
      <InsightsLink app="inventory" to={advisorSystemLink} preview={false}>
        {iconAndCount}
      </InsightsLink>
    );
  }

  return iconAndCount;
};

interface AdvisorRecommendationsProps {
  appData: AdvisorAppData | undefined;
  systemId: string;
}

const AdvisorRecommendations = ({
  appData,
  systemId,
}: AdvisorRecommendationsProps) => {
  if (!appData) {
    return (
      <CellValue type="notAvailable" reason={ADVISOR_DATA_NOT_AVAILABLE} />
    );
  }

  // Check if all severity data is missing (null/undefined)
  const allMissing = [
    appData.critical,
    appData.important,
    appData.moderate,
    appData.low,
  ].every((count) => count === null || count === undefined);

  if (allMissing) {
    return (
      <CellValue type="notAvailable" reason={ADVISOR_DATA_NOT_AVAILABLE} />
    );
  }

  // Convert null/undefined to 0 for display (only if we have at least some valid data)
  const critical = appData.critical ?? 0;
  const important = appData.important ?? 0;
  const moderate = appData.moderate ?? 0;
  const low = appData.low ?? 0;

  const allZero = [critical, important, moderate, low].every(
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
            <SeverityIcon
              tooltipText="Critical"
              count={critical}
              Icon={CriticalRiskIcon}
              status="danger"
              systemId={systemId}
            />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacerXs' }}>
            <SeverityIcon
              tooltipText="Important"
              count={important}
              Icon={AngleDoubleUpIcon}
              iconColor="var(--pf-t--color--orange--40)"
              systemId={systemId}
            />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacerXs' }}>
            <SeverityIcon
              tooltipText="Moderate"
              count={moderate}
              Icon={EqualsIcon}
              status="warning"
              systemId={systemId}
            />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacerXs' }}>
            <SeverityIcon
              tooltipText="Low"
              count={low}
              Icon={AngleDoubleDownIcon}
              status="info"
              systemId={systemId}
            />
          </FlexItem>
        </Flex>
      }
    />
  );
};

export default AdvisorRecommendations;

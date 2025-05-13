import React from 'react';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { CullingInformation } from '@redhat-cloud-services/frontend-components/CullingInfo';
import { TagWithDialog } from '../Utilities/index';
import { REPORTER_PUPTOO } from '../Utilities/constants';
import TitleColumn from '../components/InventoryTable/TitleColumn';
import InsightsDisconnected from '../Utilities/InsightsDisconnected';
import OperatingSystemFormatter from '../Utilities/OperatingSystemFormatter';
import { Tooltip } from '@patternfly/react-core';
import { verifyCulledReporter } from '../Utilities/sharedFunctions';
import { fitContent } from '@patternfly/react-table';
import isEmpty from 'lodash/isEmpty';
import { LastSeenColumnHeader } from '../Utilities/LastSeenColumnHeader';

export const INVENTORY_COLUMNS = [
  {
    key: 'display_name',
    sortKey: 'display_name',
    title: 'Name',
    renderFunc: (display_name, id, item, props) => (
      <TitleColumn {...{ ...props, id, item }}>{display_name}</TitleColumn>
    ),
  },
  {
    key: 'groups',
    sortKey: 'group_name',
    title: 'Workspace',
    props: { width: 10 },
    // eslint-disable-next-line camelcase
    renderFunc: (groups) =>
      isEmpty(groups) ? (
        <div className="pf-v5-u-disabled-color-200">No workspace</div>
      ) : (
        groups[0].name
      ), // currently, one group at maximum is supported
    transforms: [fitContent],
  },
  {
    key: 'tags',
    title: 'Tags',
    props: { width: 10, isStatic: true },
    // eslint-disable-next-line react/display-name
    renderFunc: (value, systemId) => (
      <TagWithDialog count={value.length} systemId={systemId} />
    ),
  },
  {
    key: 'system_profile',
    sortKey: 'operating_system',
    dataLabel: 'OS',
    title: (
      <Tooltip content={<span>Operating system</span>}>
        <span>OS</span>
      </Tooltip>
    ),
    // eslint-disable-next-line react/display-name
    renderFunc: (systemProfile) => (
      <OperatingSystemFormatter
        operatingSystem={systemProfile?.operating_system}
      />
    ),
    props: { width: 10 },
  },
  {
    key: 'last_check_in',
    sortKey: 'last_check_in',
    dataLabel: 'Last seen',
    title: <LastSeenColumnHeader />,
    // eslint-disable-next-line react/display-name
    renderFunc: (
      value,
      _id,
      {
        culled_timestamp: culled,
        stale_warning_timestamp: staleWarn,
        stale_timestamp: stale,
        per_reporter_staleness: perReporterStaleness,
      }
    ) => {
      return CullingInformation ? (
        <CullingInformation
          culled={culled}
          staleWarning={staleWarn}
          stale={stale}
          render={({ msg }) => (
            <React.Fragment>
              <DateFormat
                date={value}
                extraTitle={
                  <React.Fragment>
                    <div>{msg}</div>
                    Last seen:{` `}
                  </React.Fragment>
                }
              />
              {verifyCulledReporter(perReporterStaleness, REPORTER_PUPTOO) && (
                <InsightsDisconnected />
              )}
            </React.Fragment>
          )}
        >
          {' '}
          <DateFormat date={value} />{' '}
        </CullingInformation>
      ) : (
        new Date(value).toLocaleString()
      );
    },
    props: { width: 10 },
    transforms: [fitContent],
  },
];

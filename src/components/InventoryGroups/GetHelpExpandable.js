import './GetHelpExpandable.scss';

import {
  Button,
  ExpandableSection,
  List,
  ListItem,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import React from 'react';
import PropTypes from 'prop-types';
import { USER_ACCESS_ADMIN_PERMISSIONS } from '../../constants';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const QuickstartButton = ({ quickStartId, children }) => {
  const { quickStarts } = useChrome();

  return (
    <Button
      variant="link"
      className="ins-c-groups-help-expandable__link"
      size="lg"
      onClick={quickStarts.activateQuickstart(quickStartId)}
    >
      {children} <ArrowRightIcon />
    </Button>
  );
};

QuickstartButton.propTypes = {
  quickStartId: PropTypes.string,
  children: PropTypes.node,
};

const GetHelpExpandable = () => {
  const { hasAccess: isUserAccessAdministrator, isOrgAdmin } =
    usePermissionsWithContext(USER_ACCESS_ADMIN_PERMISSIONS);

  return (
    <ExpandableSection
      toggleText="Help get started with new features"
      displaySize="lg"
      className="ins-c-groups-help-expandable"
    >
      <List isPlain>
        <ListItem>
          <QuickstartButton quickStartId="insights-inventory-workspace">
            Create a workspace
          </QuickstartButton>
        </ListItem>
        {isUserAccessAdministrator || isOrgAdmin ? (
          <ListItem>
            <QuickstartButton quickStartId="insights-inventory-workspace-rbac">
              Configure User Access for your workspaces
            </QuickstartButton>
          </ListItem>
        ) : (
          <></>
        )}
      </List>
    </ExpandableSection>
  );
};

export default GetHelpExpandable;

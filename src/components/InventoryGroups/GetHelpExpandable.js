import './GetHelpExpandable.scss';

import {
  Button,
  ExpandableSection,
  List,
  ListItem,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import React from 'react';
import { USER_ACCESS_ADMIN_PERMISSIONS } from '../../constants';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import useWorkspaceFeatureFlag from '../../Utilities/hooks/useWorkspaceFeatureFlag';

const GetHelpExpandable = () => {
  const { hasAccess: isUserAccessAdministrator, isOrgAdmin } =
    usePermissionsWithContext(USER_ACCESS_ADMIN_PERMISSIONS);
  const { quickStarts } = useChrome();
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  return (
    <ExpandableSection
      toggleText="Help get started with new features"
      displaySize="lg"
      className="ins-c-groups-help-expandable"
    >
      <List isPlain>
        <ListItem>
          <Button
            variant="link"
            className="ins-c-groups-help-expandable__link"
            size="lg"
            onClick={() =>
              quickStarts.activateQuickstart('insights-inventory-groups')
            }
          >
            {isWorkspaceEnabled
              ? 'Create a workspace'
              : 'Create an Inventory group'}{' '}
            <ArrowRightIcon />
          </Button>
        </ListItem>
        {isUserAccessAdministrator || isOrgAdmin ? (
          <ListItem>
            <Button
              variant="link"
              className="ins-c-groups-help-expandable__link"
              size="lg"
              onClick={() =>
                quickStarts.activateQuickstart('insights-inventory-groups-rbac')
              }
            >
              {isWorkspaceEnabled
                ? 'Configure User Access for your workspaces'
                : 'Configure User Access for your Inventory groups'}{' '}
              <ArrowRightIcon />
            </Button>
          </ListItem>
        ) : (
          <></>
        )}
      </List>
    </ExpandableSection>
  );
};

export default GetHelpExpandable;

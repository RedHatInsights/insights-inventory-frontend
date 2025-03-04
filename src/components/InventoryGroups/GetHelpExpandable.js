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

const GetHelpExpandable = () => {
  const { hasAccess: isUserAccessAdministrator, isOrgAdmin } =
    usePermissionsWithContext(USER_ACCESS_ADMIN_PERMISSIONS);
  const { quickStarts } = useChrome();

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
              quickStarts.activateQuickstart('insights-inventory-workspace')
            }
          >
            Create a workspace <ArrowRightIcon />
          </Button>
        </ListItem>
        {isUserAccessAdministrator || isOrgAdmin ? (
          <ListItem>
            <Button
              variant="link"
              className="ins-c-groups-help-expandable__link"
              size="lg"
              onClick={() =>
                quickStarts.activateQuickstart(
                  'insights-inventory-workspace-rbac'
                )
              }
            >
              Configure User Access for your workspaces <ArrowRightIcon />
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

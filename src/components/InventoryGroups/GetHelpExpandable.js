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

const GetHelpExpandable = () => {
  const { hasAccess: isUserAccessAdministrator, isOrgAdmin } =
    usePermissionsWithContext(USER_ACCESS_ADMIN_PERMISSIONS);

  return (
    <ExpandableSection
      toggleText="Help get started with new features"
      displaySize="large"
      className="ins-c-groups-help-expandable"
    >
      <List isPlain>
        <ListItem>
          <Button
            variant="link"
            className="ins-c-groups-help-expandable__link"
            isLarge
          >
            Create an Inventory group <ArrowRightIcon />
          </Button>
        </ListItem>
        {isUserAccessAdministrator || isOrgAdmin ? (
          <ListItem>
            <Button
              variant="link"
              className="ins-c-groups-help-expandable__link"
              isLarge
            >
              Configure User Access for your Inventory groups <ArrowRightIcon />
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

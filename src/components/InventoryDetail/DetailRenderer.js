import { Flex, Skeleton } from '@patternfly/react-core';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import AccessDenied from '../../Utilities/AccessDenied';
import { hosts } from '../../api';
import { REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS } from '../../constants';
import DetailWrapper from './DetailWrapper';

const DetailRenderer = ({ isRbacEnabled, ...props }) => {
  const [hostGroupId, setHostGroupId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hasAccess } = usePermissionsWithContext(
    /**
     * hostGroupId can be null, and the ungrouped hosts permissions will be checked in that case
     */
    REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS(hostGroupId)
  );

  useEffect(() => {
    let ignore = false;

    const getHostGroup = async () => {
      // request only if necessary
      if (isRbacEnabled === true) {
        const data = await hosts.apiHostGetHostById(
          [props.inventoryId],
          undefined,
          1,
          1
        );

        if (
          ignore !== true &&
          data.total !== 0 &&
          data.results[0].groups.length !== 0
        ) {
          setHostGroupId(data.results[0].groups[0].id);
        }
      }

      setIsLoading(false);
    };

    getHostGroup();

    return () => {
      ignore = true;
    };
  }, [props.inventoryId]);

  if (isLoading === true) {
    /**
     * TODO: test different scenarios once RTL migration is complete
     */
    return (
      <Flex direction={{ default: 'column' }}>
        <Skeleton width="66%" fontSize="2xl" />
        <Skeleton width="33%" />
        <Skeleton width="33%" />
      </Flex>
    );
  } else {
    if (isRbacEnabled === true) {
      if (hasAccess === false) {
        return <AccessDenied />;
      } else {
        return <DetailWrapper {...props} />;
      }
    } else {
      return <DetailWrapper {...props} />;
    }
  }
};

DetailRenderer.propTypes = {
  isRbacEnabled: PropTypes.bool,
  inventoryId: PropTypes.string.isRequired,
};

export default DetailRenderer;

import React, { Suspense, lazy, useMemo } from 'react';
import PropTypes from 'prop-types';
import '../inventory.scss';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { getSearchParams } from '../constants';

const IOPConventionalSystemsTab = lazy(
  () =>
    import(
      '../components/InventoryTabs/ConventionalSystems/IOPConventionalSystemsTab'
    ),
);

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    }
  >
    {children}
  </Suspense>
);
const IOPHybridInventory = (props) => {
  const parsedSearchParams = useMemo(
    () => getSearchParams(props.urlParams),
    [props.urlParams],
  );
  const fullProps = { ...props, ...parsedSearchParams };

  return <IOPConventionalSystemsTab {...fullProps} {...parsedSearchParams} />;
};

IOPHybridInventory.defaultProps = {
  initialLoading: true,
  notificationProp: PropTypes.object,
};
IOPHybridInventory.propTypes = {
  urlParams: PropTypes.string,
};
SuspenseWrapper.propTypes = {
  children: PropTypes.element,
};
export default IOPHybridInventory;

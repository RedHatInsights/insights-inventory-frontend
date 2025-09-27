import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import '../inventory.scss';
import { useSearchParams } from 'react-router-dom';
import { getSearchParams } from '../../constants';
import { AccountStatContext } from '../../Contexts';
import ConventionalSystemsTab from '../../components/InventoryTabs/ConventionalSystems/ConventionalSystemsTab';

const SystemsInventory = (props) => {
  const [searchParams] = useSearchParams();
  const parsedSearchParams = useMemo(
    () => getSearchParams(searchParams),
    [searchParams.toString()],
  );
  const { hasConventionalSystems } = useContext(AccountStatContext);
  const fullProps = { ...props, hasConventionalSystems, ...parsedSearchParams };
  return <ConventionalSystemsTab {...fullProps} {...parsedSearchParams} />;
};

SystemsInventory.propTypes = {
  initialLoading: PropTypes.bool,
  notificationProp: PropTypes.object,
};
export default SystemsInventory;

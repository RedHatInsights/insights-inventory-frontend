import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { workloadConfigs } from './SystemCardConfigs';
import { Clickable } from '../LoadingCard/LoadingCard';

const WorkloadsSection = ({ handleClick, workloadsData, workloadsTypes }) => {
  const filteredConfigs = useMemo(() => {
    return workloadConfigs(handleClick, workloadsData).filter(({ type }) =>
      workloadsTypes.includes(type),
    );
  }, [handleClick, workloadsData, workloadsTypes]);

  return filteredConfigs.map(
    ({ type, title, onClick, target, customRender }, index) => {
      if (typeof customRender === 'function') {
        return (
          <Fragment key={type}>
            {index > 0 && ', '}
            {customRender()}
          </Fragment>
        );
      }

      return (
        <Fragment key={type}>
          {index > 0 && ', '}
          <Clickable
            onClick={onClick}
            target={target}
            workload={type}
            title={title}
          />
        </Fragment>
      );
    },
  );
};

WorkloadsSection.propTypes = {
  handleClick: PropTypes.func.isRequired,
  workloadsData: PropTypes.object.isRequired,
  workloadsTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default React.memo(WorkloadsSection);

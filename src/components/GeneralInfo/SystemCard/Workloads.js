import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { workloadConfigs } from './SystemCardConfigs';
import { Clickable } from '../LoadingCard/LoadingCard';

const WorkloadsSection = ({ handleClick, workloadsData, workloadsTypes }) => {
  const filteredConfigs = useMemo(() => {
    return workloadConfigs(handleClick, workloadsData).filter(({ type }) =>
      workloadsTypes.includes(type)
    );
  }, [handleClick, workloadsData, workloadsTypes]);

  const interleaved = useMemo(() => {
    const rendered = filteredConfigs.map(
      ({ type, title, onClick, target, customRender }) => {
        if (typeof customRender === 'function') {
          return <Fragment key={type}>{customRender()}</Fragment>;
        }

        return (
          <Clickable
            key={type}
            onClick={onClick}
            target={target}
            workload={type}
            title={title}
          />
        );
      }
    );

    return rendered.reduce((acc, curr, index) => {
      if (index !== 0) acc.push(', ');
      acc.push(curr);
      return acc;
    }, []);
  }, [filteredConfigs]);

  return <Fragment>{interleaved}</Fragment>;
};

WorkloadsSection.propTypes = {
  handleClick: PropTypes.func.isRequired,
  workloadsData: PropTypes.object.isRequired,
  workloadsTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default React.memo(WorkloadsSection);

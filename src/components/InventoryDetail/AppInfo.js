import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useSelector, useStore } from 'react-redux';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';

/**
 * Small component that just renders active detail with some specific class.
 * This component detail is accessed from redux if no component found `missing component` is displayed.
 *
 *  @param   {object}             props                 Component Props
 *  @param   {object}             props.componentMapper Enables passing different components list
 *  @param   {object}             props.activeApp       Identifies the active app
 *  @returns {React.ReactElement}                       Returns the app information for the active app
 */
const AppInfo = ({ componentMapper: Cmp, activeApp }) => {
  const store = useStore();
  const loaded = useSelector(({ entityDetails }) => entityDetails?.loaded);
  const entity = useSelector(({ entityDetails }) => entityDetails?.entity);

  if (loaded === true && !entity) {
    return null;
  }

  return (
    <Fragment>
      {loaded ? (
        activeApp && (
          <div className={`ins-active-app-${activeApp?.name}`}>
            {Cmp ? (
              <Cmp
                store={store}
                inventoryId={entity?.id}
                appName={activeApp?.name}
              />
            ) : (
              'missing component'
            )}
          </div>
        )
      ) : (
        <Skeleton size={SkeletonSize.md} />
      )}
    </Fragment>
  );
};

AppInfo.propTypes = {
  componentMapper: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  activeApp: PropTypes.shape({
    title: PropTypes.node,
    name: PropTypes.string,
    pageId: PropTypes.string,
  }),
};

/**
 *  @deprecated This component can be removed once all apps migrate to componentMapper and activeApp
 *
 *  @param   {object}             props                 Component Props
 *  @param   {object}             props.componentMapper Enables passing different components list
 *  @param   {object}             props.activeApp       Identifies the active app
 *  @returns {React.ReactElement}                       Returns the app information for the active app
 */
const AppInfoWrapper = ({ componentMapper, activeApp, ...props }) => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  if (!componentMapper || !activeApp) {
    console.warn(
      'Please pass componentMapper and activeApp. We will be deprecating the old store controls',
    );
  }

  const currApp = useSelector(({ entityDetails }) => {
    const activeItem =
      searchParams.get('appName') || entityDetails?.activeApp?.appName;
    return (
      entityDetails?.activeApps?.find?.((item) => item?.name === activeItem) ||
      entityDetails?.activeApps?.[0]
    );
  });

  const currComponent = componentMapper || (activeApp || currApp)?.component;

  return (
    <AppInfo
      componentMapper={currComponent}
      activeApp={activeApp || currApp}
      {...props}
    />
  );
};

AppInfoWrapper.propTypes = AppInfo.propTypes;

/**
 *  @deprecated Remove once all apps send `componentMapper` and `activeApp` and use directly AppInfo
 *
 *  @param   {object}             props Component Props
 *  @returns {React.ReactElement}       Returns the app information for the active app
 */
const AppInfoCmp = (props) =>
  props.componentMapper && props.activeApp ? (
    <AppInfo {...props} />
  ) : (
    <AppInfoWrapper {...props} />
  );

AppInfoCmp.propTypes = AppInfo.propTypes;

export default AppInfoCmp;

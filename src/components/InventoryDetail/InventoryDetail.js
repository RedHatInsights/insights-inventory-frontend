import React, { Fragment, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  deleteEntity as deleteEntityAction,
  loadEntity,
} from '../../store/actions';
import './InventoryDetail.scss';
import SystemNotFound from './SystemNotFound';
import { reloadWrapper } from '../../Utilities/index';
import ApplicationDetails from './ApplicationDetails';
import './InventoryDetail.scss';
import DetailHeader from './DetailHeader';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import _ from 'lodash';
/**
 * Composit component which tangles together Topbar, facts, tags, app details and if system is found or not.
 * This component is connected to redux and reads `loaded` and `entity`.
 *  @param   {object}          props                   additional features from parent component.
 *  @param   {boolean}         props.showTags          if show tags is true
 *  @param   {Function}        props.onTabSelect       on tab select function
 *  @param   {Function}        props.onBackToListClick on back to list click function
 *  @param   {string}          props.inventoryId       inventory id
 *  @param   {object}          props.additionalClasses additional classes
 *  @param   {string}          props.activeApp         active app name
 *  @param   {Array}           props.appList           app list
 *  @param   {boolean}         props.showMainSection   if show main section is true
 *  @param   {object}          props.headerProps       props for the detail header
 *  @param   {object}          props.entity            entity object
 *  @param   {Function}        props.fetchEntity       fetch entity function
 *  @param                     props.entityError
 *  @returns {React.ReactNode}                         the inventory detail component
 */
const InventoryDetail = ({
  showTags = false,
  onTabSelect,
  onBackToListClick,
  inventoryId,
  additionalClasses,
  activeApp,
  appList = [],
  showMainSection,
  entity: entityProp,
  fetchEntity,
  entityError,
  ...headerProps
}) => {
  const dispatch = useDispatch();
  const addNotification = useAddNotification();
  const reduxLoaded = useSelector(
    ({ entityDetails }) => entityDetails?.loaded || false,
  );
  // If entityProp is provided and has an ID, treat as loaded
  const loaded = reduxLoaded || entityProp?.id !== undefined;
  const entity = useSelector(
    ({ entityDetails }) => entityProp || entityDetails?.entity,
  );

  //TODO: one all apps migrate to away from AppAinfo, remove this
  useEffect(() => {
    // Only dispatch if not loaded yet, or if entity exists but doesn't match the inventoryId
    // When entity prop is provided, still load via Redux to set loaded state
    if (
      (!loaded && !entityProp) ||
      (!_.isEmpty(entity) && entity?.id !== inventoryId)
    ) {
      dispatch(loadEntity(inventoryId, { hasItems: true }, { showTags }));
    }
  }, [dispatch, inventoryId, entity, entityProp, showTags, loaded]);

  const deleteEntity = (systems, displayName, callback) => {
    const action = deleteEntityAction(systems, displayName, addNotification);
    dispatch(reloadWrapper(action, callback));
  };

  // I'd love to replace the ErrorState with a custom error component that displays the error message
  return (
    <div className="ins-entity-detail">
      {entityError?.status === 400 ? (
        <ErrorState />
      ) : loaded && _.isEmpty(entity) ? (
        <SystemNotFound
          onBackToListClick={onBackToListClick}
          inventoryId={inventoryId}
        />
      ) : (
        <>
          <DetailHeader
            entity={entity}
            loaded={loaded}
            onBackToListClick={onBackToListClick}
            deleteEntity={deleteEntity}
            addNotification={(payload) => addNotification(payload)}
            showTags={showTags}
            {...headerProps}
          />
          {showMainSection && (
            <ApplicationDetails
              onTabSelect={onTabSelect}
              activeApp={activeApp}
              appList={appList}
              inventoryId={inventoryId}
              entity={entity}
              fetchEntity={fetchEntity}
            />
          )}
        </>
      )}
    </div>
  );
};

InventoryDetail.propTypes = {
  showTags: PropTypes.bool,
  onTabSelect: PropTypes.func,
  onBackToListClick: PropTypes.func,
  inventoryId: PropTypes.string,
  additionalClasses: PropTypes.object,
  activeApp: PropTypes.string,
  appList: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.node,
      name: PropTypes.string.isRequired,
      pageId: PropTypes.string,
    }),
  ),
};

const InventoryDetailWrapper = ({ inventoryId, ...props }) => {
  const { inventoryId: entityId } = useParams();

  if (!inventoryId) {
    console.warn('~~~~~~~~~~');
    console.warn('~~~~~~~~~~');
    console.warn(
      'Missing inventoryId! Please provide one, we will remove the fallback from URL soon.',
    );
    console.warn(`Please use DetailHead component in the fed-mod to render
            only Inventory header. Migrate away InventoryDetailHead`);
    console.warn('~~~~~~~~~~');
    console.warn('~~~~~~~~~~');
  }

  return (
    <InventoryDetail
      inventoryId={
        inventoryId ||
        entityId ||
        location.pathname.replace(/\/$/, '').split('/').pop()
      }
      {...props}
    />
  );
};

InventoryDetailWrapper.propTypes = InventoryDetail.propTypes;

// TODO: Remove once all apps send `inventoryId` and use directly InventoryDetail
const InventoryDetailCmp = (props) =>
  props.inventoryId ? (
    <InventoryDetail {...props} />
  ) : (
    <InventoryDetailWrapper {...props} />
  );

InventoryDetailCmp.propTypes = InventoryDetail.propTypes;

export default InventoryDetailWrapper;

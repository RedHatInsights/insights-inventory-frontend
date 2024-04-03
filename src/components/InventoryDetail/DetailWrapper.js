import React, { useEffect } from 'react';
import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { loadEntity, toggleDrawer } from '../../store/actions';
import { BasicInfo, SystemIssues } from '../InventoryDetailDrawer';
import FactsInfo from './FactsInfo';

const DetailWrapper = ({
  children,
  hideInvLink,
  showTags,
  Wrapper,
  className,
  appName,
  inventoryId,
  ...props
}) => {
  const dispatch = useDispatch();
  const store = useStore();
  const entity = useSelector(({ entityDetails }) => entityDetails?.entity);
  const isExpanded = useSelector(
    ({ entityDetails }) => entityDetails?.isToggleOpened
  );
  const loaded = useSelector(({ entityDetails }) => entityDetails?.loaded);

  useEffect(() => {
    if ((inventoryId && !entity) || !(entity?.id === inventoryId)) {
      dispatch(loadEntity(inventoryId, { hasItems: true }, { showTags }));
    }
  }, [entity, inventoryId]);

  return (
    <Drawer
      className={`ins-c-inventory__drawer ${className || ''}`}
      isExpanded={isExpanded}
      onExpand={() => dispatch(toggleDrawer(true))}
      data-testid="inventory-drawer"
      {...props}
    >
      <DrawerContent
        panelContent={
          <DrawerPanelContent>
            <DrawerHead>
              <BasicInfo hideInvLink={hideInvLink} showTags={showTags} />
              <DrawerActions>
                <DrawerCloseButton
                  onClick={() => dispatch(toggleDrawer(false))}
                />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody>
              <Stack className="ins-c-inventory__drawer--content">
                <StackItem>
                  <SystemIssues isOpened={isExpanded} />
                </StackItem>
                <StackItem isFilled className="ins-c-inventory__drawer--facts">
                  <FactsInfo entity={entity} loaded={loaded} />
                  {isExpanded && loaded && Wrapper && (
                    <Wrapper store={store} appName={appName} />
                  )}
                </StackItem>
              </Stack>
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

DetailWrapper.propTypes = {
  children: PropTypes.any,
  hideInvLink: PropTypes.bool,
  showTags: PropTypes.bool,
  appName: PropTypes.oneOf([
    'general_information',
    'advisor',
    'insights',
    'compliance',
    'vulnerabilities',
    'patch',
  ]),
  className: PropTypes.string,
  Wrapper: PropTypes.elementType,
  inventoryId: PropTypes.string.isRequired,
};

DetailWrapper.defaultProps = {
  appName: 'general_information',
};

export default DetailWrapper;

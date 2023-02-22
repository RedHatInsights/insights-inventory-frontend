import React, { useEffect } from 'react';
import {
    Drawer,
    DrawerPanelContent,
    DrawerContent,
    DrawerContentBody,
    DrawerPanelBody,
    DrawerActions,
    DrawerHead,
    DrawerCloseButton,
    Stack,
    StackItem
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { toggleDrawer, loadEntity } from '../../store/actions';
import { BasicInfo, SystemIssues } from '../InventoryDetailDrawer';
import FactsInfo from './FactsInfo';

const DetailWrapper = ({ children, hideInvLink, showTags, Wrapper, className, hasAccess, appName, inventoryId, ...props }) => {
    const dispatch = useDispatch();
    const store = useStore();
    const entity = useSelector(({ entityDetails }) => entityDetails?.entity);
    const isExpanded = useSelector(({ entityDetails }) => entityDetails?.isToggleOpened);
    const loaded = useSelector(({ entityDetails }) => entityDetails?.loaded);

    useEffect(() => {
        if (inventoryId && !entity || !(entity?.id === inventoryId)) {
            dispatch(loadEntity(inventoryId, { hasItems: true }, { showTags }));
        }
    }, [entity, inventoryId]);

    return <Drawer
        className={`ins-c-inventory__drawer ${className || ''}`}
        isExpanded={isExpanded}
        onExpand={() => dispatch(toggleDrawer(true))}
        {...props}
    >
        <DrawerContent
            panelContent={
                <DrawerPanelContent>
                    <DrawerHead>
                        <BasicInfo hideInvLink={ hideInvLink } showTags={ showTags } />
                        <DrawerActions>
                            <DrawerCloseButton onClick={() =>  dispatch(toggleDrawer(false))} />
                        </DrawerActions>
                    </DrawerHead>
                    <DrawerPanelBody>
                        <Stack className="ins-c-inventory__drawer--content">
                            <StackItem>
                                <SystemIssues isOpened={isExpanded} />
                            </StackItem>
                            <StackItem isFilled className="ins-c-inventory__drawer--facts">
                                <FactsInfo entity={entity} loaded={loaded} />
                                {
                                    isExpanded &&
                                    loaded &&
                                    Wrapper &&
                                    <Wrapper
                                        store={store}
                                        appName={appName}
                                    />
                                }
                            </StackItem>
                        </Stack>
                    </DrawerPanelBody>
                </DrawerPanelContent>
            }
        >
            <DrawerContentBody>
                {children}
            </DrawerContentBody>
        </DrawerContent>
    </Drawer>;
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
        'patch'
    ]),
    className: PropTypes.string,
    Wrapper: PropTypes.elementType,
    hasAccess: PropTypes.bool,
    inventoryId: PropTypes.string.isRequired
};

DetailWrapper.defaultProps = {
    appName: 'general_information'
};

export default DetailWrapper;

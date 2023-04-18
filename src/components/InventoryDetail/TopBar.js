import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { DeleteModal, TagsModal, TagWithDialog } from '../../Utilities/index';
import { Skeleton, SkeletonSize } from '@redhat-cloud-services/frontend-components/Skeleton';
import {
    Dropdown,
    DropdownItem,
    DropdownPosition,
    DropdownToggle,
    Title,
    Button,
    Flex,
    FlexItem,
    Split,
    SplitItem
} from '@patternfly/react-core';
import { redirectToInventoryList } from './helpers';
import { useDispatch } from 'react-redux';
import { toggleDrawer } from '../../store/actions';

/**
 * Top inventory bar with title, buttons (namely remove from inventory and inventory detail button) and actions.
 * Remove from inventory button requires remove modal, which is included at bottom of this component.
 * @param {*} props namely entity and if entity is loaded.
 */
const TopBar = ({
    entity,
    loaded,
    actions,
    deleteEntity,
    addNotification,
    hideInvLink,
    onBackToListClick,
    showDelete,
    showInventoryDrawer,
    TitleWrapper,
    TagsWrapper,
    DeleteWrapper,
    ActionsWrapper,
    showTags
}) => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const inventoryActions = [
        ...(!hideInvLink ? [{
            title: 'View system in Inventory',
            component: 'a',
            href: `./insights/inventory/${entity?.id}`
        }] : []),
        ... actions || []
    ];

    return (
        <Split className="ins-c-inventory__detail--header">
            <SplitItem isFilled>
                {
                    loaded ? (
                        <Flex>
                            <FlexItem>
                                <TitleWrapper>
                                    <Title headingLevel="h1" size='2xl'>{ entity && entity.display_name }</Title>
                                </TitleWrapper>
                            </FlexItem>
                            {
                                showTags &&
                                <FlexItem>
                                    <TagsWrapper>
                                        <TagWithDialog
                                            count={ entity && entity.tags && entity.tags.length }
                                            systemId={ entity && entity.id }
                                        />
                                        <TagsModal />
                                    </TagsWrapper>
                                </FlexItem>
                            }
                        </Flex>
                    ) :
                        <Skeleton size={ SkeletonSize.md } />
                }
            </SplitItem>
            {
                <SplitItem>
                    {
                        loaded ?
                            <Flex>
                                {showDelete && <FlexItem>
                                    <DeleteWrapper>
                                        <Button
                                            onClick={ () => setIsModalOpen(true) }
                                            variant="secondary">
                                        Delete
                                        </Button>
                                    </DeleteWrapper>
                                </FlexItem>}
                                { inventoryActions?.length > 0 && (
                                    <FlexItem>
                                        <ActionsWrapper>
                                            <Dropdown
                                                onSelect={ () => setIsOpen(false) }
                                                toggle={ <DropdownToggle
                                                    onToggle={(isOpen) => setIsOpen(isOpen)}
                                                >Actions</DropdownToggle>}
                                                isOpen={ isOpen }
                                                position={ DropdownPosition.right }
                                                dropdownItems={
                                                    inventoryActions.map(({ title, ...action }, key) => (
                                                        <DropdownItem
                                                            key={ key }
                                                            component="button"
                                                            onClick={
                                                                (event) => action.onClick(event, action, action.key || key)
                                                            }
                                                            {...action}
                                                        >
                                                            { title }
                                                        </DropdownItem>)
                                                    ) }
                                            />
                                        </ActionsWrapper>
                                    </FlexItem>)}
                                <FlexItem>
                                    {
                                        showInventoryDrawer &&
                                        <Button onClick={() => dispatch(toggleDrawer(true))}>
                                            Show more information
                                        </Button>
                                    }
                                </FlexItem>
                            </Flex>
                            :
                            <Skeleton size={ SkeletonSize.lg } />
                    }
                </SplitItem>
            }
            { isModalOpen && (
                <DeleteModal
                    className ='sentry-mask data-hj-suppress'
                    handleModalToggle={() => setIsModalOpen(!isModalOpen)}
                    isModalOpen={isModalOpen}
                    currentSytems={entity}
                    onConfirm={() => {
                        addNotification({
                            id: 'remove-initiated',
                            variant: 'warning',
                            title: 'Delete operation initiated',
                            description: `Removal of ${entity.display_name} started.`,
                            dismissable: false
                        });
                        deleteEntity(
                            [entity.id],
                            entity.display_name,
                            () => redirectToInventoryList(entity.id, onBackToListClick)
                        );
                        setIsModalOpen(false);
                    }}
                />)}
        </Split>
    );
};

TopBar.propTypes = {
    entity: PropTypes.object,
    loaded: PropTypes.bool,
    showDelete: PropTypes.bool,
    hideInvLink: PropTypes.bool,
    showInventoryDrawer: PropTypes.bool,
    showTags: PropTypes.bool,
    actions: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        title: PropTypes.node,
        onClick: PropTypes.func
    })),
    deleteEntity: PropTypes.func,
    addNotification: PropTypes.func,
    onBackToListClick: PropTypes.func,
    TitleWrapper: PropTypes.elementType,
    TagsWrapper: PropTypes.elementType,
    DeleteWrapper: PropTypes.elementType,
    ActionsWrapper: PropTypes.elementType
};

TopBar.defaultProps = {
    actions: [],
    loaded: false,
    hideInvLink: false,
    showDelete: false,
    showInventoryDrawer: false,
    deleteEntity: () => undefined,
    addNotification: () => undefined,
    onBackToListClick: () => undefined,
    TitleWrapper: Fragment,
    TitleWTagsWrapperrapper: Fragment,
    DeleteWrapper: Fragment,
    ActionsWrapper: Fragment
};

export default TopBar;

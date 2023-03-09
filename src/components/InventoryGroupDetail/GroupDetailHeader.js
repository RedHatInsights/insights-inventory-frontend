import {
    Breadcrumb,
    BreadcrumbItem,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    Flex,
    FlexItem,
    Skeleton
} from '@patternfly/react-core';
import {
    PageHeader,
    PageHeaderTitle
} from '@redhat-cloud-services/frontend-components';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { routes } from '../../Routes';
import PropTypes from 'prop-types';
import DeleteGroupModal from '../InventoryGroups/Modals/DeleteGroupModal';
import RenameGroupModal from '../InventoryGroups/Modals/RenameGroupModal';
import { fetchGroupDetail } from '../../store/inventory-actions';

const GroupDetailHeader = ({ groupId }) => {
    const dispatch = useDispatch();
    const { uninitialized, loading, data } = useSelector(
        (state) => state.groupDetail
    );

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const name = data?.results?.[0]?.name;
    const title =
      uninitialized || loading ? (
          <Skeleton width="250px" screenreaderText="Loading group details" />
      ) : (
          name || groupId // in case of error, render just id from URL
      );

    const history = useHistory();

    return (
        <PageHeader>
            <RenameGroupModal
                isModalOpen={renameModalOpen}
                setIsModalOpen={() => setRenameModalOpen(false)}
                modalState={{
                    id: groupId,
                    name: name || groupId
                }}
                reloadData={() => dispatch(fetchGroupDetail(groupId))}
            />
            <DeleteGroupModal
                isModalOpen={deleteModalOpen}
                setIsModalOpen={() => setDeleteModalOpen(false)}
                modalState={{
                    id: groupId,
                    name: name || groupId
                }}
                reloadData={() => history.push('/groups')}
            />
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to={routes.groups}>Groups</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{title}</BreadcrumbItem>
            </Breadcrumb>
            <Flex id="group-header" justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                <FlexItem>
                    <PageHeaderTitle title={title} />
                </FlexItem>
                <FlexItem id="group-header-dropdown">
                    <Dropdown
                        onSelect={() => setDropdownOpen(!dropdownOpen)}
                        autoFocus={false}
                        isOpen={dropdownOpen}
                        toggle={
                            <DropdownToggle
                                id="group-dropdown-toggle"
                                onToggle={(isOpen) => setDropdownOpen(isOpen)}
                                toggleVariant="secondary"
                                isDisabled={uninitialized || loading}
                            >
                                Group actions
                            </DropdownToggle>
                        }
                        dropdownItems={[
                            <DropdownItem
                                key="rename-group"
                                onClick={() => setRenameModalOpen(true)}
                            >
                                Rename
                            </DropdownItem>,
                            <DropdownItem
                                key="delete-group"
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                Delete
                            </DropdownItem>
                        ]}
                    />
                </FlexItem>
            </Flex>
        </PageHeader>
    );
};

GroupDetailHeader.propTypes = {
    groupId: PropTypes.string.isRequired
};

export default GroupDetailHeader;

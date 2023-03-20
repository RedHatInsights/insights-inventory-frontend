import React, { useState } from 'react';
import {
    Button,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    EmptyStateSecondaryActions,
    Title
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { global_palette_black_600 as globalPaletteBlack600 } from '@patternfly/react-tokens/dist/js/global_palette_black_600';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import PropTypes from 'prop-types';

const NoSystemsEmptyState = ({ groupId, groupName }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <EmptyState
            data-ouia-component-id="empty-state"
            data-ouia-component-type="PF4/EmptyState"
            data-ouia-safe={true}
        >
            <AddSystemsToGroupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                groupId={groupId}
                groupName={groupName}
            />
            <EmptyStateIcon icon={PlusCircleIcon} color={globalPaletteBlack600.value} />
            <Title headingLevel="h4" size="lg">
                No systems added
            </Title>
            <EmptyStateBody>
                To manage systems more effectively, add systems to the group.
            </EmptyStateBody>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Add systems
            </Button>
            <EmptyStateSecondaryActions>
                <Button
                    variant="link"
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="right"
                >
                    Learn more about system groups
                </Button>
            </EmptyStateSecondaryActions>
        </EmptyState>
    );};

NoSystemsEmptyState.propTypes = {
    groupId: PropTypes.string,
    groupName: PropTypes.string
};
export default NoSystemsEmptyState;

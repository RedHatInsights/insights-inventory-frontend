import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    Grid,
    GridItem,
    Modal
} from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';

import { systemProfile } from '../../../store/actions';
import InfoTable from '../InfoTable';
// Since there's a problem with cards loading asynchronously we have to import the cards here as named
import { OperatingSystemCard } from '../OperatingSystemCard';
import { SystemCard } from '../SystemCard';
import { BiosCard } from '../BiosCard';
import { InfrastructureCard } from '../InfrastructureCard';
import { ConfigurationCard } from '../ConfigurationCard';
import { SystemStatusCard } from '../SystemStatusCard';
import { DataCollectorsCard } from '../DataCollectorsCard/DataCollectorsCard';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import './general-information.scss';

class GeneralInformation extends Component {
    state = {
        isModalOpen: false,
        modalTitle: '',
        modalVariant: 'small'
    };

    onSort = (_event, index, direction, customRows) => {
        const { rows } = this.state;
        const sorted = (customRows || rows).sort((a, b) => {
            const firstRow = a.cells || a;
            const secondRow = b.cells || b;
            const aSortBy = ('' + (firstRow[index].sortValue || firstRow[index])).toLocaleLowerCase();
            const bSortBy = ('' + (secondRow[index].sortValue || secondRow[index])).toLocaleLowerCase();
            return (aSortBy > bSortBy) ? -1 : 1;
        });
        this.setState({
            rows: direction === SortByDirection.asc ? sorted : sorted.reverse()
        });
    }

    handleModalToggle = (modalTitle = '', { cells, rows, expandable, filters } = {}, modalVariant = 'small') => {
        rows && this.onSort(undefined, expandable ? 1 : 0, SortByDirection.asc, rows);
        if (this.state.isModalOpen) {
            this.props.history.push(this.props.location.pathname.split('/').slice(0, -1).join('/'));
        }

        this.setState(({ isModalOpen }) => ({
            isModalOpen: !isModalOpen,
            modalTitle,
            cells,
            expandable,
            filters,
            modalVariant
        }));
    };

    componentDidMount() {
        this.props.loadSystemDetail?.(this.props.inventoryId || this.props.entity.id);
    };

    render() {
        const { isModalOpen, modalTitle, cells, rows, expandable, filters, modalVariant } = this.state;
        const {
            store,
            writePermissions,
            SystemCardWrapper,
            OperatingSystemCardWrapper,
            BiosCardWrapper,
            InfrastructureCardWrapper,
            ConfigurationCardWrapper,
            SystemStatusCardWrapper,
            DataCollectorsCardWrapper,
            CollectionCardWrapper,
            children
        } = this.props;
        const Wrapper = store ? Provider : Fragment;
        return (
            <Wrapper {...(store && { store })}>
                <div className="ins-c-general-information">
                    <Grid hasGutter>
                        <GridItem md={6} sm={12}>
                            <Grid hasGutter>
                                {SystemCardWrapper && <GridItem>
                                    <SystemCardWrapper handleClick={this.handleModalToggle} writePermissions={writePermissions} />
                                </GridItem>}
                                {InfrastructureCardWrapper && <GridItem>
                                    <InfrastructureCardWrapper handleClick={this.handleModalToggle} />
                                </GridItem>}
                                {SystemStatusCardWrapper && <GridItem>
                                    <SystemStatusCardWrapper handleClick={this.handleModalToggle} />
                                </GridItem>}
                                {DataCollectorsCardWrapper && <GridItem>
                                    <DataCollectorsCardWrapper handleClick={this.handleModalToggle} />
                                </GridItem>}
                            </Grid>
                        </GridItem>
                        <GridItem md={6} sm={12} >
                            <Grid hasGutter>
                                {OperatingSystemCardWrapper && <GridItem>
                                    <OperatingSystemCardWrapper handleClick={this.handleModalToggle} />
                                </GridItem>}

                                {BiosCardWrapper && <GridItem>
                                    <BiosCardWrapper handleClick={this.handleModalToggle} />
                                </GridItem>}

                                {ConfigurationCardWrapper && <GridItem>
                                    <ConfigurationCardWrapper handleClick={this.handleModalToggle} />
                                </GridItem>}

                                {CollectionCardWrapper && <GridItem>
                                    <CollectionCardWrapper handleClick={this.handleModalToggle} />
                                </GridItem>}
                            </Grid>
                        </GridItem>
                        {children}
                        <Modal
                            title={ modalTitle || '' }
                            aria-label={`${modalTitle || ''} modal`}
                            isOpen={ isModalOpen }
                            onClose={ () => this.handleModalToggle() }
                            className="ins-c-inventory__detail--dialog"
                            variant={ modalVariant }
                        >
                            <InfoTable
                                cells={ cells }
                                rows={ rows }
                                expandable={ expandable }
                                onSort={ this.onSort }
                                filters={ filters }
                            />
                        </Modal>
                    </Grid>
                </div>
            </Wrapper>
        );
    }
}

GeneralInformation.propTypes = {
    entity: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    openedModal: PropTypes.string,
    loadSystemDetail: PropTypes.func,
    store: PropTypes.any,
    writePermissions: PropTypes.bool,
    SystemCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    OperatingSystemCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    BiosCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    InfrastructureCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    ConfigurationCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    SystemStatusCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    DataCollectorsCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    CollectionCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
    children: PropTypes.node,
    history: PropTypes.any,
    location: PropTypes.any,
    inventoryId: PropTypes.string.isRequired
};
GeneralInformation.defaultProps = {
    entity: {},
    SystemCardWrapper: SystemCard,
    OperatingSystemCardWrapper: OperatingSystemCard,
    BiosCardWrapper: BiosCard,
    InfrastructureCardWrapper: InfrastructureCard,
    ConfigurationCardWrapper: ConfigurationCard,
    SystemStatusCardWrapper: SystemStatusCard,
    DataCollectorsCardWrapper: DataCollectorsCard,
    CollectionCardWrapper: false
};

const mapStateToProps = ({
    entityDetails: {
        entity
    }
}) => ({
    entity
});
const mapDispatchToProps = (dispatch) => ({
    loadSystemDetail: (itemId) => dispatch(systemProfile(itemId))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GeneralInformation));

import React from 'react';
import PropTypes from 'prop-types';
import './EntityTable.scss';
import { Link } from 'react-router-dom';
import { Icon } from '@patternfly/react-icons';

const EntityTable = ({ loaded, entities }) => (
    <table className='entity-table'>
        <tbody>
            {(!loaded) ?
                <tr>
                    <td colSpan='4' className='loading'>
                        <Icon name='sync-alt'/>
                    </td>
                </tr> :
                entities.map(entity =>
                    <tr key={entity.id}>
                        <td className='checkbox'>
                            <input type='checkbox'></input>
                        </td>
                        <td>
                            <Link to={`/inventory/entity/${entity.id}`}>
                                {entity.display_name ? entity.display_name : 'undefined'}
                            </Link>
                        </td>
                        <td>{entity.account}</td>
                        <td className='actions'>
                            <Icon name='ellipsis-v'/>
                        </td>
                    </tr>
                )
            }
        </tbody>
    </table>
);

EntityTable.propTypes = {
    loaded: PropTypes.bool.isRequired,
    entities: PropTypes.array
};

export default EntityTable;

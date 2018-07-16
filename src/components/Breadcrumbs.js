import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// MARK: implement this in components
const Breadcrumbs = ({ name, path, param }) => {
    return (
        <React.Fragment>
            <Link to={path}>{name}</Link>
            { param && <span>&nbsp;&gt;&nbsp;</span> }
            { param && <span>{param}</span>}
        </React.Fragment>
    );
};

Breadcrumbs.propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    param: PropTypes.string
};

export default Breadcrumbs;

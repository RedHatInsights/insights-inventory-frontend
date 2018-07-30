import React from 'react';
import PropTypes from 'prop-types';

const DEFAULT_TIMEOUT = 6000;

/*
 * Expiring Component HOC
 * Causes the given function to be invoked after the given component has been rendered for
 * the given amount of time (defaults to 6000ms)
 */
function expiringComponent (Component, fn, timeout = DEFAULT_TIMEOUT) {
    return class ExpiringWrapper extends React.Component {

        componentDidMount () {
            setTimeout(fn, timeout);
        }

        render () {
            return <Component {...this.props}/>;
        }
    };
}

expiringComponent.propTypes = {
    Component: PropTypes.instanceOf(React.Component).isRequired,
    fn: PropTypes.func.isRequired,
    timeout: PropTypes.number
};

export default expiringComponent;

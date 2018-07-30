import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Button, Alert } from '@patternfly/react-core';
import './Alerts.scss';
import expiringComponent from '../Utilities/expiringComponent';

// MARK: implement this in components
const Alerts = ({ alerts, dismiss }) => {
    if (!alerts.length) {
        return null;
    }

    return ReactDOM.createPortal(
        (
            <div className='alerts'>
                { alerts.map(alert => {
                    const action = alert.dismissible ?
                        <Button variant='secondary' onClick={() => dismiss(alert)}>Dismiss</Button> :
                        undefined;

                    const Component = alert.dismissible ? Alert : expiringComponent(Alert, () => dismiss(alert, true));

                    return (
                        <Component
                            variant={alert.variant}
                            title={alert.title}
                            key={alert.id}
                            action={action}
                        />);
                }).reverse()}
            </div>
        ),
        document.getElementById('root')
    );
};

Alerts.propTypes = {
    alerts: PropTypes.array.isRequired,
    dismiss: PropTypes.func.isRequired
};

export default Alerts;

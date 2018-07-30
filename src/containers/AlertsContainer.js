import { connect } from 'react-redux';
import Alerts from '../components/Alerts';
import * as actions from '../actions';

const AlertsContainer = connect(
    ({ alerts }) => ({ alerts }),
    dispatch => ({
        dismiss: (alert, timeout) => dispatch(actions.dismissAlert(alert, timeout))
    })
)(Alerts);

export default AlertsContainer;

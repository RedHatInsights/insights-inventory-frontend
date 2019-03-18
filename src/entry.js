import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import logger from 'redux-logger';

const pathName = window.location.pathname.split('/');

ReactDOM.render(
    <Provider store={init(logger).getStore()}>
        <Router basename={`${pathName[1] === 'beta' ? pathName[2] : pathName[1]}/inventory`}>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);

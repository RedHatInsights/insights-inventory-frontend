// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This iws a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import React from 'react';
import FlagProvider from '@unleash/proxy-client-react';
import { Provider } from 'react-redux';
import { getStore } from '../../src/store';
import { MemoryRouter, Switch, Route } from 'react-router-dom';
import { mount } from '@cypress/react';

Cypress.Commands.add('mountWithContext', (Component, options = {}, props) => {
    const { path, routerProps = { initialEntries: ['/'] } } = options;

    return mount(
        <FlagProvider
            config={{
                url: 'http://localhost:8002/feature_flags',
                clientKey: 'abc',
                appName: 'abc'
            }}
        >
            <Provider store={getStore()}>
                <MemoryRouter {...routerProps}>
                    {path ? (
                        <Switch>
                            <Route path={options.path} component={() => <Component {...props} />} rootClass='inventory' />
                        </Switch>
                    ) : (
                        <Component {...props} />
                    )}
                </MemoryRouter>
            </Provider>
        </FlagProvider>
    );
});


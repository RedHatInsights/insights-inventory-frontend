import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './inventory.scss';

import { PageHeader } from '@red-hat-insights/insights-frontend-components';
import { PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';
import { Section } from '@red-hat-insights/insights-frontend-components';
import { Button } from '@patternfly/react-core';

/**
 * A smart component that handles all the api calls and data needed by the dumb components.
 * Smart components are usually classes.
 *
 * https://reactjs.org/docs/components-and-props.html
 * https://medium.com/@thejasonfile/dumb-components-and-smart-components-e7b33a698d43
 */
class SamplePage extends Component {

    render() {
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Inventory'/>
                </PageHeader>
                <Section type='content'>
                    <p>Table listing entities in the inventory will be here…</p>
                    <Button variant='primary'>Button</Button>
                </Section>
            </React.Fragment>
        );
    }
}

export default withRouter(SamplePage);

import {
    Button,
    Card,
    CardTitle,
    CardBody,
    CardHeader,
    CardActions } from '@patternfly/react-core';
import React from 'react';
import PropTypes from 'prop-types';
import ChromeLoader from '../../Utilities/ChromeLoader';

const GroupDetailInfo = ({ chrome }) => {
    const path = `${chrome.isBeta() ? '/preview' : ''}/iam/user-access`;

    return (
        <Card>
            <CardHeader>
                <CardActions>
                    <Button component="a" href={path} variant="secondary">
                        Manage access
                    </Button>
                </CardActions>
                <CardTitle className="pf-c-title pf-m-lg card-title">
                    User access configuration
                </CardTitle>
            </CardHeader>
            <CardBody>
                Manage your inventory group user access configuration under
                <a href={path}> Identity & Access Management {'>'} User Access.</a>
            </CardBody>
        </Card>
    );
};

GroupDetailInfo.propTypes = {
    chrome: PropTypes.object
};

const GroupDetailInfoWithChrome = () => (
    <ChromeLoader>
        <GroupDetailInfo />
    </ChromeLoader>
);

export { GroupDetailInfo };
export default GroupDetailInfoWithChrome;

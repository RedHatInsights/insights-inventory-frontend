import {
    Button,
    Card,
    CardTitle,
    CardBody,
    CardHeader,
    CardActions } from '@patternfly/react-core';
import React from 'react';

const GroupDetailInfo = () => {
    return (
        <Card>
            <CardHeader>
                <CardActions>
                    <Button variant="secondary" isSmall="true" >
                        <a
                            href={`${window.location.origin}/iam/user-access`}
                        >Manage access</a>
                    </Button>
                </CardActions>
                <CardTitle className="pf-c-title pf-m-md card-title">User access configuration</CardTitle>
            </CardHeader>
            <CardBody>
                    Manage your inventory group access configuration under
                <a
                    href={`${window.location.origin}/iam/user-access`}
                > Identity & Access Management {'>'} User Access.</a>
            </CardBody>
        </Card>
    );
};

export default GroupDetailInfo;

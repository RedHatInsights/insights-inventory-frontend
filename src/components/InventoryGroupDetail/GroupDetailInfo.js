import {
    Button,
    Card,
    CardTitle,
    CardBody,
    CardHeader,
    CardActions } from '@patternfly/react-core';
import React from 'react';

const GroupDetailInfo = () => {
    const address =  window.location.href.includes('beta') ? '/beta/iam/user-access' : '/iam/user-access';

    return (
        <Card>
            <CardHeader>
                <CardActions>
                    <Button variant="secondary" >
                        <a
                            href={`${window.location.origin}/iam/user-access`}
                        >Manage access</a>
                    </Button>
                </CardActions>
                <CardTitle className="pf-c-title pf-m-lg card-title">User access configuration</CardTitle>
            </CardHeader>
            <CardBody>
                    Manage your inventory group user access configuration under
                <a
                    href={`${window.location.origin}${address}`}
                > Identity & Access Management {'>'} User Access.</a>
            </CardBody>
        </Card>
    );
};

export default GroupDetailInfo;

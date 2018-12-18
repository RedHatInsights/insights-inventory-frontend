import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import { PaginationRow } from 'patternfly-react';

export const asyncInventoryLoader = () => insights.loadInventory({
    react: React,
    reactRouterDom,
    reactCore,
    reactIcons,
    pfReact: {
        PaginationRow
    }
});

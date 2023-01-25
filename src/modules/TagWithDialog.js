import React from 'react';
import AsyncInventory from './AsyncInventory';
import TagWithDialogCmp from '../Utilities/TagWithDialog';

const TagWithDialog = (props) => <AsyncInventory {...props} component={TagWithDialogCmp} />;

export default TagWithDialog;

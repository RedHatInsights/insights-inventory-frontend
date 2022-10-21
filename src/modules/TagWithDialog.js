import React from 'react';
import AsyncInventory from './AsyncInventory';
import TagWithDialogCmp from '../Utilities/TagWithDialog';

const BaseTagWithDialog = (props) => <AsyncInventory component={TagWithDialogCmp} {...props} />;

const TagWithDialog = React.forwardRef((props, ref) => <BaseTagWithDialog innerRef={ref} {...props} />);

export default TagWithDialog;

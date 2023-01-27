import React from 'react';
import AsyncInventory from './AsyncInventory';
import TagWithDialogCmp from '../Utilities/TagWithDialog';

const BaseTagWithDialog = (props) => <AsyncInventory {...props} component={TagWithDialogCmp}  />;

const TagWithDialog = React.forwardRef((props, ref) => <BaseTagWithDialog {...props} innerRef={ref} />);

export default TagWithDialog;

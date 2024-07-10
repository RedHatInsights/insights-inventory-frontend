import React from 'react';
import AsyncInventory from './AsyncInventory';
import { ImmutableDevices as ImmutableDevicesCmp } from '../components/ImmutableDevices';

const BaseImmutableDevices = (props) => (
  <AsyncInventory {...props} component={ImmutableDevicesCmp} />
);
const ImmutableDevices = React.forwardRef((props, ref) => (
  <BaseImmutableDevices {...props} innerRef={ref} />
));

export default ImmutableDevices;

export { useOperatingSystemFilter } from '../components/filters/useOperatingSystemFilter';

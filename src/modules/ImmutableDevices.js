import React from 'react';

const BaseImmutableDevices = () => null;

const ImmutableDevices = React.forwardRef((props, ref) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Deprecated: ImmutableDevices is deprecated and will be removed in a future release. Immutable devices are part of the Inventory table.',
      );
    }
  }, []);

  return <BaseImmutableDevices innerRef={ref} />;
});

export default ImmutableDevices;

export { useOperatingSystemFilter } from '../components/filters/useOperatingSystemFilter';

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import * as storeMod from '../store/redux';
import * as utils from '../Utilities/index';
import * as apiMod from '../api/index';
import RenderWrapper from '../Utilities/Wrapper';
const { mergeWithDetail, ...rest } = storeMod;

const IOPInventory = ({ component, onLoad, store, innerRef, ...props }) => {
  useEffect(() => {
    onLoad?.({
      ...rest,
      ...utils,
      api: apiMod,
      mergeWithDetail,
    });
  }, []);

  return (
    <Provider store={store}>
      <RenderWrapper
        {...props}
        isRbacEnabled
        inventoryRef={innerRef}
        store={store}
        cmp={component}
      />
    </Provider>
  );
};

IOPInventory.propTypes = {
  store: PropTypes.object,
  onLoad: PropTypes.func,
  component: PropTypes.elementType.isRequired,
  history: PropTypes.object,
  innerRef: PropTypes.shape({
    current: PropTypes.any,
  }),
};

IOPInventory.defaultProps = {
  onLoad: () => undefined,
};

export default IOPInventory;

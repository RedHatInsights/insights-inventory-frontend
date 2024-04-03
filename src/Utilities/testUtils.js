import isEqual from 'lodash/isEqual';

export const shouldDispatch = (store, { type, payload }) => {
  try {
    expect(
      store
        .getActions()
        .find(
          ({ type: actionType, payload: actionPayload }) =>
            actionType === type &&
            (payload === undefined || isEqual(payload, actionPayload))
        )
    ).not.toBeUndefined();
  } catch (error) {
    throw new Error(`An expected ${type} action was not dispatched.`);
  }
};

export const shouldNotDispatch = (store, { type, payload }) => {
  try {
    expect(
      store
        .getActions()
        .find(
          ({ type: actionType, payload: actionPayload }) =>
            actionType === type &&
            (payload === undefined || isEqual(payload, actionPayload))
        )
    ).toBeUndefined();
  } catch (error) {
    throw new Error(`${type} action was dispatched which is not expected.`);
  }
};

import get from 'lodash/get';

export const redirectToInventoryList = (id, onBackToListClick) => {
  if (onBackToListClick) {
    onBackToListClick();
  } else {
    /**
     * Prevent the case that refferer has the same URL as current browser URL is
     */
    if (
      document.referrer &&
      document.referrer !==
        `${document.location.origin}${document.location.pathname}`
    ) {
      history.back();
    } else {
      location.href = location.pathname.replace(
        new RegExp(`${[id]}.*`, 'g'),
        ''
      );
    }
  }
};

export const getFact = (path, factDict) => get(factDict, path, undefined);

import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

const apiWithToast = (dispatch, api, statusMessages) => {
    const hasSuccess = statusMessages?.onSuccess;
    const hasInfo = statusMessages?.onInfo;

    if (!statusMessages) {
        statusMessages = {
            onSuccess: {
                title: 'Success',
                description: 'The request has been made successfully'
            },
            onError: {
                title: 'Error',
                description: 'An error occurred making the request'
            }
        };
    }

    const fetchData = async () => {
        try {
            const response = await api();
            hasInfo &&
          dispatch({
              ...addNotification({
                  variant: 'info',
                  ...statusMessages.onInfo
              })
          });
            hasSuccess &&
          dispatch({
              ...addNotification({
                  variant: 'success',
                  ...statusMessages.onSuccess
              })
          });
            return response;
        } catch (err) {
            dispatch({
                ...addNotification({
                    variant: 'danger',
                    ...statusMessages.onError,
                    // Add error message from API, if present
                    description: err?.Title
                        ? `${statusMessages.onError.description}: ${err.Title}`
                        : statusMessages.onError.description
                })
            });
            return err;
        }
    };

    return fetchData();
};

export default apiWithToast;

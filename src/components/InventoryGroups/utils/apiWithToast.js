import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const useApiWithToast = () => {
  const addNotification = useAddNotification();

  const apiWithToast = (api, statusMessages) => {
    const hasSuccess = statusMessages?.onSuccess;
    const hasInfo = statusMessages?.onInfo;

    if (!statusMessages) {
      statusMessages = {
        onSuccess: {
          title: 'Success',
          description: 'The request has been made successfully',
        },
        onError: {
          title: 'Error',
          description: 'An error occurred making the request',
        },
      };
    }

    const fetchData = async () => {
      try {
        const response = await api();
        if (hasInfo)
          addNotification({
            variant: 'info',
            ...statusMessages.onInfo,
          });
        if (hasSuccess)
          addNotification({
            variant: 'success',
            ...statusMessages.onSuccess,
          });
        return response;
      } catch (err) {
        addNotification({
          variant: 'danger',
          ...statusMessages.onError,
          // Add error message from API, if present
          description: err?.Title
            ? `${statusMessages.onError.description}: ${err.Title}`
            : statusMessages.onError.description,
        });
        return err;
      }
    };

    return fetchData();
  };

  return apiWithToast;
};

export default useApiWithToast;

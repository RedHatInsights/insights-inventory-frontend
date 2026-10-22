export const fetchActivationKeys = async (axios) => {
  const response = await axios
    .get('/api/rhsm/v2/activation_keys')
    .catch(function (error) {
      return error;
    });

  return response;
};

export const createActivationKey = async (axios, body) => {
  const postResponse = await axios
    .post('api/rhsm/v2/activation_keys', body)
    .catch(function (error) {
      return error;
    });

  return postResponse;
};

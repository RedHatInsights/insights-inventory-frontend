/* eslint-disable react/prop-types */
import React from 'react';
import { generatePath, Navigate, useParams } from 'react-router-dom';

const Redirect = ({ to, replace, state }) => {
  const params = useParams();
  const redirectWithParams = generatePath(to, params);

  return <Navigate to={redirectWithParams} replace={replace} state={state} />;
};

export default Redirect;

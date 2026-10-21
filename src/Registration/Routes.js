import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Loading from './Components/Loading/Loading';

const Register = lazy(
  () => import(/* webpackChunkName: "Register" */ './Routes/Register/Register'),
);

const paths = { register: '/' };

export const RouteList = () => {
  return (
    <Routes>
      <Route
        key="register"
        path={paths.register}
        element={
          <Suspense fallback={<Loading />}>
            <Register />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to={paths.register} />} />
    </Routes>
  );
};

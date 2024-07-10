import { createContext } from 'react';

export const AccountStatContext = createContext({
  hasConventionalSystems: true,
  hasEdgeDevices: false,
  hasBootcImages: false,
});

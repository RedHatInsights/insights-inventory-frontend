import { RBAC_FETCH_ACCESS_DENIED_CODES } from '../constants';

export type RbacFetchError = { code?: number; message?: string } | null;

/** True when a default-workspace RBAC fetch error likely indicates missing access (vs a transport failure). */
export const isRbacFetchAccessDenied = (
  error: RbacFetchError | undefined,
): boolean => {
  const code = error?.code;
  return (
    typeof code === 'number' &&
    (RBAC_FETCH_ACCESS_DENIED_CODES as readonly number[]).includes(code)
  );
};

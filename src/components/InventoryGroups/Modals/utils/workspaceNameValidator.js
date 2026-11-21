import awesomeDebouncePromise from 'awesome-debounce-promise';
import { validateGroupName } from '../../utils/api';
import { ignoreStaleValidationResults } from './ignoreStaleValidationResults';

export const validateWorkspaceName = async (
  value = '',
  { trim = false, skipEmpty = false } = {},
) => {
  const name = trim ? value.trim() : value;
  if (skipEmpty && name.length === 0) {
    return undefined;
  }

  const exists = await validateGroupName(name);
  if (exists === true) {
    throw 'Workspace name already exists';
  }

  return undefined;
};

export const createWorkspaceNameValidator = (options = {}) => {
  const debouncedValidator = awesomeDebouncePromise(
    (value) => validateWorkspaceName(value, options),
    250,
    { onlyResolvesLast: false },
  );

  return ignoreStaleValidationResults(debouncedValidator);
};

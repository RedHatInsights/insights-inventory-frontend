import useFeatureFlag from '../useFeatureFlag';

const useWorkspaceFeatureFlag = () =>
  useFeatureFlag('platform.rbac.groups-to-workspaces-rename');

export default useWorkspaceFeatureFlag;

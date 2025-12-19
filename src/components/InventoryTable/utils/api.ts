import pAll from 'p-all';
import { deleteHostById } from '../../../api/hostInventoryApiTyped';
import { ApiHostDeleteHostByIdReturnType } from '@redhat-cloud-services/host-inventory-client';

export const deleteSystemsById = async (
  systemIds: string[],
  batchSize = 50,
) => {
  const chunks: string[][] = [];
  for (let i = 0; i < systemIds.length; i += batchSize) {
    chunks.push(systemIds.slice(i, i + batchSize));
  }

  const tasks = chunks.map(
    (ids) => async (): Promise<ApiHostDeleteHostByIdReturnType> => {
      return await deleteHostById({ hostIdList: ids });
    },
  );

  return await pAll(tasks, {
    concurrency: 2,
  });
};

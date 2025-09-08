import pAll from 'p-all';
import { deleteHostById } from '../../../api/hostInventoryApi';

const resolve = async (fns, limit = 2) => {
  try {
    return await pAll(fns, {
      concurrency: limit,
    });
  } catch (error) {
    return error;
  }
};

export const deleteSystemsById = async (items, batchSize = 50) => {
  let arr = [];
  for (let i = 0; i < items.length; i += batchSize) {
    let chunk;
    chunk = items.slice(i, i + batchSize);
    arr.push(chunk);
  }

  return await resolve(
    arr.map((itemArray) => async () => {
      return await deleteHostById({ hostIdList: itemArray });
    }),
  );
};

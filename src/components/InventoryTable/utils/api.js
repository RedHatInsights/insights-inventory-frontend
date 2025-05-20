import pAll from 'p-all';
import { deleteHostById } from '../../../api/hostInventoryApi';

const resolve = async (fns, limit = 2) => {
  const results = await pAll(fns, {
    concurrency: limit,
  });
  return results;
};

export const deleteSystemsById = (items, batchSize = 50) => {
  let arr = [];
  for (let i = 0; i < items.length; i += batchSize) {
    let chunk;
    chunk = items.slice(i, i + batchSize);
    arr.push(chunk);
  }

  const results = resolve(
    arr.map((itemArray) => () => {
      return deleteHostById({ hostIdList: itemArray });
    }),
  );
  return results;
};

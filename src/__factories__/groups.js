import { faker } from '@faker-js/faker';

export const buildGroups = (length, allEmpty, allNonEmpty) => {
  return [...Array(length)].map(() => {
    const created_at = faker.date.past({ years: 3 }).getTime();

    return {
      updated_at: faker.date.soon({ refDate: created_at }).getTime(),
      id: faker.string.uuid(),
      created_at,
      name: faker.lorem.words({ min: 1, max: 3 }),
      host_count: allEmpty
        ? 0
        : allNonEmpty
        ? faker.number.int({ min: 1, max: 100 })
        : faker.number.int({ min: 0, max: 100 }),
    };
  });
};

export const buildGroupsPayload = (
  page = 1,
  per_page = 50,
  total = 20,
  allEmpty = false,
  allNonEmpty = false
) => {
  const count = Math.min(page * per_page, total);

  return {
    count,
    page,
    per_page,
    total,
    results: buildGroups(count, allEmpty, allNonEmpty),
  };
};

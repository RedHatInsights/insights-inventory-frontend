import { faker } from '@faker-js/faker';

export const buildOperatingSystems = (
  count = 10,
  { osName = 'RHEL 7', major = 7 }
) => {
  let minor = -1;
  return [...Array(count)].map(() => {
    minor++;
    return {
      value: {
        name: osName,
        major,
        minor,
      },
      count: faker.number.int({ min: 1, max: 100 }),
    };
  });
};

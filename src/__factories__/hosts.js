import { faker } from '@faker-js/faker';
import { sample } from 'lodash';

const OS_VERSIONS = ['CentOS Linux', 'RHEL'];

export const buildHosts = (length) =>
  [...Array(length)].map(() => ({
    id: faker.string.uuid(),
    insights_id: faker.lorem.slug({ min: 1, max: 3 }),
    display_name: faker.lorem.word(),
    updated: faker.date.past({ years: 3 }),
    system_profile: {
      operating_system: {
        name: sample(OS_VERSIONS),
        major: faker.number.int({ min: 1, max: 10 }),
        minor: faker.number.int(50),
      },
    },
    groups:
      Math.random() > 0.5
        ? [
            {
              id: faker.string.uuid(),
              name: faker.lorem.words({ min: 1, max: 3 }),
            },
          ]
        : [],
  }));

export const buildHostsPayload = (page = 1, per_page = 50, total = 20) => {
  const count = Math.min(page * per_page, total);

  return {
    count,
    page,
    per_page,
    total,
    results: buildHosts(count),
  };
};

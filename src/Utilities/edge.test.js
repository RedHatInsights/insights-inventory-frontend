import { edgeImageDataResult, mapDefaultData } from './edge';

import { mock } from './../__mocks__/systemIssues';

describe('mapDefaultData', () => {
  it('should return ids', () => {
    const result = [{ id: 'd20a' }, { id: 'c14b' }];
    const data = mapDefaultData(result);
    expect(data).toBeDefined();
    expect(data).toEqual({ mapDeviceIds: ['d20a', 'c14b'] });
  });
});

describe('edgeImageDataResult', () => {
  const mockedData = {
    count: 1,
    data: {
      total: 1,
      devices: [
        {
          DeviceID: 1,
          DeviceName: 'test',
          DeviceUUID: 'd20a',
          ImageID: 1,
          ImageName: 'test-93',
          LastSeen: '2023-12-12T00:10:49.042474Z',
          UpdateAvailable: true,
          Status: 'RUNNING',
          ImageSetID: 1,
          DeviceGroups: null,
          DispatcherStatus: 'SUCCESS',
          DispatcherReason: '',
          GroupName: 'test',
          GroupUUID: 'test',
        },
      ],
      enforce_edge_groups: false,
    },
  };
  const mapIds = ['d20a'];
  mock.onPost('/api/edge/v1/devices/devicesview').reply(200, mockedData);

  it('should return imge information', async () => {
    const data = await edgeImageDataResult(mapIds);
    expect(data).toBeDefined();
    expect(data).toEqual(mockedData);
  });
});

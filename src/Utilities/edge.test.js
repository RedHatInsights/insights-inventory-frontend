import { mapDefaultData } from './edge';

describe('mapDefaultData', () => {
  it('should return ids', () => {
    const result = [{ id: 'd20a' }, { id: 'c14b' }];
    const data = mapDefaultData(result);
    expect(data).toBeDefined();
    expect(data).toEqual({ mapDeviceIds: ['d20a', 'c14b'] });
  });
});

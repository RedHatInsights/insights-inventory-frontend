import { hostInventoryApi } from './hostInventoryApi';

describe('APIFactory', () => {
  it('should return an object with the expected functions', () => {
    expect(hostInventoryApi).toEqual(
      expect.objectContaining({
        apiHostGetHostSystemProfileById: expect.any(Function),
        apiHostGetHostTags: expect.any(Function),
        apiHostGetHostById: expect.any(Function),
        apiHostGetHostList: expect.any(Function),
        apiTagGetTags: expect.any(Function),
        apiSystemProfileGetOperatingSystem: expect.any(Function),
        apiStalenessGetDefaultStaleness: expect.any(Function),
        apiStalenessGetStaleness: expect.any(Function),
        apiStalenessCreateStaleness: expect.any(Function),
      }),
    );
  });
});

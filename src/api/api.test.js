import { getEntitySystemProfile } from './index';
import { mock } from '../__mocks__/hostApi';
import mockedData from '../__mocks__/mockedData.json';

it('should send the data as JSON', async () => {
    mock.onGet('/api/inventory/v1/hosts/4/system_profile').reply(200, mockedData);

    const data = await getEntitySystemProfile('4');

    expect(mock.history.get.length).toBe(1);
    expect(data).toEqual(mockedData);
});

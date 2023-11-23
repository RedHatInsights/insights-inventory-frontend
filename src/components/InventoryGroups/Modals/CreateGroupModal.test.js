import { validateGroupName } from '../utils/api';
import { validate } from './CreateGroupModal';

jest.mock('../utils/api');

describe('validate function', () => {
  it('works with basic input', async () => {
    const result = await validate('test');

    expect(result).toBe(undefined);
    expect(validateGroupName).toHaveBeenCalledWith('test');
  });

  it('trims input', async () => {
    const result = await validate(' test ');

    expect(result).toBe(undefined);
    expect(validateGroupName).toHaveBeenCalledWith('test');
  });

  it('throws error if the name is present', async () => {
    validateGroupName.mockResolvedValue(true);
    await expect(validate('test')).rejects.toBe('Group name already exists');
  });
});

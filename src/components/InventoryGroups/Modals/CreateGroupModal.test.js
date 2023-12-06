import { validateGroupName } from '../utils/api';
import { validate } from './CreateGroupModal';

jest.mock('../utils/api');

describe('validate function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('works with basic input', async () => {
    const result = await validate('test');

    expect(result).toBeUndefined();
    expect(validateGroupName).toHaveBeenCalledWith('test');
  });

  it('trims input', async () => {
    const result = await validate(' test ');

    expect(result).toBeUndefined();
    expect(validateGroupName).toHaveBeenCalledWith('test');
  });

  it('throws error if the name is present', async () => {
    validateGroupName.mockResolvedValue(true);

    await expect(validate('test')).rejects.toBe('Group name already exists');
  });

  it('does not check on undefined input', async () => {
    const result = await validate(undefined);

    expect(result).toBeUndefined();
    expect(validateGroupName).not.toHaveBeenCalled();
  });

  it('does not check on empty input', async () => {
    const result = await validate('');

    expect(result).toBeUndefined();
    expect(validateGroupName).not.toHaveBeenCalled();
  });
});

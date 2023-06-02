import { readURLSearchParams, updateURLSearchParams } from './URLSearchParams';

describe('URLSearchParams', () => {

    describe('updateURLSearchParams', () => {
        window.history.replaceState = jest.fn();

        it('simple parameters', () => {
            updateURLSearchParams({
                name: '123'
            }, {
                name: {
                    paramName: 'name'
                }
            });
            expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/?name=123');
        });

        it('with transform function', () => {
            updateURLSearchParams({
                name: '123'
            }, {
                name: {
                    paramName: 'name',
                    transformToParam: (value) => value + '_param'
                }
            });
            expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/?name=123_param');
        });
    });

    describe('readURLSearchParams', () => {
        it('simple parameters', () => {
            expect(readURLSearchParams({
                name: '123'
            }, {
                nameFilter: {
                    paramName: 'name'
                }
            })).toEqual({
                nameFilter: '123'
            });
        });

        it('with transform function', () => {
            expect(readURLSearchParams({
                name: '123'
            }, {
                nameFilter: {
                    paramName: 'name',
                    transformFromParam: (value) => parseInt(value)
                }
            })).toEqual({
                nameFilter: 123
            });
        });
    });
});

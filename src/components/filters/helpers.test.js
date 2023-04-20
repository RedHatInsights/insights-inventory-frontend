import { fromValidator, toValidator } from './helpers';
import moment from 'moment';

describe('Validates datepicker dates', () => {
    it('ToValidator', () => {
        const startOfToday = moment().startOf('day');
        const endOfToday = moment().endOf('day');
        expect(toValidator(startOfToday)(endOfToday)).toEqual('');
    });
    it('FromValidator', () => {
        const  startOfToday = moment().startOf('day');
        const   endOfToday = moment().endOf('day');
        expect(fromValidator(endOfToday)(startOfToday)).toEqual('');

    });
});

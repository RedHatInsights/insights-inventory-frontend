
import { mount as enzymeMount } from 'enzyme';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import * as ReactRouterDOM from 'react-router-dom';
import * as inventory from '@redhat-cloud-services/frontend-components-inventory';

import { init } from '../store';
import InventoryTable from './InventoryTable';

import * as loader from '../components/inventory/AsyncInventory';

jest.mock('../components/inventory/AsyncInventory', () => ({
    __esModule: true,
    asyncInventoryLoader: jest.fn()
}));

describe('InventoryTable', () => {
    let wrapper;
    const mount = children => enzymeMount(
        <ReactRouterDOM.MemoryRouter>
            <Provider store={init().getStore()}>
                {children}
            </Provider>
        </ReactRouterDOM.MemoryRouter>
    );

    beforeEach(() => {
        window.fetch = jest.fn().mockImplementation((...args) => console.log(args));

        jest.spyOn(loader, 'asyncInventoryLoader').mockImplementation(() => (inventory));
    });

    it('renders correctly', async (done) => {
        await act(async () => {
            wrapper = mount(<InventoryTable />);
        });
        wrapper.update();

        setImmediate(() => {
            console.log(wrapper.debug());
            done();
        });
    });
});

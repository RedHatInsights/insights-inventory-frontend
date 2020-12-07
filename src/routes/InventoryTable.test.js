/* eslint-disable camelcase */
import { mount as enzymeMount } from 'enzyme';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import * as ReactRouterDOM from 'react-router-dom';
import * as inventory from '@redhat-cloud-services/frontend-components-inventory';
import configureStore from 'redux-mock-store';

import InventoryTable, { calculatePagination } from './InventoryTable';

import * as loader from '@redhat-cloud-services/frontend-components/components/esm/Inventory';
import DeleteModal from '../components/DeleteModal';
import { hosts } from '../api';
import createXhrMock from '../Utilities/__mocks__/xhrMock';

jest.mock('@redhat-cloud-services/frontend-components/components/esm/Inventory', () => ({
    __esModule: true,
    InventoryTable: jest.fn()
}));

describe('InventoryTable', () => {
    let wrapper;
    let mockStore;

    const system1 = {
        account: '6089719',
        ansible_host: null,
        bios_uuid: 'fe4f7cc3-799c-48e9-abc3-8a050040b876',
        created: '2020-10-27T10:07:14.453067+00:00',
        culled_timestamp: '2020-11-11T12:07:14.263615+00:00',
        display_name: 'RHIQE.31ea86a9-a439-4422-9516-27c879057535.test',
        external_id: null,
        facts: {},
        fqdn: 'RHIQE.31ea86a9-a439-4422-9516-27c879057535.test',
        id: 'ed190a06-de88-4d62-aba1-88ad402720a8',
        insights_id: 'e562e636-ea85-4427-97be-fcbc3aede49b',
        ip_addresses: null,
        mac_addresses: ['fa:16:3e:72:a6:99', '00:00:00:00:00:00'],
        rawFacts: [],
        reporter: 'puptoo',
        rhel_machine_id: null,
        satellite_id: null,
        stale_timestamp: '2020-10-28T12:07:14.263615+00:00',
        stale_warning_timestamp: '2020-11-04T12:07:14.263615+00:00',
        subscription_manager_id: 'dd9714be-20fc-46c7-8fc0-ef2e4d5112cf',
        tags: [],
        updated: '2020-10-27T10:07:14.453072+00:00'
    };

    const initialStore = {
        entities: {
            activeFilters: [{ staleFilter: ['fresh', 'stale'] }, { registeredWithFilter: ['insights'] }],
            additionalTagsCount: 1,
            allTags: [{
                name: 'null',
                tags: [{
                    count: 1,
                    tag: { namespace: null, key: 'EZaLSÇa}{?:', value: 'vOSshUSIRIɌ𝓢ȚЦ𝒱Ѡ𝓧ƳȤ' }
                }]
            }],
            allTagsLoaded: true,
            allTagsPagination: { perPage: 10, page: 1 },
            columns: [{
                key: 'display_name',
                title: 'Name',
                renderFunc: (value) => value
            },
            {
                key: 'tags',
                title: 'Tags',
                props: { width: 25, isStatic: true },
                renderFunc: (value) => value
            },
            {
                key: 'updated',
                title: 'Last seen',
                renderFunc: (value) => value,
                props: { width: 25 }
            }],
            count: 1,
            invConfig: {},
            loaded: true,
            page: 1,
            perPage: 50,
            rows: [system1],
            sortBy: { key: 'updated', direction: 'desc' },
            tagsLoaded: false,
            total: 1
        },
        notifications: [],
        permissionsReducer: { loading: false, writePermissions: true },
        routerData: { params: {}, path: '/' },
        systemProfileStore: { systemProfile: { loaded: false } }
    };

    const mount = (children, store) => enzymeMount(
        <ReactRouterDOM.MemoryRouter>
            <Provider store={store}>
                {children}
            </Provider>
        </ReactRouterDOM.MemoryRouter>
    );

    beforeEach(() => {
        mockStore = configureStore();

        jest.spyOn(loader, 'InventoryTable').mockImplementation(() => (inventory));
    });

    it('renders correctly when write permissions', async () => {
        const store = mockStore(initialStore);

        await act(async () => {
            wrapper = mount(<InventoryTable />, store);
        });
        wrapper.update();

        expect(wrapper.find('.ins-c-primary-toolbar__first-action').find('button').text()).toEqual('Delete');
        expect(wrapper.find('.ins-c-primary-toolbar__first-action').find('button').props().disabled).toEqual(true);
        expect(wrapper.find('tbody').find('tr')).toHaveLength(1);
        expect(wrapper.find('tbody').find('tr').find('.pf-c-dropdown')).toHaveLength(1);
    });

    it('renders correctly when no write permissions', async () => {
        const store = mockStore({
            ...initialStore,
            permissionsReducer: { loading: false, writePermissions: false }
        });

        await act(async () => {
            wrapper = mount(<InventoryTable />, store);
        });
        wrapper.update();

        expect(wrapper.find('.ins-c-primary-toolbar__first-action').find('button')).toHaveLength(0);
        expect(wrapper.find('tbody').find('tr')).toHaveLength(1);
        expect(wrapper.find('tbody').find('tr').find('.pf-c-dropdown')).toHaveLength(0);
    });

    it('can select and delete items', async () => {
        const tmp = window.XMLHttpRequest;

        window.XMLHttpRequest = jest.fn().mockImplementation(createXhrMock());

        hosts.apiHostDeleteById = jest.fn().mockImplementation(() => Promise.resolve());
        const selected = new Map();
        selected.set(system1.id, system1);

        const store = mockStore(({
            ...initialStore,
            entities: {
                ...initialStore.entities,
                rows: [{ ...system1, selected: true }],
                selected
            }
        }));

        await act(async () => {
            wrapper = mount(<InventoryTable />, store);
        });
        wrapper.update();

        expect(wrapper.find(DeleteModal).props().isModalOpen).toEqual(false);
        expect(wrapper.find('.ins-c-primary-toolbar__first-action').find('button').props().disabled).toEqual(false);

        await act(async () => {
            wrapper.find('.ins-c-primary-toolbar__first-action').find('button').simulate('click');
        });
        wrapper.update();

        expect(wrapper.find(DeleteModal).props().isModalOpen).toEqual(true);

        store.clearActions();

        await act(async () => {
            // click on remove
            wrapper.find(DeleteModal).find('.pf-c-modal-box__body').find('button').at(1).simulate('click');
        });
        wrapper.update();

        expect(wrapper.find(DeleteModal).props().isModalOpen).toEqual(false);

        const actions = store.getActions();

        expect(actions[0]).toEqual({
            payload: {
                description: 'Removal of RHIQE.31ea86a9-a439-4422-9516-27c879057535.test started.',
                dismissable: false,
                id: 'remove-initiated',
                title: 'Delete operation initiated',
                variant: 'warning'
            },
            type: '@@INSIGHTS-CORE/NOTIFICATIONS/ADD_NOTIFICATION'
        }
        );
        expect(actions[1]).toEqual({
            meta: {
                notifications: {
                    fulfilled: {
                        description: 'RHIQE.31ea86a9-a439-4422-9516-27c879057535.test has been successfully removed.',
                        dismissable: true,
                        title: 'Delete operation finished',
                        variant: 'success' }
                },
                systems: ['ed190a06-de88-4d62-aba1-88ad402720a8']
            },
            payload: expect.any(Promise),
            type: 'REMOVE_ENTITY'
        });

        window.XMLHttpRequest = tmp;
    });

    it('can select and delete items from kebab', async () => {
        const tmp = window.XMLHttpRequest;

        window.XMLHttpRequest = jest.fn().mockImplementation(createXhrMock());
        const store = mockStore(initialStore);

        await act(async () => {
            wrapper = mount(<InventoryTable />, store);
        });
        wrapper.update();

        expect(wrapper.find(DeleteModal).props().isModalOpen).toEqual(false);

        expect(wrapper.find('DropdownMenu')).toHaveLength(0);

        await act(async () => {
            wrapper.find('KebabToggle').at(1).simulate('click');
        });
        wrapper.update();

        expect(wrapper.find('DropdownMenu')).toHaveLength(1);

        await act(async () => {
            wrapper.find('DropdownItem').first().find('button').simulate('click');
        });
        wrapper.update();

        expect(wrapper.find(DeleteModal).props().isModalOpen).toEqual(true);
        expect(wrapper.find(DeleteModal).props().currentSytem).toEqual(
            { displayName: 'RHIQE.31ea86a9-a439-4422-9516-27c879057535.test', id: 'ed190a06-de88-4d62-aba1-88ad402720a8' }
        );
        window.XMLHttpRequest = tmp;
    });
});

describe('calculatePagination', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                search: '?page=5&per_page=20'
            }
        });
    });

    it('should calculate from new values', () => {
        const searchParams = new URLSearchParams();
        calculatePagination(searchParams, 1, 50);
        expect(searchParams.get('page')).toBe('1');
        expect(searchParams.get('per_page')).toBe('50');
    });

    it('should calculate from old values', () => {
        const searchParams = new URLSearchParams();
        calculatePagination(searchParams);
        expect(searchParams.get('page')).toBe('5');
        expect(searchParams.get('per_page')).toBe('20');
    });

    it('should calculate from mixed values', () => {
        const searchParams = new URLSearchParams();
        calculatePagination(searchParams, 2);
        expect(searchParams.get('page')).toBe('2');
        expect(searchParams.get('per_page')).toBe('20');
    });
});

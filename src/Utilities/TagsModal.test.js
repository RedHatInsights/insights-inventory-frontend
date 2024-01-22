/* eslint-disable no-import-assign */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import debounce from 'lodash/debounce';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import * as api from '../api/api';
import TagsModal from './TagsModal';

jest.mock('lodash/debounce');
describe('TagsModal', () => {
  let initialState;
  let mockStore;
  beforeEach(() => {
    debounce.mockImplementation(jest.requireActual('lodash/debounce'));
    mockStore = configureStore([promiseMiddleware()]);
    initialState = {
      entities: {
        showTagDialog: true,
        tagModalLoaded: true,
      },
    };
  });
  describe('DOM', () => {
    it('should render loading state correctly', () => {
      const store = mockStore({
        entities: {
          showTagDialog: true,
          tagModalLoaded: false,
          activeSystemTag: {
            tagsLoaded: false,
          },
        },
      });
      const view = render(
        <Provider store={store}>
          <TagsModal />
        </Provider>
      );

      // TODO: improve skeleton accessibility
      // baseElement is used since the PF modal is rendered outside parent div
      expect(view.baseElement).toMatchSnapshot();
      expect(
        screen.getByRole('columnheader', {
          name: /name/i,
        })
      ).toBeVisible();
      expect(
        screen.getByRole('columnheader', {
          name: /value/i,
        })
      ).toBeVisible();
      expect(
        screen.getByRole('columnheader', {
          name: /tag source/i,
        })
      ).toBeVisible();
    });

    it('should render activeSystemTag', () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          activeSystemTag: {
            tags: [
              {
                key: 'some',
                value: 'test',
                namespace: 'something',
              },
            ],
            tagsLoaded: true,
            tagsCount: 50,
            page: 1,
            perPage: 10,
          },
        },
      });
      render(
        <Provider store={store}>
          <TagsModal />
        </Provider>
      );

      expect(
        screen.getByRole('columnheader', {
          name: /name/i,
        })
      ).toBeVisible();
      expect(
        screen.getByRole('columnheader', {
          name: /value/i,
        })
      ).toBeVisible();
      expect(
        screen.getByRole('columnheader', {
          name: /tag source/i,
        })
      ).toBeVisible();

      expect(screen.getAllByRole('cell')).toHaveLength(4);
      screen
        .getAllByRole('cell')
        .forEach((cell, index) =>
          expect(cell).toHaveTextContent(
            ['', 'some', 'test', 'something'][index]
          )
        );
    });

    it('should render all tags', () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          allTagsLoaded: true,
          allTagsTotal: 50,
          allTagsPagination: {
            page: 1,
            perPage: 10,
          },
          allTags: [
            {
              tags: [
                {
                  tag: {
                    key: 'some',
                    value: 'test',
                    namespace: 'something',
                  },
                },
              ],
            },
          ],
        },
      });
      render(
        <Provider store={store}>
          <TagsModal store={store} />
        </Provider>
      );

      expect(screen.getByText(/all tags in inventory \(50\)/i)).toBeVisible();
      expect(
        screen.getByRole('button', {
          name: /apply tags/i,
        })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {
          name: /cancel/i,
        })
      ).toBeEnabled();
    });
  });

  describe('API', () => {
    beforeEach(() => {
      api.getTags = jest.fn().mockImplementation(() => Promise.resolve());
      api.getAllTags = jest.fn().mockImplementation(() => Promise.resolve());
    });

    it('should call onApply select correct tag', async () => {
      const onApply = jest.fn();
      const store = mockStore({
        entities: {
          ...initialState.entities,
          allTagsLoaded: true,
          allTagsTotal: 50,
          allTagsPagination: {
            page: 1,
            perPage: 10,
          },
          allTags: [
            {
              tags: [
                {
                  tag: {
                    key: 'some',
                    value: 'test',
                    namespace: 'something',
                  },
                },
              ],
            },
          ],
        },
      });
      render(
        <Provider store={store}>
          <TagsModal onApply={onApply} />
        </Provider>
      );

      await userEvent.click(
        screen.getByRole('checkbox', {
          name: /select row 0/i,
        })
      );
      await userEvent.click(
        screen.getByRole('button', {
          name: /apply tags/i,
        })
      );
      expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('should toggle modal', async () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          allTagsLoaded: true,
          allTagsTotal: 50,
          allTagsPagination: {
            page: 1,
            perPage: 10,
          },
          allTags: [
            {
              tags: [
                {
                  tag: {
                    key: 'some',
                    value: 'test',
                    namespace: 'something',
                  },
                },
              ],
            },
          ],
        },
      });
      render(
        <Provider store={store}>
          <TagsModal />
        </Provider>
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /close/i,
        })
      );
      const actions = store.getActions();
      expect(actions[0]).toMatchObject({
        payload: { isOpen: false },
        type: 'TOGGLE_TAG_MODAL',
      });
    });

    it('should fetch additional tags when all tags shown', async () => {
      const store = mockStore({
        entities: {
          ...initialState.entities,
          allTagsLoaded: true,
          allTagsTotal: 50,
          allTagsPagination: {
            page: 1,
            perPage: 10,
          },
          allTags: [
            {
              tags: [
                {
                  tag: {
                    key: 'some',
                    value: 'test',
                    namespace: 'something',
                  },
                },
              ],
            },
          ],
        },
      });
      render(
        <Provider store={store}>
          <TagsModal />
        </Provider>
      );

      expect(
        screen.getAllByRole('button', { name: /go to next page/i })
      ).toHaveLength(2);
      await userEvent.click(
        screen.getAllByRole('button', { name: /go to next page/i })[0]
      );
      const actions = store.getActions();
      expect(actions[0]).toMatchObject({ type: 'ALL_TAGS_PENDING' });
    });
  });
});

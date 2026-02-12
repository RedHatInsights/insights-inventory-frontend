/// <reference types='@testing-library/jest-dom/jest-globals' />
import React from 'react';
import { jest, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BaseDropdown from '../BaseDropdown';

describe('BaseDropdown', () => {
  it('renders OUIA ID attributes', () => {
    render(
      <BaseDropdown
        title={'title'}
        ouiaId={`TestOuiaIdValue`}
        apiKey="conventional_time_to_stale"
        staleness={{}}
        setStaleness={jest.fn()}
        currentItem={1}
        items={[
          { name: 'name1', value: 1 },
          { name: 'name2', value: 2 },
        ]}
        isDisabled={false}
        isFormValid={true}
        setIsFormValid={jest.fn()}
        modalMessage={'Modal message'}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /name1/i,
      }),
    ).toHaveAttribute('data-ouia-component-id', 'TestOuiaIdValue');
  });
});

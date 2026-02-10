import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BaseDropdown from '../BaseDropdown';

describe('BaseDropdown', () => {
  it('renders OUIA ID attributes', () => {
    render(
      <BaseDropdown
        ouiaId={`TestOuiaIdValue`}
        items={[
          { name: 'test1', value: 'test1' },
          { name: 'test2', value: 'test2' },
        ]}
        currentItem={'test1'}
        isDisabled={false}
        title={'test1'}
        isEditing={false}
        staleness={[]}
        setStaleness={jest.fn()}
        setIsFormValid={jest.fn()}
        modalMessage={'Modal message'}
        isFormValid={true}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /test1/i,
      }),
    ).toHaveAttribute('data-ouia-component-id', 'TestOuiaIdValue');
  });
});

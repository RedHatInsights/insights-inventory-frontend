import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import OsModeLabel from './OsModeLabel';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

jest.mock('../../Utilities/useFeatureFlag');

describe('OsModeLabel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [
    {
      flagEnabled: true,
      description: 'when feature flag is enabled',
      modes: [
        { osMode: 'package', expectedText: 'Package mode' },
        { osMode: 'image', expectedText: 'Image mode' },
        { osMode: undefined, expectedText: 'Package mode' }, // Default case
      ],
    },
    {
      flagEnabled: false,
      description: 'when feature flag is disabled',
      modes: [
        { osMode: 'package', expectedText: 'Package-based' },
        { osMode: 'image', expectedText: 'Image-based' },
        { osMode: undefined, expectedText: 'Package-based' }, // Default case
      ],
    },
  ];

  describe.each(testCases)('$description', ({ flagEnabled, modes }) => {
    beforeEach(() => {
      useFeatureFlag.mockImplementation(() => flagEnabled);
    });

    test.each(modes)(
      'should render $expectedText for osMode: "$osMode"',
      ({ osMode, expectedText }) => {
        render(<OsModeLabel osMode={osMode} />);
        expect(screen.getByText(expectedText)).toBeVisible();
      },
    );
  });
});

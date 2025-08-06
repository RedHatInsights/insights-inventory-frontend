import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import OsModeLabel from './OsModeLabel';

describe('OsModeLabel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [
    {
      description: 'when feature flag is disabled',
      modes: [
        { osMode: 'package', expectedText: 'Package-based' },
        { osMode: 'image', expectedText: 'Image-based' },
        { osMode: undefined, expectedText: 'Package-based' }, // Default case
      ],
    },
  ];

  describe.each(testCases)('$description', ({ modes }) => {
    test.each(modes)(
      'should render $expectedText for osMode: "$osMode"',
      ({ osMode, expectedText }) => {
        render(<OsModeLabel osMode={osMode} />);
        expect(screen.getByText(expectedText)).toBeVisible();
      },
    );
  });
});

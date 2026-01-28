import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useParams } from 'react-router-dom';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import RhelAICard from './RhelAICard';

const location = {
  pathname: 'localhost:3000/example/path',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => location,
  useParams: jest.fn(() => ({
    modalId: 'testModal',
  })),
}));

describe('RhelAICard', () => {
  it('should render correctly - no data', () => {
    render(
      <TestWrapper>
        <RhelAICard />
      </TestWrapper>,
    );

    expect(screen.getByText('RHEL AI')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
    expect(screen.getByText('Models available')).toBeInTheDocument();
    expect(screen.getAllByText('None')).toHaveLength(2);
  });

  it('should render correctly with no rhelAI prop', () => {
    render(
      <TestWrapper>
        <RhelAICard rhelAI={null} />
      </TestWrapper>,
    );

    expect(screen.getByText('RHEL AI')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
    expect(screen.getByText('Models available')).toBeInTheDocument();
    expect(screen.getAllByText('None')).toHaveLength(2);
  });

  it('should render correctly with version only', () => {
    const rhelAI = {
      rhel_ai_version_id: '1.0.0',
      gpu_models: [],
    };
    render(
      <TestWrapper>
        <RhelAICard rhelAI={rhelAI} />
      </TestWrapper>,
    );

    expect(screen.getByText('RHEL AI')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Models available')).toBeInTheDocument();
    expect(screen.getAllByText('None')).toHaveLength(2);
    expect(screen.queryByText('GPU manufacturer')).not.toBeInTheDocument();
    expect(screen.queryByText('GPU model')).not.toBeInTheDocument();
    expect(screen.queryByText('GPU memory')).not.toBeInTheDocument();
  });

  it('should render correctly with data', () => {
    const rhelAI = {
      rhel_ai_version_id: '1.0.0',
      gpu_models: [
        {
          name: 'NVIDIA A100',
          vendor: 'NVIDIA',
          memory: '40GB',
          count: 1,
        },
      ],
    };
    render(
      <TestWrapper>
        <RhelAICard rhelAI={rhelAI} />
      </TestWrapper>,
    );

    expect(screen.getByText('RHEL AI')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('GPU manufacturer')).toBeInTheDocument();
    expect(screen.getByText('NVIDIA')).toBeInTheDocument();
    expect(screen.getByText('Models available')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('GPU model')).toBeInTheDocument();
    expect(screen.getByText('NVIDIA A100')).toBeInTheDocument();
    expect(screen.getByText('GPU memory')).toBeInTheDocument();
    expect(screen.getByText('40GB')).toBeInTheDocument();
  });

  it('should render correctly with multiple GPU models', () => {
    const rhelAI = {
      rhel_ai_version_id: '1.0.0',
      gpu_models: [
        {
          name: 'NVIDIA A100',
          vendor: 'NVIDIA',
          memory: '40GB',
          count: 2,
        },
        {
          name: 'AMD MI100',
          vendor: 'AMD',
          memory: '32GB',
          count: 1,
        },
      ],
    };
    render(
      <TestWrapper>
        <RhelAICard rhelAI={rhelAI} />
      </TestWrapper>,
    );

    expect(screen.getByText('RHEL AI')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('GPU manufacturer')).toBeInTheDocument();
    const gpuManufacturerValue = screen.getByLabelText(
      'GPU manufacturer value',
    );
    expect(gpuManufacturerValue).toHaveTextContent('NVIDIA');
    expect(gpuManufacturerValue).toHaveTextContent('AMD');
    expect(screen.getByText('Models available')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('GPU model')).toBeInTheDocument();
    const gpuModelValue = screen.getByLabelText('GPU model value');
    expect(gpuModelValue).toHaveTextContent('NVIDIA A100');
    expect(gpuModelValue).toHaveTextContent('AMD MI100');
    expect(screen.getByText('GPU memory')).toBeInTheDocument();
    const gpuMemoryValue = screen.getByLabelText('GPU memory value');
    expect(gpuMemoryValue).toHaveTextContent('40GB');
    expect(gpuMemoryValue).toHaveTextContent('32GB');
  });

  it('should render correctly with no version', () => {
    const rhelAI = {
      gpu_models: [
        {
          name: 'NVIDIA A100',
          vendor: 'NVIDIA',
          memory: '40GB',
          count: 1,
        },
      ],
    };
    render(
      <TestWrapper>
        <RhelAICard rhelAI={rhelAI} />
      </TestWrapper>,
    );

    expect(screen.getByText('RHEL AI')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
    expect(screen.getByText('GPU manufacturer')).toBeInTheDocument();
    expect(screen.getByText('NVIDIA')).toBeInTheDocument();
    expect(screen.getByText('Models available')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Number of GPUs')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('GPU model')).toBeInTheDocument();
    expect(screen.getByText('NVIDIA A100')).toBeInTheDocument();
    expect(screen.getByText('GPU memory')).toBeInTheDocument();
    expect(screen.getByText('40GB')).toBeInTheDocument();
  });

  describe('api', () => {
    beforeEach(() => {
      location.pathname = 'localhost:3000/example/path';
    });

    it('should NOT call handleClick', async () => {
      const rhelAI = {
        rhel_ai_version_id: '1.0.0',
        ai_models: ['model1', 'model2'],
      };
      const onClick = jest.fn();
      render(
        <TestWrapper>
          <RhelAICard rhelAI={rhelAI} />
        </TestWrapper>,
      );

      const modelsAvailableLink = screen.getByRole('link', { name: /2/i });
      await userEvent.click(modelsAvailableLink);
      await waitFor(() => {
        expect(onClick).not.toHaveBeenCalled();
      });
    });

    it('should call handleClick on models available', async () => {
      const rhelAI = {
        rhel_ai_version_id: '1.0.0',
        ai_models: ['model1', 'model2'],
      };
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/models_available';
      useParams.mockImplementation(() => ({ modalId: 'models_available' }));
      render(
        <TestWrapper>
          <RhelAICard rhelAI={rhelAI} handleClick={onClick} />
        </TestWrapper>,
      );

      const modelsAvailableLink = screen.getByRole('link', { name: /2/i });
      await userEvent.click(modelsAvailableLink);
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });
  });
});

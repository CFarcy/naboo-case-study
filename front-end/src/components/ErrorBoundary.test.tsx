import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const Boom = ({ explode }: { explode: boolean }) => {
  if (explode) throw new Error('boom');
  return <span>safe</span>;
};

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe('ErrorBoundary', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders children when no error is thrown', () => {
    renderWithMantine(
      <ErrorBoundary>
        <Boom explode={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('safe')).toBeInTheDocument();
  });

  it('renders the default fallback when a child throws', () => {
    renderWithMantine(
      <ErrorBoundary>
        <Boom explode />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Une erreur est survenue/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Réessayer/i }),
    ).toBeInTheDocument();
  });

  it('renders a custom fallback when provided', () => {
    renderWithMantine(
      <ErrorBoundary fallback={<span>custom-fallback</span>}>
        <Boom explode />
      </ErrorBoundary>,
    );

    expect(screen.getByText('custom-fallback')).toBeInTheDocument();
  });

  it('recovers when the user clicks Réessayer and the child no longer throws', async () => {
    const Wrapper = () => {
      const [explode, setExplode] = useState(true);
      return (
        <>
          <button onClick={() => setExplode(false)}>fix</button>
          <ErrorBoundary>
            <Boom explode={explode} />
          </ErrorBoundary>
        </>
      );
    };

    renderWithMantine(<Wrapper />);

    expect(screen.getByText(/Une erreur est survenue/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /fix/i }));
    await userEvent.click(screen.getByRole('button', { name: /Réessayer/i }));

    expect(screen.getByText('safe')).toBeInTheDocument();
  });
});

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <Container py="xl">
        <Stack align="center" spacing="md">
          <Title order={2}>Une erreur est survenue</Title>
          <Text c="dimmed" ta="center">
            Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou
            recharger la page.
          </Text>
          <Button onClick={this.handleReset}>Réessayer</Button>
        </Stack>
      </Container>
    );
  }
}

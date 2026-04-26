import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthContext } from '@/contexts/authContext';
import SetDebugMode from '@/graphql/mutations/auth/setDebugMode';
import { GetUserQuery } from '@/graphql/generated/types';
import { DebugModeToggle } from './DebugModeToggle';

const userFixture = (
  overrides: Partial<GetUserQuery['getMe']> = {},
): GetUserQuery['getMe'] => ({
  __typename: 'User',
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.fr',
  role: 'user',
  debugModeEnabled: false,
  bookmarks: [],
  ...overrides,
});

const renderWith = ({
  user,
  mocks,
}: {
  user: GetUserQuery['getMe'] | null;
  mocks: ReadonlyArray<MockedResponse>;
}) => {
  const refreshUser = vi.fn().mockResolvedValue(undefined);
  render(
    <MockedProvider mocks={mocks} addTypename={true}>
      <AuthContext.Provider
        value={{
          user,
          isLoading: false,
          handleSignin: () => Promise.resolve(),
          handleSignup: () => Promise.resolve(),
          handleLogout: () => Promise.resolve(),
          refreshUser,
        }}
      >
        <DebugModeToggle />
      </AuthContext.Provider>
    </MockedProvider>,
  );
  return { refreshUser };
};

describe('DebugModeToggle', () => {
  it('renders nothing when no user is signed in', () => {
    renderWith({ user: null, mocks: [] });
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders nothing for non-admin users', () => {
    renderWith({ user: userFixture({ role: 'user' }), mocks: [] });
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('calls setDebugMode and refreshes user when admin toggles', async () => {
    const result = vi.fn(() => ({
      data: {
        setDebugMode: {
          __typename: 'User' as const,
          id: 'user-1',
          debugModeEnabled: true,
        },
      },
    }));
    const { refreshUser } = renderWith({
      user: userFixture({ role: 'admin', debugModeEnabled: false }),
      mocks: [
        {
          request: { query: SetDebugMode, variables: { enabled: true } },
          result,
        },
      ],
    });

    await userEvent.click(screen.getByRole('checkbox', { name: /Mode debug/i }));

    await waitFor(() => expect(result).toHaveBeenCalled());
    await waitFor(() => expect(refreshUser).toHaveBeenCalled());
  });
});

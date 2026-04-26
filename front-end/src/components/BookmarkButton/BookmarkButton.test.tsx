import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthContext } from '@/contexts/authContext';
import AddBookmark from '@/graphql/mutations/bookmark/addBookmark';
import RemoveBookmark from '@/graphql/mutations/bookmark/removeBookmark';
import { GetUserQuery } from '@/graphql/generated/types';
import { BookmarkButton } from './BookmarkButton';

const activityFixture = {
  __typename: 'Activity' as const,
  id: 'activity-1',
  city: 'city',
  description: 'description',
  name: 'name',
  price: 10,
  createdAt: '2024-01-01T00:00:00.000Z',
  owner: { __typename: 'User' as const, firstName: 'John', lastName: 'Doe' },
};

const userFixture = (
  bookmarks: GetUserQuery['getMe']['bookmarks'],
): GetUserQuery['getMe'] => ({
  __typename: 'User',
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.fr',
  role: 'user',
  debugModeEnabled: false,
  bookmarks,
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
        <BookmarkButton activityId="activity-1" />
      </AuthContext.Provider>
    </MockedProvider>,
  );
  return { refreshUser };
};

describe('BookmarkButton', () => {
  it('renders nothing when no user is signed in', () => {
    renderWith({ user: null, mocks: [] });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls addBookmark when the activity is not yet bookmarked', async () => {
    const result = vi.fn(() => ({
      data: {
        addBookmark: { __typename: 'User', id: 'user-1', bookmarks: [activityFixture] },
      },
    }));
    const { refreshUser } = renderWith({
      user: userFixture([]),
      mocks: [
        {
          request: { query: AddBookmark, variables: { activityId: 'activity-1' } },
          result,
        },
      ],
    });

    await userEvent.click(screen.getByRole('button', { name: /Ajouter aux favoris/i }));

    await waitFor(() => expect(result).toHaveBeenCalled());
    await waitFor(() => expect(refreshUser).toHaveBeenCalled());
  });

  it('calls removeBookmark when the activity is already bookmarked', async () => {
    const result = vi.fn(() => ({
      data: {
        removeBookmark: { __typename: 'User', id: 'user-1', bookmarks: [] },
      },
    }));
    const { refreshUser } = renderWith({
      user: userFixture([activityFixture]),
      mocks: [
        {
          request: {
            query: RemoveBookmark,
            variables: { activityId: 'activity-1' },
          },
          result,
        },
      ],
    });

    await userEvent.click(screen.getByRole('button', { name: /Retirer des favoris/i }));

    await waitFor(() => expect(result).toHaveBeenCalled());
    await waitFor(() => expect(refreshUser).toHaveBeenCalled());
  });
});

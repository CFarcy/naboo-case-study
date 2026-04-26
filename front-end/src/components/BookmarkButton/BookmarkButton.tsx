import {
  AddBookmarkMutation,
  AddBookmarkMutationVariables,
  RemoveBookmarkMutation,
  RemoveBookmarkMutationVariables,
} from '@/graphql/generated/types';
import AddBookmark from '@/graphql/mutations/bookmark/addBookmark';
import RemoveBookmark from '@/graphql/mutations/bookmark/removeBookmark';
import { useAuth, useSnackbar } from '@/hooks';
import { useMutation } from '@apollo/client';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import { MouseEvent } from 'react';

interface BookmarkButtonProps {
  activityId: string;
}

export function BookmarkButton({ activityId }: BookmarkButtonProps) {
  const { user, refreshUser } = useAuth();
  const snackbar = useSnackbar();

  const [addBookmark, addState] = useMutation<
    AddBookmarkMutation,
    AddBookmarkMutationVariables
  >(AddBookmark);
  const [removeBookmark, removeState] = useMutation<
    RemoveBookmarkMutation,
    RemoveBookmarkMutationVariables
  >(RemoveBookmark);

  if (!user) return null;

  const isBookmarked = user.bookmarks.some((b) => b.id === activityId);
  const isLoading = addState.loading || removeState.loading;

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      if (isBookmarked) {
        await removeBookmark({ variables: { activityId } });
      } else {
        await addBookmark({ variables: { activityId } });
      }
      await refreshUser();
    } catch {
      snackbar.error('Une erreur est survenue');
    }
  };

  return (
    <Tooltip label={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
      <ActionIcon
        variant={isBookmarked ? 'filled' : 'light'}
        color="yellow"
        onClick={handleClick}
        loading={isLoading}
        aria-label={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        aria-pressed={isBookmarked}
      >
        {isBookmarked ? (
          <IconBookmarkFilled size="1.125rem" />
        ) : (
          <IconBookmark size="1.125rem" />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

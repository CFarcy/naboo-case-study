import {
  SetDebugModeMutation,
  SetDebugModeMutationVariables,
} from '@/graphql/generated/types';
import SetDebugMode from '@/graphql/mutations/auth/setDebugMode';
import { useAuth, useSnackbar } from '@/hooks';
import { useMutation } from '@apollo/client';
import { Switch } from '@mantine/core';
import { ChangeEvent } from 'react';

export function DebugModeToggle() {
  const { user, refreshUser } = useAuth();
  const snackbar = useSnackbar();

  const [setDebugMode, { loading }] = useMutation<
    SetDebugModeMutation,
    SetDebugModeMutationVariables
  >(SetDebugMode);

  if (user?.role !== 'admin') return null;

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const enabled = event.currentTarget.checked;
    try {
      await setDebugMode({ variables: { enabled } });
      await refreshUser();
    } catch {
      snackbar.error('Une erreur est survenue');
    }
  };

  return (
    <Switch
      label="Mode debug"
      checked={user.debugModeEnabled}
      onChange={handleChange}
      disabled={loading}
    />
  );
}

import { SnackbarContext } from '@/contexts/snackbarContext';
import { useContext } from 'react';

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  return context;
}

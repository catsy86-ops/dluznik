/**
 * useGuestGuard Hook
 * 
 * Blocks write operations in guest mode.
 * Shows a toast notification when guest tries to modify data.
 */

import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

export function useGuestGuard() {
  const { isGuest } = useAuth();
  const { toast } = useToast();

  const guardAction = (action: () => void, message = 'Zaloguj się aby wykonać tę akcję') => {
    if (isGuest) {
      toast(`🔒 Tryb gościa: ${message}`, 'info');
      return false;
    }
    action();
    return true;
  };

  const checkGuest = (message = 'Zaloguj się aby wykonać tę akcję'): boolean => {
    if (isGuest) {
      toast(`🔒 Tryb gościa: ${message}`, 'info');
      return true; // is guest = blocked
    }
    return false; // not guest = allowed
  };

  return { isGuest, guardAction, checkGuest };
}

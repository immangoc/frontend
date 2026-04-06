// Bridge: re-exports auth from the main app's WarehouseAuthContext
// so that 3D components can keep using `useAuth()` without changes.
import { useWarehouseAuth } from '../../contexts/WarehouseAuthContext';
import type { JwtUser } from '../services/apiClient';

export function useAuth(): JwtUser | null {
  const { user } = useWarehouseAuth();
  if (!user) return null;
  return {
    username: user.name || user.email,
    role: (user.role || 'OPERATOR').toUpperCase(),
  };
}

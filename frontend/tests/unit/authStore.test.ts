/**
 * Unit tests for authStore.
 *
 * Tests cover authentication state management including login, logout,
 * and persistence functionality.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../src/lib/store/authStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have null token initially', () => {
      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
    });

    it('should have null user initially', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAuth', () => {
    it('should set token and user when authenticated', () => {
      const testUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        is_active: true,
        is_superuser: false,
      };
      const testToken = 'jwt-token-123';

      useAuthStore.getState().setAuth(testToken, testUser);

      const state = useAuthStore.getState();
      expect(state.token).toBe(testToken);
      expect(state.user).toEqual(testUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle user without optional full_name', () => {
      const testUser = {
        id: '2',
        email: 'minimal@example.com',
        username: 'minimaluser',
        is_active: true,
        is_superuser: false,
      };
      const testToken = 'jwt-token-456';

      useAuthStore.getState().setAuth(testToken, testUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(testUser);
      expect(state.user?.full_name).toBeUndefined();
    });

    it('should handle superuser flag', () => {
      const adminUser = {
        id: '3',
        email: 'admin@example.com',
        username: 'admin',
        is_active: true,
        is_superuser: true,
      };
      const testToken = 'admin-token';

      useAuthStore.getState().setAuth(testToken, adminUser);

      const state = useAuthStore.getState();
      expect(state.user?.is_superuser).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear token on logout', () => {
      // First authenticate
      const testUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        is_active: true,
        is_superuser: false,
      };
      useAuthStore.getState().setAuth('token', testUser);

      // Then logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
    });

    it('should clear user on logout', () => {
      const testUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        is_active: true,
        is_superuser: false,
      };
      useAuthStore.getState().setAuth('token', testUser);

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should set isAuthenticated to false on logout', () => {
      const testUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        is_active: true,
        is_superuser: false,
      };
      useAuthStore.getState().setAuth('token', testUser);

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should remove auth_token from localStorage', () => {
      const testUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        is_active: true,
        is_superuser: false,
      };
      useAuthStore.getState().setAuth('token', testUser);

      useAuthStore.getState().logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('State Transitions', () => {
    it('should allow re-authentication after logout', () => {
      const user1 = {
        id: '1',
        email: 'user1@example.com',
        username: 'user1',
        is_active: true,
        is_superuser: false,
      };
      const user2 = {
        id: '2',
        email: 'user2@example.com',
        username: 'user2',
        is_active: true,
        is_superuser: false,
      };

      // First login
      useAuthStore.getState().setAuth('token1', user1);
      expect(useAuthStore.getState().user?.id).toBe('1');

      // Logout
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // Second login with different user
      useAuthStore.getState().setAuth('token2', user2);
      expect(useAuthStore.getState().user?.id).toBe('2');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should allow updating authentication', () => {
      const user = {
        id: '1',
        email: 'user@example.com',
        username: 'user',
        is_active: true,
        is_superuser: false,
      };

      useAuthStore.getState().setAuth('token1', user);
      useAuthStore.getState().setAuth('token2', { ...user, username: 'updated' });

      const state = useAuthStore.getState();
      expect(state.token).toBe('token2');
      expect(state.user?.username).toBe('updated');
    });
  });
});

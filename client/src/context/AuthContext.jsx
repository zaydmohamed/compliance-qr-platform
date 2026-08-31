import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// 2 Minutes Inactivity Auto-Logout (120,000 milliseconds)
const INACTIVITY_LIMIT_MS = 2 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('compliance_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('compliance_token') || null);
  const [platformSettings, setPlatformSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('compliance_settings');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  // Instant loading if no token or if user is already cached in localStorage
  const [loading, setLoading] = useState(() => {
    const hasToken = !!localStorage.getItem('compliance_token');
    const hasUser = !!localStorage.getItem('compliance_user');
    return hasToken && !hasUser;
  });

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('compliance_token');
    localStorage.removeItem('compliance_user');
  }, []);

  const fetchPlatformSettings = useCallback(async () => {
    try {
      const res = await api.get('/public/settings');
      if (res.data?.success && res.data?.data) {
        setPlatformSettings(res.data.data);
        localStorage.setItem('compliance_settings', JSON.stringify(res.data.data));
      }
    } catch {}
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const promises = [
          api.get('/public/settings').catch(() => null)
        ];
        if (token) {
          promises.push(api.get('/auth/me').catch(() => null));
        }

        const [settingsRes, meRes] = await Promise.all(promises);

        if (!isMounted) return;

        if (settingsRes?.data?.success && settingsRes.data.data) {
          setPlatformSettings(settingsRes.data.data);
          localStorage.setItem('compliance_settings', JSON.stringify(settingsRes.data.data));
        }

        if (meRes?.data?.success && meRes.data.data?.user) {
          const freshUser = meRes.data.data.user;
          setUser(freshUser);
          localStorage.setItem('compliance_user', JSON.stringify(freshUser));
        } else if (token && meRes && !meRes.data?.success) {
          logout();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [token, logout]);

  // 2 Minutes Inactivity Auto-Logout Effect
  useEffect(() => {
    if (!token || !user) return;

    let timer;

    const resetInactivityTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        toast.error('Warbixin: Akoonkaagu si toos ah ayuu u xirmay amniga dhiiggisa darteed ka dib 2 daqiiqo oo aadan isticmaalin (2 min inactivity auto-logout).', {
          id: 'auto-logout-toast',
          duration: 6000,
        });
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach((evt) => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((evt) => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
    };
  }, [token, user, logout]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('compliance_token', newToken);
        localStorage.setItem('compliance_user', JSON.stringify(newUser));
        toast.success(`Welcome, ${newUser.fullName}!`);
        fetchPlatformSettings();
        return { success: true, user: newUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('compliance_user', JSON.stringify(updatedUser));
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const isPlatformAdmin = user?.role === 'PLATFORM_ADMIN';
  const isOrgUser = user?.role === 'ORGANIZATION_USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout: handleLogout,
        updateUser,
        isPlatformAdmin,
        isOrgUser,
        isAuthenticated: !!user && !!token,
        platformSettings,
        refreshPlatformSettings: fetchPlatformSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

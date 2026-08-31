'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  usersList: Profile[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: { full_name: string; email: string; password?: string; role?: 'admin' | 'manager' | 'operator' }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addUser: (data: { full_name: string; email: string; role: 'admin' | 'manager' | 'operator' }) => Promise<Profile>;
  updateUser: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USERS_KEY = 'nochelis_users_list_v1';
const STORAGE_CURRENT_USER_KEY = 'nochelis_current_user_v1';

const initialUsers: Profile[] = [
  {
    id: 'usr-admin-01',
    full_name: 'Bruno Lima (Administrador)',
    email: 'admin@nochelis.com',
    role: 'admin',
    avatar_url: '',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-manager-02',
    full_name: 'Carolina Mendes',
    email: 'carolina.mendes@nochelis.com',
    role: 'manager',
    avatar_url: '',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-op-03',
    full_name: 'Lucas Ferreira',
    email: 'lucas.estoque@nochelis.com',
    role: 'operator',
    avatar_url: '',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      const storedCurrentUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);

      const parsedUsers: Profile[] = storedUsers ? JSON.parse(storedUsers) : initialUsers;
      setUsersList(parsedUsers);

      if (storedCurrentUser) {
        setUser(JSON.parse(storedCurrentUser));
      } else {
        // Usuário padrão logado para fluidez de desenvolvimento
        const defaultUser = parsedUsers[0] || initialUsers[0];
        setUser(defaultUser);
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.warn('Erro ao inicializar sessão local:', e);
      setUsersList(initialUsers);
      setUser(initialUsers[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persistência
  useEffect(() => {
    if (usersList.length > 0) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(usersList));
    }
  }, [usersList]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || '123456',
        });

        if (error) {
          console.warn('Falha no Supabase Auth, validando localmente:', error.message);
        }
      }

      // Validação local / mock
      const existingUser = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        setUser(existingUser);
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(existingUser));
        return { success: true };
      }

      // Se não existe, cria como novo operador
      const newUser: Profile = {
        id: `usr-${Date.now()}`,
        full_name: email.split('@')[0],
        email,
        role: 'operator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUsersList((prev) => [...prev, newUser]);
      setUser(newUser);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao realizar login' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async ({
    full_name,
    email,
    password,
    role = 'admin',
  }: {
    full_name: string;
    email: string;
    password?: string;
    role?: 'admin' | 'manager' | 'operator';
  }) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase.auth.signUp({
          email,
          password: password || '123456',
          options: {
            data: { full_name, role },
          },
        });
        if (error) {
          console.warn('Supabase Auth signUp aviso:', error.message);
        }
      }

      const newUser: Profile = {
        id: `usr-${Date.now()}`,
        full_name,
        email,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUsersList((prev) => [...prev, newUser]);
      setUser(newUser);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao registrar usuário' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar no Supabase:', e);
    }
    setUser(null);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    router.push('/login');
  };

  const addUser = async (data: { full_name: string; email: string; role: 'admin' | 'manager' | 'operator' }) => {
    const newUser: Profile = {
      id: `usr-${Date.now()}`,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUsersList((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<Profile>) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates, updated_at: new Date().toISOString() };
          if (user?.id === id) {
            setUser(updated);
            localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updated));
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = async (id: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        usersList,
        login,
        signUp,
        logout,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

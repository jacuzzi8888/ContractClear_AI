"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface UserInfo {
  userId: string | null;
  auth0Id: string | null;
  email: string | null;
  fullName: string | null;
  hasPassword: boolean;
}

interface UserContextType {
  user: UserInfo;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const defaultUser: UserInfo = {
  userId: null,
  auth0Id: null,
  email: null,
  fullName: null,
  hasPassword: false,
};

const UserContext = createContext<UserContextType>({ user: defaultUser, isLoading: true, refresh: async () => {} });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.userId) {
        setUser({
          userId: data.userId,
          auth0Id: data.auth0Id || null,
          email: data.email || null,
          fullName: data.fullName || null,
          hasPassword: data.hasPassword || false,
        });
      } else {
        setUser(defaultUser);
      }
    } catch {
      setUser(defaultUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

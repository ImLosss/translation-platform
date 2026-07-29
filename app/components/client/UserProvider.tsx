"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

export interface CurrentUser {
  id: number;
  email: string;
  username: string | null;
  avatar: string | null;
  role: string;
}

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const user = useContext(UserContext);

  if (!user) {
    throw new Error(
      "useUser harus digunakan di dalam UserProvider"
    );
  }

  return user;
}
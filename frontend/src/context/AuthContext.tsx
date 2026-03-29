import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "student";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  studentId?: string;
  roomNo?: string;
  blockNo?: string;
  hostel?: string;
  roomType?: string;
  acType?: string;
  fee?: number;
  dueDate?: string;
}

const DEMO_USERS: Record<string, AuthUser & { password: string }> = {
  admin: {
    id: "USR001",
    password: "admin123",
    name: "Dr. Meera Iyer",
    role: "admin",
    email: "admin@hostel.edu",
    avatar: "MI",
  },
  "240953654": {
    id: "240953654",
    password: "student123",
    name: "Srijan Sharma",
    role: "student",
    email: "srijan.sharma@hostel.edu",
    avatar: "SS",
    studentId: "240953654",
    fee: 140000,
  },
};

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (username: string, password: string): boolean => {
    const found = DEMO_USERS[username.toLowerCase()];
    if (found && found.password === password) {
      const { password: _pw, ...authUser } = found;
      setUser(authUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

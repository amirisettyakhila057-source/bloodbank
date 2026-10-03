import { createContext, useContext } from 'react';
import { useStore } from '../hooks/useStore';
import {
  getCurrentUser, getUsers, saveUsers, setCurrentUser, logoutUser,
} from '../utils/localStorage';
import { nextId, todayISO } from '../utils/format';

const AuthContext = createContext(null);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }) {
  const user = useStore(getCurrentUser);

  async function login(email, password) {
    await wait(400); // brief delay so the loading state is visible in the demo
    const account = getUsers().find((u) => u.email === email.trim().toLowerCase());
    if (!account || account.password !== password) return { ok: false, message: 'Incorrect email or password.' };
    if (account.status !== 'Active') return { ok: false, message: 'This account has been disabled. Contact the administrator.' };
    setCurrentUser(account);
    return { ok: true, user: account };
  }

  async function signup(values) {
    await wait(400);
    const users = getUsers();
    const email = values.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) {
      return { ok: false, field: 'email', message: 'An account with this email already exists.' };
    }
    const account = {
      id: nextId(users, '', 1),
      name: values.name.trim(),
      email,
      phone: values.phone,
      password: values.password,
      role: 'user', // public signup can never create an admin
      accountType: values.accountType,
      city: '', bloodGroup: '', status: 'Active', createdAt: todayISO(),
    };
    saveUsers([...users, account]);
    return { ok: true, user: account };
  }

  function updateProfile(changes) {
    const users = getUsers().map((u) => (u.id === user.id ? { ...u, ...changes } : u));
    saveUsers(users);
    setCurrentUser(users.find((u) => u.id === user.id));
  }

  function changePassword(currentPassword, newPassword) {
    const account = getUsers().find((u) => u.id === user.id);
    if (account.password !== currentPassword) return { ok: false, message: 'Current password is incorrect.' };
    updateProfile({ password: newPassword });
    return { ok: true, message: 'Password changed successfully.' };
  }

  const value = { user, isAdmin: user?.role === 'admin', login, signup, logout: logoutUser, updateProfile, changePassword };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

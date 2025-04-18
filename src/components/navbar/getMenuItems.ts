
import {
  Home,
  FileCheck,
  Handshake,
  Users,
  UserPlus,
  LogOut,
  Settings,
  Server,
  ShoppingBag,
} from 'lucide-react';

export type MenuItem = {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
  adminOnly?: boolean;
};

// Add ClothingStore to the menu items
export const getMenuItems = () => {
  return [
    { to: '/', icon: Home, label: 'Startseite' },
    { to: '/apply', icon: FileCheck, label: 'Bewerben' },
    { to: '/partners', icon: Handshake, label: 'Partner' },
    { to: '/subservers', icon: Server, label: 'Subserver' },
    { to: '/clothingstore', icon: ShoppingBag, label: 'Clothing Store' }
  ];
};

export const getUserMenuItems = (session: any, isAdmin: boolean) => {
  const userMenuItems: MenuItem[] = [];

  if (session) {
    userMenuItems.push(
      { to: '/profile', icon: Settings, label: 'Profil' },
      { to: '/', icon: LogOut, label: 'Logout' }
    );
  } else {
    userMenuItems.push({ to: '/login', icon: UserPlus, label: 'Login' });
  }

  if (isAdmin) {
    userMenuItems.push({ to: '/admin/dashboard', icon: Users, label: 'Admin', adminOnly: true });
  }

  return userMenuItems;
};

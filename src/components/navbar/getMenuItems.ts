
import { LayoutDashboard, ShoppingBag, Server, LifeBuoy, Users, UserCircle } from 'lucide-react';

export const getMenuItems = () => {
  return [
    {
      title: 'Start',
      path: '/',
    },
    {
      title: 'Bewerben',
      path: '/apply',
    },
    {
      title: 'Partner',
      path: '/partners',
    },
    {
      title: 'Subserver',
      path: '/subservers',
    },
    {
      title: 'Clothing Store',
      path: '/clothingstore',
    },
  ];
};

export const getUserMenuItems = (session: any, isAdmin: boolean) => {
  if (!session) return [];
  
  const userMenuItems = [
    {
      title: 'Profil',
      path: '/profile',
      icon: UserCircle,
    },
  ];
  
  if (isAdmin) {
    userMenuItems.push({
      title: 'Admin-Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    });
  }
  
  return userMenuItems;
};

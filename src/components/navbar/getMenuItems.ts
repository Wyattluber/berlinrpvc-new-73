
import { Home, Users, Server, BookOpen, ShoppingBag, User, Shield } from 'lucide-react';

export const getMenuItems = () => [
  { to: "/", icon: Home, label: "Startseite" },
  { to: "/subservers", icon: Server, label: "Subserver" },
  { to: "/partners", icon: Users, label: "Partner" },
  { to: "/clothingstore", icon: ShoppingBag, label: "Clothing Store" },
];

export const getUserMenuItems = (session: any, isAdmin: boolean) => {
  return session ? [
    { to: "/profile", icon: User, label: "Mein Profil" },
    ...(isAdmin ? [{ to: "/profile?tab=admin", icon: Shield, label: "Admin Panel" }] : []),
  ] : [
    { to: "/login", icon: User, label: "Login" },
    { to: "/apply", icon: BookOpen, label: "Bewerben", highlight: true },
  ];
};

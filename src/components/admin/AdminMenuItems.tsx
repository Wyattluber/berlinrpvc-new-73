
import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, Bell, Newspaper, CalendarDays, UserCheck, FileQuestion, UserX, CalendarRange, Bus, Handshake, UserMinus } from 'lucide-react';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  admin?: boolean;
}

export const getAdminMenuItems = (isAdmin: boolean): MenuItem[] => {
  const allItems: MenuItem[] = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      id: 'users',
      icon: <Users className="h-5 w-5" />,
      label: 'Benutzerverwaltung',
      admin: true,
    },
    {
      id: 'applications',
      icon: <FileText className="h-5 w-5" />,
      label: 'Bewerbungen',
    },
    {
      id: 'announcements',
      icon: <Bell className="h-5 w-5" />,
      label: 'Ankündigungen',
    },
    {
      id: 'news',
      icon: <Newspaper className="h-5 w-5" />,
      label: 'Neuigkeiten',
    },
    {
      id: 'team-settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Team-Einstellungen',
      admin: true,
    },
    {
      id: 'team-absences',
      icon: <CalendarDays className="h-5 w-5" />,
      label: 'Team-Abwesenheiten',
    },
    {
      id: 'my-absences',
      icon: <UserMinus className="h-5 w-5" />,
      label: 'Meine Abwesenheiten',
    },
    {
      id: 'change-requests',
      icon: <UserCheck className="h-5 w-5" />,
      label: 'Änderungsanträge',
      admin: true,
    },
    {
      id: 'delete-requests',
      icon: <FileQuestion className="h-5 w-5" />,
      label: 'Löschanträge',
      admin: true,
    },
    {
      id: 'seasons',
      icon: <CalendarRange className="h-5 w-5" />,
      label: 'Bewerbungssaisons',
      admin: true,
    },
    {
      id: 'subservers',
      icon: <Bus className="h-5 w-5" />,
      label: 'Subserver',
      admin: true,
    },
    {
      id: 'partners',
      icon: <Handshake className="h-5 w-5" />,
      label: 'Partner',
      admin: true,
    },
  ];

  // Filter admin-only items if the user is not an admin
  return allItems.filter(item => !item.admin || isAdmin);
};

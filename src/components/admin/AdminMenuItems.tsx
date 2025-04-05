
import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, Bell, Newspaper, CalendarDays, UserCheck, FileQuestion, UserX, CalendarRange, Bus, Handshake, UserMinus } from 'lucide-react';

export interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  title: string; 
  admin?: boolean;
}

export const getAdminMenuItems = (isAdmin: boolean): MenuItem[] => {
  const allItems: MenuItem[] = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      title: 'Dashboard',
    },
    {
      id: 'users',
      icon: <Users className="h-5 w-5" />,
      label: 'Benutzerverwaltung',
      title: 'Benutzerverwaltung',
      admin: true,
    },
    {
      id: 'applications',
      icon: <FileText className="h-5 w-5" />,
      label: 'Bewerbungen',
      title: 'Bewerbungen',
    },
    {
      id: 'announcements',
      icon: <Bell className="h-5 w-5" />,
      label: 'Ankündigungen',
      title: 'Ankündigungen',
    },
    {
      id: 'news',
      icon: <Newspaper className="h-5 w-5" />,
      label: 'Neuigkeiten',
      title: 'Neuigkeiten',
    },
    {
      id: 'team-settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Team-Einstellungen',
      title: 'Team-Einstellungen',
      admin: true,
    },
    {
      id: 'team-absences',
      icon: <CalendarDays className="h-5 w-5" />,
      label: 'Team-Abwesenheiten',
      title: 'Team-Abwesenheiten',
    },
    {
      id: 'my-absences',
      icon: <UserMinus className="h-5 w-5" />,
      label: 'Meine Abwesenheiten',
      title: 'Meine Abwesenheiten',
    },
    {
      id: 'change-requests',
      icon: <UserCheck className="h-5 w-5" />,
      label: 'Änderungsanträge',
      title: 'Änderungsanträge',
      admin: true,
    },
    {
      id: 'delete-requests',
      icon: <FileQuestion className="h-5 w-5" />,
      label: 'Löschanträge',
      title: 'Löschanträge',
      admin: true,
    },
    {
      id: 'seasons',
      icon: <CalendarRange className="h-5 w-5" />,
      label: 'Bewerbungssaisons',
      title: 'Bewerbungssaisons',
      admin: true,
    },
    {
      id: 'subservers',
      icon: <Bus className="h-5 w-5" />,
      label: 'Subserver',
      title: 'Subserver',
      admin: true,
    },
    {
      id: 'partners',
      icon: <Handshake className="h-5 w-5" />,
      label: 'Partner',
      title: 'Partner',
      admin: true,
    },
  ];

  // Filter admin-only items if the user is not an admin
  return allItems.filter(item => !item.admin || isAdmin);
};

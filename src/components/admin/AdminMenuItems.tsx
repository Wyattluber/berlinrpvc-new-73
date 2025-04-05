
import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, Bell, Newspaper, CalendarDays, UserCheck, FileQuestion, UserX, CalendarRange, Bus, Handshake, UserMinus } from 'lucide-react';

export interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  title?: string; // Added title property for compatibility
  admin?: boolean;
}

export const getAdminMenuItems = (isAdmin: boolean): MenuItem[] => {
  const allItems: MenuItem[] = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      title: 'Dashboard', // Add title that matches label
    },
    {
      id: 'users',
      icon: <Users className="h-5 w-5" />,
      label: 'Benutzerverwaltung',
      title: 'Benutzerverwaltung', // Add title that matches label
      admin: true,
    },
    {
      id: 'applications',
      icon: <FileText className="h-5 w-5" />,
      label: 'Bewerbungen',
      title: 'Bewerbungen', // Add title that matches label
    },
    {
      id: 'announcements',
      icon: <Bell className="h-5 w-5" />,
      label: 'Ankündigungen',
      title: 'Ankündigungen', // Add title that matches label
    },
    {
      id: 'news',
      icon: <Newspaper className="h-5 w-5" />,
      label: 'Neuigkeiten',
      title: 'Neuigkeiten', // Add title that matches label
    },
    {
      id: 'team-settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Team-Einstellungen',
      title: 'Team-Einstellungen', // Add title that matches label
      admin: true,
    },
    {
      id: 'team-absences',
      icon: <CalendarDays className="h-5 w-5" />,
      label: 'Team-Abwesenheiten',
      title: 'Team-Abwesenheiten', // Add title that matches label
    },
    {
      id: 'my-absences',
      icon: <UserMinus className="h-5 w-5" />,
      label: 'Meine Abwesenheiten',
      title: 'Meine Abwesenheiten', // Add title that matches label
    },
    {
      id: 'change-requests',
      icon: <UserCheck className="h-5 w-5" />,
      label: 'Änderungsanträge',
      title: 'Änderungsanträge', // Add title that matches label
      admin: true,
    },
    {
      id: 'delete-requests',
      icon: <FileQuestion className="h-5 w-5" />,
      label: 'Löschanträge',
      title: 'Löschanträge', // Add title that matches label
      admin: true,
    },
    {
      id: 'seasons',
      icon: <CalendarRange className="h-5 w-5" />,
      label: 'Bewerbungssaisons',
      title: 'Bewerbungssaisons', // Add title that matches label
      admin: true,
    },
    {
      id: 'subservers',
      icon: <Bus className="h-5 w-5" />,
      label: 'Subserver',
      title: 'Subserver', // Add title that matches label
      admin: true,
    },
    {
      id: 'partners',
      icon: <Handshake className="h-5 w-5" />,
      label: 'Partner',
      title: 'Partner', // Add title that matches label
      admin: true,
    },
  ];

  // Filter admin-only items if the user is not an admin
  return allItems.filter(item => !item.admin || isAdmin);
};

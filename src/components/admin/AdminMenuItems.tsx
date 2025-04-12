
import React from 'react';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  Newspaper,
  Settings,
  UserCheck,
  Server,
  RefreshCw,
  Trash2,
  Link as LinkIcon,
  MessageSquare,
  Calendar,
  PenLine
} from "lucide-react";

export interface MenuItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  moderatorOnly?: boolean;
}

export const getAdminMenuItems = (isAdmin: boolean, isModerator: boolean): MenuItem[] => {
  // Common items for both admins and moderators
  const commonItems: MenuItem[] = [
    {
      label: "Dashboard",
      value: "dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Bewerbungen",
      value: "applications",
      icon: <ScrollText className="h-5 w-5" />,
    },
  ];

  // Add admin-only items
  if (isAdmin) {
    return [
      ...commonItems,
      {
        label: "Benutzer",
        value: "users",
        icon: <Users className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "Bewerbungstexte",
        value: "application_texts",
        icon: <PenLine className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "News",
        value: "news",
        icon: <Newspaper className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "Partner",
        value: "partners",
        icon: <Users className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "Partnerschaftsanfragen",
        value: "partnerships",
        icon: <MessageSquare className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "Subserver",
        value: "sub_servers",
        icon: <Server className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "Discord-Link",
        value: "discord-link",
        icon: <LinkIcon className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "ID-Änderungsanträge",
        value: "change-requests",
        icon: <RefreshCw className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "Löschungsanträge",
        value: "deletion-requests",
        icon: <Trash2 className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "Teameinstellungen",
        value: "team-settings",
        icon: <Settings className="h-5 w-5" />,
        adminOnly: true
      },
      {
        label: "Team-Abmeldungen",
        value: "absences",
        icon: <Calendar className="h-5 w-5" />,
        adminOnly: true
      }
    ];
  }

  // Add moderator-specific items
  if (isModerator) {
    return [
      ...commonItems,
      {
        label: "Vom Meeting abmelden",
        value: "absence-form",
        icon: <Calendar className="h-5 w-5" />,
        moderatorOnly: true
      }
    ];
  }

  return commonItems;
};

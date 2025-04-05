
import { 
  LayoutDashboard, Users, FileText, Settings, BellRing, 
  Share, Server, UserCog, Link as LinkIcon, UserX 
} from 'lucide-react';

export const getAdminMenuItems = (isAdmin: boolean) => {
  if (isAdmin) {
    return [
      { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
      { title: "Benutzer", id: "users", icon: Users },
      { title: "Bewerbungen", id: "applications", icon: FileText },
      { title: "Neuigkeiten", id: "news", icon: BellRing },
      { title: "Partner", id: "partners", icon: Share },
      { title: "Unterserver", id: "sub_servers", icon: Server },
      { title: "Änderungsanträge", id: "change-requests", icon: UserCog },
      { title: "Discord-Link", id: "discord-link", icon: LinkIcon },
      { title: "Löschungsanträge", id: "deletion-requests", icon: UserX },
      { title: "Teameinstellungen", id: "team-settings", icon: Settings },
      { title: "Abmeldungen", id: "absences", icon: UserCog }
    ];
  } else {
    return [
      { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
      { title: "Bewerbungen", id: "applications", icon: FileText },
      { title: "Vom Meeting abmelden", id: "absence-form", icon: UserCog },
    ];
  }
};

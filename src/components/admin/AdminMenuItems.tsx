
import { 
  LayoutDashboard, Users, FileText, Settings, BellRing, 
  Share, Server, UserCog, Link as LinkIcon, UserX, HandshakeIcon 
} from 'lucide-react';

export const getAdminMenuItems = (isAdmin: boolean) => {
  if (isAdmin) {
    return [
      { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
      { title: "Benutzer", id: "users", icon: Users },
      { title: "Bewerbungen", id: "applications", icon: FileText },
      { title: "News / Ankündigungen", id: "news", icon: BellRing },
      { title: "Partnerschaften", id: "partnerships", icon: HandshakeIcon },
      { title: "Partner-Server", id: "partners", icon: Share },
      { title: "Sub-Server", id: "sub_servers", icon: Server },
      { title: "ID Änderungsanträge", id: "change-requests", icon: UserCog },
      { title: "Discord Link Manager", id: "discord-link", icon: LinkIcon },
      { title: "Löschungsanträge", id: "deletion-requests", icon: UserX },
      { title: "Team-Einstellungen", id: "team-settings", icon: Settings },
      { title: "Abmeldungen", id: "absences", icon: BellRing },
      { title: "Admin Panel (Extern)", id: "external-admin", icon: Server, externalUrl: "https://berlinrpvc-new-51.lovable.app/login" }
    ];
  } else {
    return [
      { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
      { title: "Bewerbungen", id: "applications", icon: FileText },
      { title: "Vom Meeting abmelden", id: "absence-form", icon: UserCog },
    ];
  }
};

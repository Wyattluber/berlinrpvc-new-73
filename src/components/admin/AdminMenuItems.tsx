
import { LayoutDashboard, FileText, UserCog } from 'lucide-react';

export const getAdminMenuItems = (isAdmin: boolean) => {
  if (isAdmin) {
    // Return just a single item that directly links to the external website
    return [
      { title: "Admin Dashboard", id: "external-admin", icon: LayoutDashboard, externalUrl: "https://berlinrpvc-new-51.lovable.app/login" }
    ];
  } else {
    return [
      { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
      { title: "Bewerbungen", id: "applications", icon: FileText },
      { title: "Vom Meeting abmelden", id: "absence-form", icon: UserCog },
    ];
  }
};

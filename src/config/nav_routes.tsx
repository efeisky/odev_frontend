import type { JSX } from "react";
import { FiPlus, FiList, FiUser, FiUserPlus, FiFileText } from "react-icons/fi";
import type { UserRoles } from "../api/auth";

interface NavItem {
  text: string;
  path: string;
  icon: JSX.Element;
  roles?: ("admin" | "project_manager" | "member")[]; 
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_ROUTES: NavSection[] = [
  {
    title: "Projeler",
    items: [
      { text: "Proje Ekle", path: "/addproject", icon: <FiPlus />, roles: ["admin"] },
      { text: "Projeler", path: "/projects", icon: <FiList />, roles: ["admin", "project_manager", "member"] },
    ],
  },
  {
    title: "Görevler",
    items: [
      { text: "Görev Ekle", path: "/addtask", icon: <FiPlus />, roles: ["admin", "project_manager", "member"] },
      { text: "Görevler", path: "/tasks", icon: <FiList />, roles: ["admin", "project_manager", "member"] },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { text: "Kişi Ekle", path: "/adduser", icon: <FiUserPlus />, roles: ["admin"] },
      { text: "Kullanıcılar", path: "/users", icon: <FiUser />, roles: ["admin"] },
    ],
  },
  {
    title: "Diğer",
    items: [
      { text: "Loglar", path: "/logs", icon: <FiFileText />, roles: ["admin", "project_manager", "member"] },
    ],
  },
];

export function getNavByRole(role: UserRoles) {
  return NAV_ROUTES.map(section => {
    const filteredItems = section.items.filter(item => item.roles?.includes(role));
    if (filteredItems.length > 0) {
      return { ...section, items: filteredItems };
    }
    return null;
  }).filter(Boolean) as NavSection[];
}

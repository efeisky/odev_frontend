
import NavItem from "./NavItem";
import type { ReactNode } from "react";

interface NavSection {
  title: string;
  items: {
    text: string;
    path: string;
    icon?: ReactNode;
  }[];
}

interface SidebarSectionProps {
  section: NavSection;
}

export default function SidebarSection({ section }: SidebarSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-gray-700 font-medium uppercase text-sm mb-1">
        {section.title}
      </div>
      {section.items.map((item, index) => (
        <NavItem
          key={index}
          text={item.text}
          href={item.path}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
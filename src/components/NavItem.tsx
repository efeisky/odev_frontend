import type { ReactNode } from "react";

interface NavItemProps {
  text: string;
  href: string;
  icon: ReactNode;
}

export default function NavItem({ text, href, icon }: NavItemProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-2 py-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"
    >
      {icon}
      {text}
    </a>
  );
}

[
    {
        title: 'Proje',
        items: [
            {text: '...', path: ''}
        ]
    }
]
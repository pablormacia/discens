"use client";

import Link from "next/link";
import { Home, Users, School } from "lucide-react";

type SidebarLink = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const iconMap = {
  Home,
  Users,
  School,
}

export function Sidebar({ links }: { links: SidebarLink[] }) {
  return (
    <aside className="bg-white w-full md:w-64 shadow-md px-4 py-6 space-y-4">
      <nav className="space-y-2">
        {links.map(({ label, href, icon }) => {
          const Icon = iconMap[icon]
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
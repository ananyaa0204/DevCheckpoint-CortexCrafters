import {
  LayoutDashboard,
  FolderGit2,
  ListTodo,
  BookmarkCheck,
  Share2,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// Sidebar navigation — design/DESIGN_SYSTEM.md §7
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderGit2 },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Checkpoints", href: "/checkpoints", icon: BookmarkCheck },
  { label: "Handoffs", href: "/handoffs", icon: Share2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

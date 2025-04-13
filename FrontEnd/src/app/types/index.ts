import type React from "react"
import type { LucideIcon } from "lucide-react"

export interface VideoCardProps {
  title: string
  channel: string
  views: string
  timeAgo: string
  duration: string
}

export interface CategoryCardProps {
  title: string
  count: string
  color: string
  icon: React.ReactNode
}
export interface NavItem {
    icon: LucideIcon;
    label: string;
    href: string;
}
export interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    href: string;
    active: boolean;
    collapsed: boolean;
}
  
export interface SidebarProps {
    className?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }
export interface VoxaHeaderProps {
    className?: string;
    logoUrl?: string;
    onToggleSidebar?: () => void;
    user?: UserProfile | null;
    notifications?: number;
    messages?: number;
    onSearch?: (query: string) => void;
  }
  
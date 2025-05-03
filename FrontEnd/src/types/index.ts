import type React from "react"
import type { LucideIcon } from "lucide-react"

export interface VideoCardProps {
  title: string
  channel: string
  views: string
  timeAgo: string
  duration: string
}

export interface Category {
  id: number
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
  

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    pfp_path?: string;
}
export interface VoxaHeaderProps {
  className?: string;
  notifications?: number;
  messages?: number;
  onSearch?: (query: string) => void;
}
export interface Video {
  id: string;
  title: string;
  category_name: string;
  description: string;
  manifest_URL: string;
  user: UserProfile;
  views: number;
  uploadTime: string;
  duration: string;
  thumbnail: string;
}

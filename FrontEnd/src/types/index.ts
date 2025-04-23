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
  user: string;
  views: number;
  uploadTime: string;
  duration: string;
  thumbnail: string;
  channelAvatar?: string;
}

export interface VideoUploadProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  className?: string;
}

export interface UploadDropzoneProps {
  isDragActive: boolean;
  error: string | null;
  onButtonClick: () => void;
  onDragEvents: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  allowedTypes: string[];
  maxSizeMB: number;
}
export interface UploadPreviewProps {
  file: File;
  uploading: boolean;
  onCancel: () => void;
}
export interface UploadStatusProps {
  status: 'idle' | 'uploading' | 'success' | 'error';
}
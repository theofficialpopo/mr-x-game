/**
 * Icon components using lucide-react for consistent iconography
 */
import {
  Users,
  Crown,
  Check,
  X,
  UserPlus,
  LogIn,
  Copy,
  RefreshCw,
  Loader2,
  Play,
  Search,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const Icons = {
  // User & Social
  users: Users,
  crown: Crown,
  userPlus: UserPlus,
  login: LogIn,

  // Actions
  check: Check,
  close: X,
  copy: Copy,
  refresh: RefreshCw,
  loading: Loader2,
  play: Play,
  search: Search,
  settings: Settings,

  // Status
  alert: AlertCircle,
  success: CheckCircle,
  info: Info,
  error: XCircle,

  // Navigation
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,

  // Map & Location
  mapPin: MapPin,
  navigation: Navigation,
  zap: Zap,
} as const;

export type IconName = keyof typeof Icons;
export type { LucideIcon };

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className, ...props }) => {
  const LucideIcon = Icons[name];
  return <LucideIcon size={size} className={className} {...props} />;
};

import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  BarChart3,
  Boxes,
  Circle,
  Cloud,
  CloudSun,
  Cloudy,
  Cpu,
  Cuboid,
  Database,
  HardDrive,
  LineChart,
  Network,
  PieChart,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import { isIconPath } from '../lib/resources/cloudIconsComplete';
import { resolveResourceIcon } from '../lib/resources/iconResolver';

interface CloudIconProps {
  icon?: string;
  size?: number;
  className?: string;
}

const lucideIconMap: Record<string, LucideIcon> = {
  cloud: Cloud,
  cloudy: Cloudy,
  'cloud-sun': CloudSun,
  cpu: Cpu,
  'hard-drive': HardDrive,
  database: Database,
  network: Network,
  shield: Shield,
  'chart-bar': BarChart3,
  'chart-line': LineChart,
  'chart-pie': PieChart,
  boxes: Boxes,
  cuboid: Cuboid,
  circle: Circle,
  'app-window': AppWindow,
  'layout-dashboard': LayoutDashboard,
};

const getLucideIcon = (token?: string): LucideIcon => {
  if (!token) {
    return Cloud;
  }

  const key = token.replace('lucide:', '');
  return lucideIconMap[key] || Cloud;
};

export default function CloudIcon({ icon, size = 24, className = '' }: CloudIconProps) {
  const [hasError, setHasError] = useState(false);

  // Resolve gcp: prefixed icons to actual paths
  const resolvedIcon = useMemo(() => {
    if (!icon) return 'lucide:cloud';
    if (icon.startsWith('gcp:')) {
      // Extract service name and resolve to GCP category icon path
      return resolveResourceIcon('', icon);
    }
    return icon;
  }, [icon]);
  
  const fullSize = Math.max(size, 12);

  if (!hasError && resolvedIcon && isIconPath(resolvedIcon)) {
    // For API paths, use proxy (frontend proxies /api to backend)
    // For full URLs, use as-is
    let iconUrl: string;
    if (resolvedIcon.startsWith('http')) {
      iconUrl = resolvedIcon;
    } else if (resolvedIcon.startsWith('/api/')) {
      // Use the Vite proxy - requests to /api/* are proxied to backend
      iconUrl = resolvedIcon;
    } else {
      iconUrl = resolvedIcon;
    }

    return (
      <img
        src={iconUrl}
        alt="Cloud resource icon"
        width={fullSize}
        height={fullSize}
        className={className}
        style={{
          objectFit: 'contain',
          display: 'inline-block',
        }}
        onError={() => setHasError(true)}
      />
    );
  }

  const IconComponent = getLucideIcon(resolvedIcon);

  return (
    <IconComponent
      size={fullSize}
      strokeWidth={1.75}
      className={className}
    />
  );
}

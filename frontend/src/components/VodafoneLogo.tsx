interface VodafoneLogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  width?: number;
  height?: number;
}

export default function VodafoneLogo({ 
  variant = 'full', 
  className = '',
  width,
  height 
}: VodafoneLogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        width={width || 32}
        height={height || 32}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="50" cy="50" r="45" fill="#E60000"/>
        <path
          d="M 50 5 A 45 45 0 0 1 95 50 A 20 20 0 0 1 75 70 A 20 20 0 0 1 50 50 Z"
          fill="white"
        />
      </svg>
    );
  }

  return (
    <svg
      width={width || 140}
      height={height || 40}
      viewBox="0 0 140 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Vodafone Circle Logo */}
      <g transform="translate(0, 5)">
        <circle cx="15" cy="15" r="14" fill="#E60000"/>
        <path
          d="M 15 1 A 14 14 0 0 1 29 15 A 6.5 6.5 0 0 1 22.5 21.5 A 6.5 6.5 0 0 1 15 15 Z"
          fill="white"
        />
      </g>
      
      {/* Vodafone Text */}
      <g transform="translate(38, 14)">
        <text
          x="0"
          y="18"
          fontFamily="Arial, sans-serif"
          fontSize="22"
          fontWeight="bold"
          fill="#E60000"
        >
          vodafone
        </text>
      </g>
    </svg>
  );
}

export function VodafoneIcon({ className = '', size = 32 }: { className?: string; size?: number }) {
  return <VodafoneLogo variant="icon" width={size} height={size} className={className} />;
}


import CloudIcon from './CloudIcon';

interface ResourceTileProps {
  icon?: string;
  label: string;
  description?: string;
  resourceType: string;
  configured?: boolean;
  iconSize?: number;
  className?: string;
}

export function ResourceTile({
  icon,
  label,
  description,
  resourceType,
  configured = false,
  iconSize = 28,
  className = '',
}: ResourceTileProps) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: iconSize + 4, height: iconSize + 4 }}
      >
        <CloudIcon icon={icon} size={iconSize} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
          <span className="truncate">{label}</span>
          {configured && (
            <span
              className="inline-block w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"
              title="Configured"
            />
          )}
        </p>

        {description && (
          <p className="mt-0.5 text-xs text-gray-500 truncate">{description}</p>
        )}

        <p className="mt-1 text-[11px] text-gray-400 font-mono truncate">
          {resourceType}
        </p>
      </div>
    </div>
  );
}

export default ResourceTile;

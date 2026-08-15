interface MaterialIconProps {
  name: string;
  filled?: boolean;
  size?: string;
  className?: string;
}

export default function MaterialIcon({
  name,
  filled = false,
  size,
  className = "",
}: MaterialIconProps) {
  const style: React.CSSProperties = {};
  if (filled) {
    style.fontVariationSettings = "'FILL' 1";
  }
  if (size) {
    style.fontSize = size;
  }

  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}

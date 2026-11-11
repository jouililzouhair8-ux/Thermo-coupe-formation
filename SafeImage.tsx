import { useState } from 'react';
import { Flame } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackIconSize?: number;
  rounded?: string;
  width?: number;
  height?: number;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  fallbackIconSize = 24,
  rounded = 'rounded-lg',
  width,
  height,
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);
  const style = width || height ? { width, height } : undefined;

  if (errored || !src) {
    return (
      <div
        style={style}
        className={`${fallbackClassName} ${rounded} bg-ink-900 flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <Flame style={{ width: fallbackIconSize, height: fallbackIconSize }} className="text-white" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${fallbackClassName}`}
      style={style}
      onError={() => setErrored(true)}
    />
  );
}

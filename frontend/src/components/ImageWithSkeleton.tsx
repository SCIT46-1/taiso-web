import { useState } from "react";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
}

// 스켈레톤 이미지와 실제 이미지를 처리하는 컴포넌트
function ImageWithSkeleton({ src, alt, className }: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm group">
      {!loaded && <div className="absolute inset-0 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={`object-cover w-full h-full transition-all duration-200 transform group-hover:scale-105  ${
          loaded ? "opacity-100" : "opacity-30"
        } ${className}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default ImageWithSkeleton;

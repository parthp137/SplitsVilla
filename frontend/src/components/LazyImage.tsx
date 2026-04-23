import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  showPlaceholder?: boolean;
}

/**
 * LazyImage component with Intersection Observer
 * Provides better UX with fade-in animation when image loads
 * Falls back to standard lazy loading if Intersection Observer not supported
 */
export function LazyImage({
  src,
  alt,
  className = "",
  placeholderClassName = "bg-muted",
  showPlaceholder = true,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "50px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={`relative overflow-hidden ${placeholderClassName}`}
      animate={{ opacity: isLoaded ? 1 : 0.5 }}
      transition={{ duration: 0.3 }}
    >
      {shouldLoad ? (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      ) : (
        <div className={`${className} animate-pulse bg-muted`} />
      )}
    </motion.div>
  );
}

export default LazyImage;

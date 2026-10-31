import { useEffect, useRef } from 'react';

export interface UseInfiniteScrollOptions {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook to trigger infinite scrolling when a sentinel element enters the viewport.
 */
export const useInfiniteScroll = ({
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '200px',
}: UseInfiniteScrollOptions) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore, threshold, rootMargin]);

  return targetRef;
};

export default useInfiniteScroll;


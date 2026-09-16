'use client';
import { useEffect, useState } from 'react';
/** Deterministic server value avoids hydration disagreement. */
export function useMedia(query: string, serverValue = false): boolean {
  const [matches, set] = useState(serverValue);
  useEffect(() => {
    const media = window.matchMedia(query); const update = () => set(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

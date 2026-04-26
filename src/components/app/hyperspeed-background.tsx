'use client';

/**
 * HyperspeedBackground — singleton WebGL canvas that persists across all page
 * navigations. Mounted once in the root layout so the GPU context is never
 * torn down and rebuilt when the user switches between /scan, /dashboard, etc.
 *
 * The overlay div (bg-black/60) is rendered here too so every page gets the
 * same dim effect without each page component having to manage it.
 */

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// hyperspeed + its presets are bundled together in a single async chunk.
// Neither import surfaces in the synchronous module graph of this file,
// so Webpack can defer them until the browser is idle.
const HyperspeedScene = dynamic(
  () => import('./hyperspeed-scene'),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-black z-0" />,
  }
);

// Pages that should NOT show the Hyperspeed effect
const EXCLUDED_PATHS = ['/', '/soc'];

export default function HyperspeedBackground() {
  const pathname = usePathname();

  if (EXCLUDED_PATHS.includes(pathname) || pathname.startsWith('/soc')) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <HyperspeedScene />
      {/* Dim overlay so page content is always legible */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

const supportsFullscreen = () =>
  typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function';

/**
 * Wraps a mini app or article view.
 * - Tries to enter fullscreen when the view opens. Browsers may block this without a tap, so if the
 *   first attempt is refused, the next tap enters fullscreen once.
 * - Leaving the view exits fullscreen.
 * - The user can always leave fullscreen with the button or Esc; nothing re-enters it automatically.
 */
export const FullscreenScope: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFs, setIsFs] = useState<boolean>(() => typeof document !== 'undefined' && !!document.fullscreenElement);

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (!supportsFullscreen()) return;

    let armedTap: (() => void) | null = null;
    const enter = () => document.documentElement.requestFullscreen().catch(() => {
      // Refused (no user gesture). Enter on the next tap instead, once.
      armedTap = () => {
        document.documentElement.requestFullscreen().catch(() => {});
      };
      window.addEventListener('pointerdown', armedTap, { once: true });
    });

    if (!document.fullscreenElement) enter();

    return () => {
      if (armedTap) window.removeEventListener('pointerdown', armedTap);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  return (
    <>
      {children}
      {supportsFullscreen() && (
        <button
          onClick={toggle}
          aria-label={isFs ? 'Keluar layar penuh' : 'Layar penuh'}
          title={isFs ? 'Keluar layar penuh' : 'Layar penuh'}
          className="fixed top-2 right-2 z-[9999] p-1.5 rounded-md bg-black/35 hover:bg-black/55 text-white backdrop-blur-sm shadow"
        >
          {isFs ? <Minimize size={15} /> : <Maximize size={15} />}
        </button>
      )}
    </>
  );
};

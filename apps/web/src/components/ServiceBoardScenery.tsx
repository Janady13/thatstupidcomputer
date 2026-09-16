import { lazy, Suspense, useEffect, useId, useState } from 'react';
import { BulletinBoard } from '../animation/office/objects/BulletinBoard';
import { DEFAULT_PALETTE } from '../animation/office/catalog';
import { instancePrefix } from '../animation/office/model';
import { AnimationBoundary } from '../animation/core/AnimationBoundary';

const DesktopCharacter = lazy(() => import('../animation/desktop/DesktopCharacter').then(module => ({ default: module.DesktopCharacter })));

/** The enlarged board owns the scenery; all reading and navigation remain HTML. */
export function ServiceBoardScenery({ paused }: { paused: boolean }) {
  const id = instancePrefix(useId());
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 901px)');
    const update = () => setDesktop(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const poster = <img src="/animation/desktop/computer.svg" width="1254" height="1254" alt="" />;
  return <div className="board-scenery" aria-hidden="true">
    <svg className="service-board-frame" focusable="false"><BulletinBoard idPrefix={id} palette={DEFAULT_PALETTE} reading /></svg>
    <div className="board-computer">
      {desktop ? <AnimationBoundary fallback={poster}><Suspense fallback={poster}><DesktopCharacter state="point-right" paused={paused} /></Suspense></AnimationBoundary> : poster}
      <p>I put the useful bits<br />on the board.</p>
    </div>
  </div>;
}

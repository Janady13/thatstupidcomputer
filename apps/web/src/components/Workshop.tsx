import { lazy, Suspense, useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAnimation } from '../animation/orchestration/AnimationProvider';
import { Character } from '../animation/rive/Character';
import type { CharacterSlug } from '../animation/mobile/types';
import type { CharacterState } from '../animation/office/types';
import { AnimationBoundary } from '../animation/core/AnimationBoundary';
import type { SceneAction } from '../measurement';
import { Icon } from './Icons';
import { ComputerConversation } from './ComputerConversation';
import { destinations, type Destination } from '../animation/office/navigation';
import { useWorkshopStory } from '../animation/choreography/useWorkshopStory';
import { useWorkshopAttention } from '../animation/choreography/useWorkshopAttention';
import type { ConversationIntent } from '../animation/conversation/director.mjs';
import { INTENTS } from '../animation/conversation/director.mjs';

const RoomScene = lazy(() => import('../animation/office/RoomScene').then(module => ({ default: module.RoomScene })));

/**
 * The room is the navigation. Each destination is a real link drawn as an invisible
 * hit shape over its object (room coordinates, 1648×928); the object itself lifts on
 * hover and the computer turns toward it. No labels float over the artwork — the
 * caption under the desk names whatever the visitor is pointing at.
 */
const GREETINGS: CharacterState[] = ['amused', 'wave', 'shrug', 'proud'];
const READING_BOARD = { 'bulletin-board': { visible: false } } as const;

export function Workshop({ path, paused, onInteraction, readingBoard = false }: { path: string; paused: boolean; onInteraction: (action: SceneAction) => void; readingBoard?: boolean }) {
  const { state, cue, send } = useAnimation();
  const navigate = useNavigate();
  const [narrow, setNarrow] = useState<boolean | null>(null);
  const [focus, setFocus] = useState<Destination | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const story = useWorkshopStory(stage, paused);
  const focusRef = useRef<Destination | null>(null);
  const conversing = useRef(false);
  const previewing = useRef(false);
  const attention = useWorkshopAttention(root, stage, path === '/' && narrow !== null, paused, busy || previewBusy || !!focus);
  const attentionActive = useRef(attention.active); attentionActive.current = attention.active;
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setNarrow(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const characters: Record<string, CharacterSlug> = { '/services/': 'app-bot', '/work/': 'handheld', '/process/': 'pager', '/about/': 'flip-phone' };
  const character = characters[path] ?? 'smartphone';
  const home = path === '/';
  const highlighted = story.active ? destinations.find(item => item.path === story.beat?.destination) ?? null : focus;

  // Hovering an object turns the computer toward it; leaving lets the gesture finish, then rest.
  const point = useCallback((item: Destination | null) => {
    focusRef.current = item;
    setFocus(item);
    if (item && !conversing.current) { attention.cancel(); send({ type: 'DESKTOP', state: item.reaction }); }
  }, [send, attention.cancel]);
  const completed = useCallback((finished: CharacterState) => {
    if (conversing.current || previewing.current || attentionActive.current || finished === 'idle') return;
    const next = focusRef.current?.reaction;
    send({ type: 'DESKTOP', state: next && next !== finished ? next : 'idle' });
  }, [send]);
  const preview = (intent: ConversationIntent | null) => {
    const wasPreviewing = previewing.current;
    previewing.current = !!intent;
    setPreviewBusy(!!intent);
    if (conversing.current) return;
    if (!intent) {
      if (wasPreviewing) { send({ type: 'PERFORM', action: 'Idle' }); send({ type: 'DESKTOP', state: 'idle' }); }
      return;
    }
    attention.cancel();
    send({ type: 'PERFORM', action: intent === 'search' ? 'Searching' : INTENTS[intent].mobile });
    send({ type: 'DESKTOP', state: intent === 'search' ? 'searching' : INTENTS[intent].desktop });
  };
  const converse = useCallback((active: boolean) => { conversing.current = active; setBusy(active); }, []);

  const open = (event: MouseEvent<Element>, item: Destination) => {
    cue('service.focused'); onInteraction(item.action);
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(item.path);
  };

  return <div ref={root} className="workshop" data-testid="workshop" data-scene={narrow ? 'mobile-workshop' : 'desktop-office'} data-focus={highlighted?.highlight ?? ''} data-story={story.selection?.story ?? 'none'} data-attention={home ? attention.chapter.id : undefined} data-attention-scroll={home ? attention.pinned ? 'pinned' : 'flow' : undefined}>
    <div ref={stage} className="workshop-stage">
    <div className="room-art" aria-hidden="true">
      <AnimationBoundary fallback={<img className="initial-room-poster" src="/animation/office/office-with-computer.svg" alt="" width="1648" height="928" />}>
      {narrow === null ? <picture><source media="(max-width: 767px)" srcSet="/animation/mobile/smartphone/poster.svg" /><img className="initial-room-poster" src="/animation/office/office-with-computer.svg" alt="" width="1648" height="928" /></picture> : narrow && !readingBoard ? <div className="pocket-workshop"><div className="pocket-window"><span /><span /><span /></div><div className="pocket-note">BIG IDEAS.<br />SMALL SCREEN.</div><div className="pocket-ground" /><Character renderer="auto" character={character} action={state.action} paused={paused || (story.active && story.holding)} replay={state.replay} attitudeEnabled={state.attitude} /></div> : <Suspense fallback={<img className="initial-room-poster" src="/animation/office/office-with-computer.svg" alt="" width="1648" height="928" />}><RoomScene objects={readingBoard ? READING_BOARD : undefined} character={readingBoard ? false : { state: state.desktop, intensity: home ? 1.3 : 1 }} paused={paused || (story.active && story.holding)} drawerOpen={highlighted?.object === 'drawer' ? 1 : 0} replay={state.replay} attitudeEnabled={state.attitude} onCharacterComplete={completed} pointerTarget={stage} /></Suspense>}
      </AnimationBoundary>
    </div>
    {home && <div className="room-overlay">
      {narrow !== true && <svg className="room-hotspots" viewBox="0 0 1648 928" preserveAspectRatio="xMidYMid meet" role="navigation" aria-label="Explore the workshop">
        {destinations.map(item => <a key={item.path} href={item.path} className={`room-hotspot room-hotspot-${item.object}`} aria-label={item.label}
          onPointerEnter={() => point(item)} onPointerLeave={() => point(null)} onFocus={() => point(item)} onBlur={() => point(null)}
          onClick={event => open(event, item)}><path d={item.shape} /></a>)}
        {/* The computer itself: a tap gets a reaction, never a page change. Keyboard users have the caption. */}
        <path className="room-hotspot-computer" aria-hidden="true" d="M 732 112 H 956 V 456 H 732 Z"
          onPointerEnter={() => { if (!conversing.current && !focusRef.current) { attention.cancel(); send({ type: 'DESKTOP', state: 'alert' }); } }}
          onClick={() => { attention.cancel(); if (!conversing.current) send({ type: 'DESKTOP', state: GREETINGS[Math.floor(Math.random() * GREETINGS.length)]! }); onInteraction('character'); }} />
      </svg>}
      {narrow !== false && <nav className="room-navigation" aria-label="Explore the workshop">
        {destinations.map(item => <Link key={item.path} className={`room-link room-link-${item.object}`} to={item.path} onClick={() => { cue('service.focused'); onInteraction(item.action); }}>
          <span className="room-link-dot"><Icon name={item.icon} /></span><span className="room-link-label">{item.label}<span aria-hidden="true"> ↗</span></span>
        </Link>)}
      </nav>}
    </div>}
    {home && <ComputerConversation pointing={focus} story={story} attention={attention} onPreview={preview} onInteraction={() => onInteraction('character')} onConversing={converse} />}
    </div>
  </div>;
}

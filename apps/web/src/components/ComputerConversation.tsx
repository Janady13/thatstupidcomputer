import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router';
import { useAnimation } from '../animation/orchestration/AnimationProvider';
import { createConversation, INTENTS, ROASTS, transitionConversation, type ConversationEvent, type ConversationIntent } from '../animation/conversation/director.mjs';
import { demoIntentHref as demoHref } from './demo-intent.mjs';
import { analytics } from '../measurement';
import type { ComputerStage } from '../measurement/analytics.mjs';
import type { Destination } from '../animation/office/navigation';
import type { WorkshopStoryControls } from '../animation/choreography/useWorkshopStory';
import { WORKSHOP_STORIES } from '../animation/performances/workshop';
import { ATTENTION_CHAPTERS } from '../animation/performances/attention';
import type { useWorkshopAttention } from '../animation/choreography/useWorkshopAttention';
import { Icon } from './Icons';
import '../styles/computer-conversation.css';

const KEYS = {
  design: { detail: 'Make a proper entrance.', hint: 'A blank page. My favourite kind of trouble.' },
  rescue: { detail: 'Give it a second life.', hint: 'I have seen things. Your website is probably fixable.' },
  search: { detail: 'Less hide. More seek.', hint: 'The internet is big. Let’s leave a better trail.' },
} as const;

function KeyDrawing({ intent }: { intent: ConversationIntent }) {
  return <svg className="computer-key-drawing" viewBox="0 0 56 46" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {intent === 'design' ? <><path d="M5 9h39v29H5zM5 16h39M10 12h1m3 0h1m3 0h1M11 22h13v10H11zM29 23h9m-9 5h7" /><path className="key-detail" d="m43 2 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></> : intent === 'rescue' ? <><path d="M6 7h36v29H6zM6 14h36M11 10h1m4 0h1M12 25h6l3-7 5 14 3-7h7" /><path className="key-detail" d="m37 33 5-5 9 9-5 5zM40 37l5-5" /></> : <><circle cx="25" cy="20" r="14" /><path d="M11 20h28M25 6c-9 8-9 20 0 28m0-28c9 8 9 20 0 28M15 12h20M15 28h20" /><path className="key-detail" d="m36 31 11 11M40 32l9 9-3 3-9-9" /></>}
  </svg>;
}

/** A caption and a physical control deck, not a disclosure panel over the artwork. */
export function ComputerConversation({ pointing, story, attention, onPreview, onInteraction, onConversing }: { pointing: Destination | null; story: WorkshopStoryControls; attention: ReturnType<typeof useWorkshopAttention>; onPreview: (intent: ConversationIntent | null) => void; onInteraction: () => void; onConversing?: (active: boolean) => void }) {
  const { send } = useAnimation();
  const [conversation, setConversation] = useState(createConversation);
  const [announcement, setAnnouncement] = useState('');
  const [preview, setPreview] = useState<ConversationIntent | null>(null);
  const primary = useRef<HTMLAnchorElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  const storyNext = useRef<HTMLButtonElement>(null);
  const voice = useRef<HTMLDivElement>(null);
  const revealManualBeat = useRef(false);
  const focusNext = useRef<'primary' | 'first' | null>(null);
  const latestSend = useRef(send); latestSend.current = send;
  const view = conversation.view;
  const choice = conversation.intent ? INTENTS[conversation.intent] : null;
  const talking = story.active || view === 'recommendation' || view === 'roast';

  useEffect(() => { onConversing?.(talking); }, [talking, onConversing]);
  useEffect(() => { if (story.active) storyNext.current?.focus({ preventScroll: true }); }, [story.active]);
  useEffect(() => {
    if (!revealManualBeat.current || !story.active) return;
    revealManualBeat.current = false;
    // Only an explicit story command reveals its caption. Automatic beats never move the page.
    voice.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [story.active, story.selection?.index, story.selection?.run]);
  useEffect(() => {
    if (focusNext.current === 'primary') primary.current?.focus();
    if (focusNext.current === 'first') first.current?.focus();
    focusNext.current = null;
  }, [conversation]);
  useEffect(() => () => { latestSend.current({ type: 'ATTITUDE', enabled: false }); }, []);

  function act(event: ConversationEvent, metric?: ComputerStage, focus?: 'primary' | 'first') {
    attention.cancel(); setPreview(null); onPreview(null);
    const next = transitionConversation(conversation, event);
    setConversation(next);
    setAnnouncement(next.announcement);
    focusNext.current = focus || null;
    // The visitor owns pause and motion preferences; a choice only changes the pose.
    send({ type: 'ATTITUDE', enabled: next.attitude });
    send({ type: 'PERFORM', action: next.mobile });
    send({ type: 'DESKTOP', state: next.desktop });
    if (metric) analytics.computerInteraction(metric, next.intent || undefined);
    onInteraction();
  }
  function chooseIntent(event: MouseEvent<HTMLAnchorElement>, intent: ConversationIntent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    act({ type: 'INTENT', intent }, 'intent_selected', 'primary');
  }
  function startDemo(source: 'computer' | 'hero') {
    analytics.computerInteraction('demo_clicked', conversation.intent || undefined);
    analytics.demoStart(source);
    send({ type: 'DESKTOP', state: 'demo-invite' });
    send({ type: 'PERFORM', action: 'PointRight' });
  }
  function endStory() {
    story.stop();
    act({ type: 'BACK' }, undefined, 'first');
  }
  function previewKey(intent: ConversationIntent | null) {
    if (talking) return;
    setPreview(intent); onPreview(intent);
  }
  function beginStory(name: 'tour' | 'rescue') {
    attention.cancel(); setPreview(null); onPreview(null); revealManualBeat.current = true; story.start(name); onInteraction();
  }
  function moveStory(direction: 'previous' | 'next') {
    revealManualBeat.current = true; story[direction]();
  }

  const line = story.beat ? story.beat.line : pointing && !talking
    ? <><span className="computer-pointing">{pointing.label}<span aria-hidden="true"> ↗</span></span>{pointing.tip}</>
    : view === 'recommendation' && choice ? choice.line
    : view === 'roast' ? ROASTS[Math.max(0, conversation.roastIndex)]
    : preview ? KEYS[preview].hint : attention.chapter.line;
  const lineKey = story.selection ? `${story.selection.story}-${story.selection.index}` : pointing && !talking ? `point-${pointing.object}` : `${view}-${conversation.intent}-${conversation.roastIndex}-${preview}-${attention.chapter.id}`;

  return <div ref={voice} className="computer-voice" data-testid="computer-conversation" data-conversation={view} data-computer-mood={conversation.desktop} data-attitude={conversation.attitude ? 'allowed' : 'off'}>
    {!talking && <div className="computer-reel"><span><i aria-hidden="true" />{attention.chapter.label}</span><div className="computer-scroll-progress" aria-label={`Workshop scene ${attention.index + 1} of ${ATTENTION_CHAPTERS.length}`}><span>Scroll for his thoughts</span>{ATTENTION_CHAPTERS.map((chapter, index) => <i key={chapter.id} data-current={index === attention.index ? 'true' : undefined} aria-hidden="true" />)}<span aria-hidden="true">↓</span></div></div>}
    {story.active && <div className="computer-story-heading"><span>{story.beat?.title}</span><span>{(story.selection?.index ?? 0) + 1} / {story.story?.beats.length}</span></div>}
    <p key={lineKey} className={`computer-line ${view === 'roast' ? 'computer-line-roast' : ''}`} aria-live={story.active ? 'polite' : 'off'} aria-atomic="true">{line}</p>
    <div className="computer-console">
    <div className="computer-console-label" aria-hidden="true"><span>YOUR WEBSITE. YOUR MOVE.</span><span>PERSONALITY INCLUDED ↵</span></div>
    {story.active ? <div className="computer-story-controls" role="group" aria-label="Workshop story controls">
      <button type="button" onClick={() => moveStory('previous')} disabled={story.selection?.index === 0}>Previous</button>
      {!story.reduced && <button type="button" onClick={story.toggle} aria-pressed={story.holding}>{story.holding ? 'Continue story' : 'Hold that thought'}</button>}
      <button ref={storyNext} type="button" onClick={story.final ? endStory : () => moveStory('next')}>{story.final ? 'Your turn' : 'Next'}</button>
      {story.beat?.destination && <Link to={story.beat.destination} className="computer-story-destination" onClick={onInteraction}>{story.beat.destination === '/contact/' ? 'Get my demo' : story.selection?.story === 'rescue' ? 'Tell us about your site' : 'Take a look'}<Icon name="arrow" /></Link>}
      <button type="button" onClick={endStory}>End story</button>
    </div> : <div className="computer-choices">
      {(view === 'closed' || view === 'choose') && <>
        {(Object.keys(INTENTS) as ConversationIntent[]).map((intent, index) => <Link key={intent} ref={index === 0 ? first : undefined} className={`computer-intent computer-key computer-key-${intent}`} to={demoHref(intent)} aria-label={INTENTS[intent].label} onPointerEnter={event => { if (event.pointerType !== 'touch') previewKey(intent); }} onPointerLeave={event => { if (document.activeElement !== event.currentTarget) previewKey(null); }} onFocus={() => previewKey(intent)} onBlur={() => previewKey(null)} onClick={event => chooseIntent(event, intent)}>
          <span className="computer-key-number" aria-hidden="true">0{index + 1}</span><KeyDrawing intent={intent} /><span className="computer-key-copy"><strong>{INTENTS[intent].label}</strong><span>{KEYS[intent].detail}</span></span><span className="computer-key-arrow" aria-hidden="true">↗</span>
        </Link>)}
      </>}
      {view === 'recommendation' && choice && <>
        <Link ref={primary} className="button button-rust computer-demo" to={demoHref(conversation.intent || 'design')} onClick={() => startDemo('computer')}>Show me what you would build<Icon name="arrow" /></Link>
        <button type="button" className="computer-roast-link" onClick={() => act({ type: 'ROAST' }, 'attitude_requested', 'primary')}>Give me attitude</button>
        <button type="button" className="computer-back" onClick={() => act({ type: 'BACK' }, 'back', 'first')}><span aria-hidden="true">← </span>Start again</button>
      </>}
      {view === 'roast' && <>
        <button type="button" className="computer-roast-link" onClick={() => act({ type: 'ROAST' }, 'attitude_requested')}>Another roast</button>
        {!conversation.attitude
          ? <button type="button" className="computer-roast-link" onClick={() => act({ type: 'GESTURE' }, 'gesture_requested')}>Show the censored gesture</button>
          : <><button type="button" className="computer-roast-link" onClick={() => act({ type: 'GESTURE', double: true }, 'gesture_requested')}>Double the attitude</button><button type="button" className="computer-roast-link" onClick={() => act({ type: 'POLITE' })}>Put the hands down</button></>}
        <Link ref={primary} className="button button-rust computer-demo" to={demoHref(conversation.intent || 'rescue')} onClick={() => startDemo('computer')}>Get my demo<Icon name="arrow" /></Link>
        <button type="button" className="computer-back" onClick={() => act({ type: 'BACK' }, 'back', 'first')}><span aria-hidden="true">← </span>Start again</button>
      </>}
    </div>}
    {!story.active && (view === 'closed' || view === 'choose') && <div className="computer-story-options" aria-label="Explore with the computer">
      <button type="button" onClick={() => beginStory('tour')}><Icon name="play" />{WORKSHOP_STORIES.tour.label}</button>
      <button type="button" onClick={() => beginStory('rescue')}><Icon name="spark" />{WORKSHOP_STORIES.rescue.label}</button>
      <button type="button" className="computer-roast-link" onClick={() => act({ type: 'ROAST' }, 'attitude_requested', 'primary')}>Roast my website</button>
      <Link className="computer-return" to="/contact/" onClick={() => startDemo('hero')}>Get my demo<span aria-hidden="true">↵</span></Link>
    </div>}
    </div>
    <span className="computer-announcement" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  </div>;
}

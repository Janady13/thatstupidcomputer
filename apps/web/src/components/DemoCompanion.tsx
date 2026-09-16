import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimationBoundary } from '../animation/core/AnimationBoundary';
import { useAnimation } from '../animation/orchestration/AnimationProvider';
import type { DesktopState } from '../animation/core/contracts.mjs';
import type { DemoIntent } from './demo-intent.mjs';
import '../styles/demo-companion.css';

const DesktopCharacter = lazy(() => import('../animation/desktop/DesktopCharacter').then(module => ({ default: module.DesktopCharacter })));
const states: Record<'idle' | 'pending' | 'accepted' | 'error', DesktopState> = { idle: 'demo-invite', pending: 'thinking', accepted: 'demo-success', error: 'confused' };
export function DemoCompanion({ status, intent }: { status: keyof typeof states; intent: DemoIntent | null }) {
  const { state } = useAnimation();
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => { setEnhanced(true); }, []);
  const poster = <img src="/animation/desktop/computer.svg" width="1254" height="1254" alt="" />;
  const line = status === 'pending' ? 'I’m keeping an eye on your request.' : status === 'accepted' ? 'A good first step. Even I’m impressed.' : status === 'error' ? 'Your details are still here. Let’s check what happened below.' : intent ? `We’re talking about ${intent.label}. Tell the human a little more.` : 'Tell me about your business. The human handles the clever part.';
  return <aside className="demo-companion" aria-label="A note from the computer">
    <div className="demo-companion-art" aria-hidden="true"><AnimationBoundary fallback={poster}>{enhanced ? <Suspense fallback={poster}><DesktopCharacter state={states[status]} paused={state.paused} /></Suspense> : poster}</AnimationBoundary></div>
    <div><p className="demo-companion-name">The computer made the introduction.</p><p>{line}</p>{intent && status === 'idle' && <p className="demo-companion-context">Your project choice is selected below. Change it any time.</p>}</div>
  </aside>;
}

import { useId, useRef, useState, useSyncExternalStore } from 'react';
import { analytics } from './analytics.mjs';
import './consent.css';

export function ConsentControls({ className = '' }: { className?: string }) {
  const consent = useSyncExternalStore(analytics.subscribe, analytics.getConsent, () => 'unset');
  const status = useSyncExternalStore(analytics.subscribe, analytics.getStatus, () => 'unconfigured');
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const settings = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const controlsId = useId();
  const show = expanded || (!dismissed && consent === 'unset' && status !== 'unconfigured');

  function close() {
    setExpanded(false);
    setDismissed(true);
    // An automatic first-visit prompt must not scroll the visitor to the footer.
    if (expanded) settings.current?.focus({ preventScroll: true });
    else document.getElementById('main-content')?.focus({ preventScroll: true });
  }

  function choose(choice: 'granted' | 'denied') {
    analytics.setConsent(choice);
    close();
  }

  return <div className={`consent-controls ${className}`} onKeyDown={event => {
    if (event.key === 'Escape' && show) { event.preventDefault(); event.stopPropagation(); close(); }
  }}>
    <button ref={settings} className="consent-settings" type="button" aria-expanded={show} aria-controls={controlsId} onClick={() => show ? close() : setExpanded(true)}>
      Privacy preferences
    </button>
    <section className={`consent-panel${consent === 'unset' ? ' consent-panel--initial' : ''}`} id={controlsId} aria-labelledby={headingId} hidden={!show}>
      <h2 id={headingId}>Your privacy choices</h2>
      <p>May we use optional analytics cookies to understand how this site is used? Your form answers are excluded. Every feature works if you decline.</p>
      <details className="consent-details"><summary>How analytics works</summary>
        <p>With your permission, Google Analytics measures page visits, studio interactions, accepted inquiries and page speed. We remember your choice for up to six months. Change it anytime in Privacy preferences. <a href="/privacy/">Read our privacy policy</a>.</p>
      </details>
      {status === 'unconfigured' ? <p role="status">Optional analytics is currently inactive.</p> : <>
        <p className="consent-status" role="status">{consent === 'granted' ? 'Analytics allowed.' : consent === 'denied' ? 'Analytics declined.' : 'Optional analytics is off until you choose to allow it.'}</p>
        <div className="consent-actions">
          <button type="button" onClick={() => choose('denied')}>{consent === 'granted' ? 'Withdraw analytics consent' : 'Decline analytics'}</button>
          <button type="button" onClick={() => choose('granted')}>Allow analytics</button>
        </div>
      </>}
      {expanded && <button className="consent-close" type="button" onClick={close}>Close preferences</button>}
    </section>
  </div>;
}

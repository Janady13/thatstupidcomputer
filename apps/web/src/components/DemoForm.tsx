import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useAnimation } from '../animation/orchestration/AnimationProvider';
import { analytics } from '../measurement';
import { Icon } from './Icons';
import { applyDemoIntent, parseDemoIntent, type DemoIntent } from './demo-intent.mjs';
import { DemoCompanion } from './DemoCompanion';
import { INQUIRY_FORM_ID, type ProjectIntent } from '../../../../packages/site/inquiry.mjs';

type ProjectType = ProjectIntent;
type Fields = { name: string; email: string; business: string; website: string; projectType: ProjectType; message: string; consent: boolean; companyWebsite: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;
const initial: Fields = { name: '', email: '', business: '', website: '', projectType: 'unsure', message: '', consent: false, companyWebsite: '' };

function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (fields.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = 'Please enter a valid email address.';
  if (fields.business.trim().length < 2) errors.business = 'What is your business called?';
  if (fields.website.trim()) {
    try { const url = new URL(fields.website.trim()); if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.')) throw new Error(); }
    catch { errors.website = 'Enter a full website address, such as https://example.com, or leave this blank.'; }
  }
  if (fields.message.trim().length < 10) errors.message = 'Tell us a little more (at least 10 characters).';
  if (!fields.consent) errors.consent = 'Please agree so we can respond to your request.';
  return errors;
}

export function DemoForm({ submissionId: suppliedId = '', email, intentSearch = '' }: { submissionId?: string; email?: string; intentSearch?: string }) {
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'pending' | 'accepted' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [enhanced, setEnhanced] = useState(false);
  const [submissionId, setSubmissionId] = useState(suppliedId);
  const [intent, setIntent] = useState<DemoIntent | null>(null);
  const edited = useRef(false);
  const intentApplied = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const activeRequest = useRef<AbortController | null>(null);
  const { cue } = useAnimation();
  useEffect(() => { setEnhanced(true); if (!suppliedId) setSubmissionId(globalThis.crypto?.randomUUID?.() ?? ''); return () => activeRequest.current?.abort(); }, [suppliedId]);
  useEffect(() => {
    // Initial HTML and hydration always agree. The character's finite choice is
    // applied once after hydration, only while the whole form remains untouched.
    if (intentApplied.current || edited.current) return;
    const next = parseDemoIntent(intentSearch);
    if (!next) return;
    intentApplied.current = true;
    setFields(previous => applyDemoIntent(previous, next, edited.current));
    setIntent(next);
  }, [intentSearch]);
  useEffect(() => { if (status === 'accepted' || (status === 'error' && Object.keys(errors).length === 0)) feedback.current?.focus(); }, [status, errors]);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    edited.current = true;
    if (key === 'projectType') setIntent(null);
    setFields(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: undefined }));
    if (status === 'error') { setStatus('idle'); setMessage(''); }
  }

  function focusError(next: FieldErrors) {
    const key = Object.keys(next)[0];
    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[name="${key}"]`)?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const nextErrors = validate(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus('error'); setMessage('A couple of details need your attention.'); focusError(nextErrors);
      analytics.demoSubmitError('validation'); return;
    }
    pending.current = true; setStatus('pending'); setMessage('Sending your request…'); cue('inquiry.pending');
    const controller = new AbortController(); activeRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('/api/demo', {
        method: 'POST', credentials: 'same-origin', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...fields, name: fields.name.trim(), email: fields.email.trim(), business: fields.business.trim(), website: fields.website.trim(), message: fields.message.trim(), submissionId }),
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok === true && result.status === 'accepted' && typeof result.requestId === 'string') {
        setStatus('accepted'); setMessage('Your demo request has been accepted.'); cue('inquiry.accepted'); analytics.generateLead('smtp_accepted', result.requestId);
      } else {
        const safeErrors: FieldErrors = {};
        for (const key of Object.keys(initial) as (keyof Fields)[]) if (typeof result?.fieldErrors?.[key] === 'string') safeErrors[key] = result.fieldErrors[key];
        setErrors(safeErrors); setStatus('error'); cue('inquiry.failed');
        const fallback = response.status === 429 ? 'Too many requests arrived at once. Please wait a few minutes and try again.' : response.status === 503 ? 'The message service is temporarily unavailable. Your request has not been confirmed. Please try again shortly.' : 'Your request could not be confirmed. Please try again.';
        setMessage(typeof result?.message === 'string' ? result.message : fallback);
        analytics.demoSubmitError(response.status === 429 ? 'rate_limited' : response.status === 503 ? 'unavailable' : Object.keys(safeErrors).length ? 'validation' : 'server');
        if (Object.keys(safeErrors).length) focusError(safeErrors);
      }
    } catch {
      setStatus('error'); setMessage('The connection was interrupted before we could confirm your request. It may still have been sent. Your details are still here; please avoid sending it again immediately.'); cue('inquiry.failed'); analytics.demoSubmitError('network');
    } finally { window.clearTimeout(timeout); activeRequest.current = null; pending.current = false; }
  }

  const field = (name: keyof Fields) => ({ id: `demo-${name}`, name, 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `demo-${name}-error` : undefined });
  const error = (name: keyof Fields) => errors[name] ? <span className="field-error" id={`demo-${name}-error`}>{errors[name]}</span> : null;

  if (status === 'accepted') return <div className="form-accepted" ref={feedback} tabIndex={-1} role="status">
    <DemoCompanion status="accepted" intent={intent} />
    <span className="accepted-mark"><Icon name="check" width="36" height="36" /></span>
    <p className="eyebrow">A very good first step</p><h2>Message accepted.<br />Computer delighted.</h2>
    <p>Thanks for the introduction. Your demo request has been accepted for sending, and we’ll use the details you shared to follow up by email.</p>
    <p className="small-note">No need to send it twice. Go enjoy being good at your business.</p>
    <Link className="button button-dark" to="/">Back to the workshop <Icon name="arrow" /></Link>
  </div>;

  return <form id={INQUIRY_FORM_ID} className="demo-form" action="/api/demo" method="post" onSubmit={submit} noValidate={enhanced} ref={form} aria-label="Request your website demo" aria-busy={status === 'pending'}>
    <DemoCompanion status={status} intent={intent} />
    <input type="hidden" name="submissionId" value={submissionId} />
    <div className="form-trap" aria-hidden="true"><label htmlFor="company-website">Company website<input id="company-website" name="companyWebsite" tabIndex={-1} autoComplete="off" value={fields.companyWebsite} onChange={event => update('companyWebsite', event.target.value)} /></label></div>
    <p className="form-key">All fields required unless marked optional.</p>
    <div className="form-grid">
      <label className="form-field" htmlFor="demo-name"><span>Your name</span><input {...field('name')} autoComplete="name" required minLength={2} maxLength={100} value={fields.name} onChange={event => update('name', event.target.value)} placeholder="The human behind the business" />{error('name')}</label>
      <label className="form-field" htmlFor="demo-email"><span>Email address</span><input {...field('email')} type="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={event => update('email', event.target.value)} placeholder="you@yourbusiness.com" />{error('email')}</label>
      <label className="form-field" htmlFor="demo-business"><span>Business name</span><input {...field('business')} autoComplete="organization" required minLength={2} maxLength={160} value={fields.business} onChange={event => update('business', event.target.value)} placeholder="What should we call your business?" />{error('business')}</label>
      <label className="form-field" htmlFor="demo-website"><span>Current website <em>optional</em></span><input {...field('website')} type="url" autoComplete="url" maxLength={300} value={fields.website} onChange={event => update('website', event.target.value)} placeholder="https://yourbusiness.com" />{error('website')}</label>
    </div>
    <label className="form-field" htmlFor="demo-projectType"><span>What can we help with?</span><select {...field('projectType')} value={fields.projectType} onChange={event => update('projectType', event.target.value as ProjectType)} required><option value="unsure">Help me figure that out</option><option value="design">A new website</option><option value="rescue">Rescue my current website</option><option value="search">Help customers find me</option><option value="care">Keep my website working</option></select>{error('projectType')}</label>
    <label className="form-field" htmlFor="demo-message"><span>What would a better website do for you?</span><textarea {...field('message')} rows={4} required minLength={10} maxLength={4000} value={fields.message} onChange={event => update('message', event.target.value)} placeholder="More inquiries? A clearer story? An end to saying ‘please ignore our website’? Tell us a little about it." />{error('message')}</label>
    <div className="consent-field"><label htmlFor="demo-consent"><input {...field('consent')} type="checkbox" value="true" required checked={fields.consent} onChange={event => update('consent', event.target.checked)} /><span>I agree to the use of these details to respond to my request. <Link to="/privacy/" target="_blank" rel="noopener">Privacy details<span className="sr-only"> (opens in a new tab)</span></Link>.</span></label>{error('consent')}</div>
    <div ref={feedback} tabIndex={-1} className={`form-feedback ${status === 'error' ? 'is-error' : ''}`} aria-live="polite" role={status === 'error' ? 'alert' : 'status'}>{message}</div>
    <button type="submit" className="button button-rust form-submit" disabled={status === 'pending'}>{status === 'pending' ? 'Sending your request…' : 'Get my demo'}<Icon name={status === 'pending' ? 'clock' : 'arrow'} /></button>
    <p className="form-reassurance">A conversation about your business. No obligation to commission a project.</p>
    {email && <p className="form-alternative">Prefer email? <a href={`mailto:${email}`}>{email}</a></p>}
  </form>;
}

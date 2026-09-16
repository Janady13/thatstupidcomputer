import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getPage, type ContentSection, type SitePage } from '../../../../packages/site/content';
import { AnimationBoundary } from '../animation/core/AnimationBoundary';
import { Icon } from './Icons';

const CharacterPlayground = lazy(() => import('./CharacterPlayground'));

export function ContentSections({ sections, type }: { sections: ContentSection[]; type?: string }) {
  return <div className={`content-sections content-sections-${type ?? 'default'}`}>
    {sections.map((section, index) => <section className="content-section" key={section.heading} id={section.id} aria-labelledby={section.id ? `${section.id}-heading` : undefined}>
      {type === 'services' && index < 4 && <span className="service-number" aria-hidden="true">0{index + 1}</span>}
      <h2 id={section.id ? `${section.id}-heading` : undefined}>{section.heading}</h2>
      {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      {section.items && <ul className="editorial-list">{section.items.map(item => <li key={item}><Icon name="check" /><span>{item}</span></li>)}</ul>}
      {section.links?.map(link => <Link className="text-link" key={link.href} to={link.href}>{link.label}<Icon name="arrow" /></Link>)}
      {section.sources?.map(source => <p className="content-source" key={source.href}><a className="text-link" href={source.href} rel="external">{source.label}<Icon name="arrow" /></a></p>)}
      {section.id && <a className="answer-permalink text-link" href={`#${section.id}`} aria-label={`Link to this answer: ${section.heading}`}>Link to this answer<Icon name="arrow" /></a>}
    </section>)}
  </div>;
}

export function RelatedPages({ page }: { page: SitePage }) {
  const related = page.relatedPaths.map(path => getPage(path)).filter(page => page !== undefined);
  return <nav className="related-pages" aria-label="Continue exploring"><p className="eyebrow">While you’re here</p><div>{related.map(item => <Link key={item.path} to={item.path}>{item.navLabel}<Icon name="arrow" /></Link>)}</div></nav>;
}

export function LiveWorkSample() {
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);
  const castPoster = <section className="content-section"><h2>Meet the characters.</h2><p>Five different personalities, and a little room to be themselves.</p><img src="/animation/mobile/smartphone/poster.svg" width="180" height="230" alt="An illustrated smartphone character" loading="lazy" /></section>;
  return <><figure className="work-sample"><div className="work-sample-bar"><span /><span /><span /><span className="work-sample-address">thatstupidcomputer.com</span></div><div className="work-sample-art"><img src="/animation/office/office-with-computer.svg" width="1648" height="928" alt="The illustrated workshop used in this website" loading="lazy" /><div><span className="eyebrow">Our own little corner</span><strong>Good work.<br />Questionable company.</strong></div></div><figcaption><span>This website · Interactive website design</span><Link to="/">Step inside <Icon name="arrow" /></Link></figcaption></figure>{enhanced ? <AnimationBoundary fallback={castPoster}><Suspense fallback={castPoster}><CharacterPlayground /></Suspense></AnimationBoundary> : castPoster}</>;
}

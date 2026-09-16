/**
 * Office environment motion. No framework dependency and no rendering loop in React.
 * React owns placement wrappers; this controller only writes nested data-motion groups.
 * A single rAF may also advance the existing computer via onFrame.
 */
const DEFAULTS = Object.freeze({ breeze: true, steam: true, clock: true, lighting: true, dust: true, instruments: true });
const limit = (n, a, b) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
const number = n => (Math.abs(n) < .00005 ? 0 : n).toFixed(3);
const turn = (angle, pivot) => `rotate(${number(angle)} ${pivot[0]} ${pivot[1]})`;
const travel = (x, y) => `translate(${number(x)} ${number(y)})`;

export class RoomMotion {
  constructor(svg, options = {}) {
    if (!svg || svg.localName !== 'svg') throw new TypeError('RoomMotion requires the mounted root SVG.');
    this.svg = svg;
    this.options = options;
    this.effects = { ...DEFAULTS, ...options.effects };
    this.paused = !!options.paused;
    this.destroyed = false;
    this.visible = true;
    this.fps = limit(options.fps ?? 30, 15, 60);
    this.externalClock = !!options.externalClock;
    this.time = 0;
    this.drawerTarget = limit(options.drawerOpen ?? 0, 0, 1);
    this.drawer = this.drawerTarget;
    this.frames = 0;
    this.raf = 0;
    this.last = null;
    this.nodes = [];
    this.originals = new WeakMap();
    this.cache = new WeakMap();
    this.query = matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced = this.query.matches;
    this._media = () => {
      this.reduced = this.query.matches;
      if (this.reduced) this.render(0, true);
      this.sync();
    };
    this._visibility = () => this.sync();
    this._frame = now => {
      this.raf = 0;
      if (!this.allowed()) return;
      if (this.last === null) this.last = now;
      const delta = (now - this.last) / 1000;
      if (delta >= 1 / this.fps - .0005) {
        this.last = now;
        this.advance(Math.min(delta, .08));
      }
      if (this.allowed() && !this.raf) this.raf = requestAnimationFrame(this._frame);
    };
    this.query.addEventListener('change', this._media);
    document.addEventListener('visibilitychange', this._visibility);
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        this.visible = entries[0]?.isIntersecting ?? false;
        this.sync();
      }, { threshold: .001 });
      this.observer.observe(svg);
    }
    this.refresh();
    this.sync();
  }

  /** Re-index after React adds/removes objects. Existing originals never drift. */
  refresh() {
    if (this.destroyed) return;
    this.nodes = Array.from(this.svg.querySelectorAll('[data-motion]'))
      .filter(node => !node.closest('[data-object][display="none"]'))
      .map(node => {
        let base = this.originals.get(node);
        if (!base) {
          base = { transform: node.getAttribute('transform'), opacity: node.getAttribute('opacity') };
          this.originals.set(node, base);
        }
        const coords = (node.dataset.pivot || '0,0').split(',').map(Number);
        return { node, base, kind: node.dataset.motion, phase: Number(node.dataset.phase) || 0,
          pivot: coords.length === 2 && coords.every(Number.isFinite) ? coords : [0, 0] };
      });
    this.steamGroups = Array.from(this.svg.querySelectorAll('[data-effect="steam"]'));
    this.render(this.time, this.reduced);
  }

  set(node, key, value) {
    let values = this.cache.get(node);
    if (!values) { values = new Map(); this.cache.set(node, values); }
    const next = value === null ? null : String(value);
    if (values.get(key) === next && values.has(key)) return;
    if (next === null) node.removeAttribute(key); else node.setAttribute(key, next);
    values.set(key, next);
  }

  allowed() {
    return !this.destroyed && !this.paused && !this.reduced && !this.externalClock && this.visible && !document.hidden;
  }
  sync() {
    if (this.allowed()) {
      if (!this.raf) { this.last = null; this.raf = requestAnimationFrame(this._frame); }
    } else {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.last = null;
    }
    this.options.onPlaybackChange?.({ paused: this.paused, reduced: this.reduced, visible: this.visible, running: this.allowed() });
  }
  pause() { this.paused = true; this.sync(); }
  resume() { this.paused = false; this.sync(); }
  setEffects(effects) {
    this.effects = { ...this.effects, ...effects };
    this.render(this.time, this.reduced);
  }
  setDrawerOpen(value) {
    this.drawerTarget = limit(Number(value), 0, 1);
    if (this.reduced || this.paused) this.drawer = this.drawerTarget;
    this.render(this.time, this.reduced);
  }
  setExternalClock(value) { this.externalClock = !!value; this.sync(); }
  /** Used by an external host or deterministic capture; seconds, not milliseconds. */
  advance(seconds) {
    if (this.destroyed || this.paused || this.reduced || !this.visible || document.hidden) return;
    if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError("Delta must be finite and nonnegative");
    const delta = limit(Number(seconds), 0, .1);
    this.time += delta;
    this.frames++;
    this.drawer += (this.drawerTarget - this.drawer) * (1 - Math.exp(-delta * 7));
    this.render(this.time, false);
    this.options.onFrame?.(delta);
  }
  render(time, staticPose = false) {
    const e = this.effects;
    for (const node of this.steamGroups || []) this.set(node, 'display', e.steam ? null : 'none');
    for (const { node, kind, phase, pivot, base } of this.nodes) {
      let transform = base.transform;
      let opacity = base.opacity;
      const t = staticPose ? 0 : time;
      const breeze = e.breeze && !staticPose;
      switch (kind) {
        case 'leaf':
          if (breeze) transform = turn(Math.sin(t * .9 + phase) * 2.2 + Math.sin(t * .33 + phase) * .5, pivot);
          break;
        case 'tree':
          if (breeze) transform = turn(Math.sin(t * .45 + phase) * .6, pivot);
          break;
        case 'blind':
          if (breeze) transform = turn(Math.sin(t * .55 + phase) * .3, pivot);
          break;
        case 'cord':
          if (breeze) transform = turn(Math.sin(t * .7 + phase) * 1.3, pivot);
          break;
        case 'cloud':
          if (breeze) transform = travel(Math.sin(t * .13 + phase) * 8, 0);
          break;
        case 'paper':
          if (breeze) transform = turn(Math.sin(t * .8 + phase) * .8, pivot);
          break;
        case 'desk-paper':
          if (breeze) transform = turn(Math.sin(t * .72 + phase) * .35, pivot);
          break;
        case 'cable-coil':
          if (breeze) transform = turn(Math.sin(t * .58 + phase) * .45, pivot);
          break;
        case 'lamp-head':
          if (breeze) transform = turn(Math.sin(t * .45 + phase) * .7, pivot);
          break;
        case 'lamp-light':
          opacity = e.lighting ? (staticPose ? '1' : number(.88 + .1 * Math.sin(t * .65))) : '0';
          break;
        case 'steam': {
          if (staticPose) { opacity = e.steam ? '.48' : '0'; break; }
          if (!e.steam) { opacity = '0'; break; }
          const life = (t * .25 + phase) % 1;
          transform = travel(Math.sin(t * 1.05 + phase * 4) * 4.5, -life * 23);
          opacity = number(.85 * Math.sin(Math.PI * life));
          break;
        }
        case 'clock-second':
          transform = turn(180 + (e.clock && !staticPose ? Math.floor(t) * 6 : 0), [0, 0]);
          break;
        case 'clock-minute':
          transform = turn(62 + (e.clock && !staticPose ? t * .1 : 0), [0, 0]);
          break;
        case 'clock-hour':
          transform = turn(304 + (e.clock && !staticPose ? t / 120 : 0), [0, 0]);
          break;
        case 'meter-needle':
          if (e.instruments && !staticPose) transform = turn(Math.sin(t * .63 + phase) * 7 + Math.sin(t * 1.7) * 1.8, pivot);
          break;
        case 'led':
          if (e.instruments && !staticPose) opacity = number(.68 + .22 * Math.sin(t * 1.5));
          break;
        case 'dust':
          if (!e.dust) { opacity = '0'; break; }
          if (staticPose) { opacity = '.5'; break; }
          transform = travel(Math.sin(t * .6 + phase * 5) * 7, -Math.sin(t * .35 + phase * 7) * 9);
          opacity = number(.4 + .4 * (1 + Math.sin(t * .48 + phase * 9)) / 2);
          break;
        case 'drawer-bottom':
          transform = travel(-3 * this.drawer, 20 * this.drawer);
          break;
        case 'drawer-top':
        case 'cabinet-drawer':
          break;
      }
      this.set(node, 'transform', transform);
      this.set(node, 'opacity', opacity);
    }
  }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    this.query.removeEventListener('change', this._media);
    document.removeEventListener('visibilitychange', this._visibility);
    for (const { node, base } of this.nodes) {
      if (base.transform === null) node.removeAttribute('transform'); else node.setAttribute('transform', base.transform);
      if (base.opacity === null) node.removeAttribute('opacity'); else node.setAttribute('opacity', base.opacity);
    }
    for (const node of this.steamGroups || []) node.removeAttribute('display');
    this.nodes = [];
    this.cache = new WeakMap();
    this.raf = 0;
  }
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mark, prefersReduced } from './fx.jsx';

const KEY = 'luna-intro-seen';
const BRAND = 'Luna';
const HEADLINE = 'Introduction';
const AUTO_MS = 4300;
const WORD_READY_MS = 2300;

const params = () => {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
};

const forced = () => params().has('intro');

const seen = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

function Dust() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let last = performance.now();
    let motes = [];

    const seed = () => {
      const count = Math.round(Math.min(38, Math.max(22, width / 40)));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.4,
        vy: 5 + Math.random() * 13,
        vx: -3.5 + Math.random() * 7,
        phase: Math.random() * Math.PI * 2,
        tw: 0.35 + Math.random() * 0.9,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      seed();
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const mote of motes) {
        mote.x += mote.vx * dt;
        mote.y -= mote.vy * dt;
        if (mote.y < -6) {
          mote.y = height + 6;
          mote.x = Math.random() * width;
        }
        if (mote.x < -6) mote.x = width + 6;
        else if (mote.x > width + 6) mote.x = -6;
        const alpha = 0.1 + 0.22 * (0.5 + 0.5 * Math.sin(t * mote.tw + mote.phase));
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 233, 240, ${alpha.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (!prefersReduced()) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="intro-dust" aria-hidden="true" />;
}

export default function Intro() {
  const [hidden, setHidden] = useState(() => !forced() && (prefersReduced() || seen()));
  const [leaving, setLeaving] = useState(false);
  const [quick, setQuick] = useState(false);
  const [early, setEarly] = useState(false);
  const [dock, setDock] = useState(null);
  const [wordDock, setWordDock] = useState(null);
  const markRef = useRef(null);
  const timers = useRef([]);
  const done = useRef(false);
  const started = useRef(0);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];

    const flip = (fromEl, toEl) => {
      if (!fromEl || !toEl) return null;
      const from = fromEl.getBoundingClientRect();
      const to = toEl.getBoundingClientRect();
      const fromW = parseFloat(getComputedStyle(fromEl).width) || 0;
      const toW = parseFloat(getComputedStyle(toEl).width) || 0;
      if (fromW <= 0 || toW <= 0) return null;
      return {
        x: to.left + to.width / 2 - (from.left + from.width / 2),
        y: to.top + to.height / 2 - (from.top + from.height / 2),
        s: toW / fromW,
      };
    };

    const elapsed = Date.now() - started.current;
    if (elapsed < 2300) setEarly(true);
    const markTrip = flip(
      markRef.current?.querySelector('svg'),
      document.querySelector('[data-nav-mark] svg'),
    );
    const wordTrip =
      elapsed >= WORD_READY_MS
        ? flip(
            document.querySelector('.intro-word-inner'),
            document.querySelector('[data-nav-mark] span'),
          )
        : null;

    if (markTrip) setDock(markTrip);
    if (wordTrip) setWordDock(wordTrip);
    setQuick(!markTrip);
    setLeaving(true);
    document.documentElement.classList.add('intro-out');
    if (!markTrip) document.documentElement.classList.add('intro-fast');

    timers.current.push(
      window.setTimeout(
        () => {
          document.documentElement.classList.remove(
            'intro-lock',
            'intro-run',
            'intro-out',
            'intro-fast',
          );
          document.documentElement.classList.add('intro-done');
          try {
            sessionStorage.setItem(KEY, '1');
          } catch {
            /* storage bisa diblokir; intro tetap ditutup */
          }
          setHidden(true);
        },
        markTrip ? 1900 : 700,
      ),
    );
  }, []);

  useEffect(() => {
    if (hidden) return undefined;
    started.current = Date.now();
    document.documentElement.classList.add('intro-lock', 'intro-run');
    window.scrollTo(0, 0);
    if (!params().has('hold')) timers.current.push(window.setTimeout(finish, AUTO_MS));
    const onKey = (event) => {
      if (event.key === 'Escape') finish();
    };
    const onWheel = (event) => {
      if (event.deltaY > 12) finish();
    };
    let touchStart = null;
    const onTouchStart = (event) => {
      touchStart = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event) => {
      if (touchStart == null) return;
      const lift = touchStart - (event.touches[0]?.clientY ?? touchStart);
      if (lift > 24) finish();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      timers.current.forEach((timer) => window.clearTimeout(timer));
      document.documentElement.classList.remove('intro-lock', 'intro-run', 'intro-out', 'intro-fast');
    };
  }, [hidden, finish]);

  if (hidden) return null;

  return (
    <div
      className={`intro${leaving ? ' is-leaving' : ''}${quick ? ' is-quick' : ''}${early ? ' is-early' : ''}${dock ? ' is-docking' : ''}${wordDock ? ' is-word-dock' : ''}`}
      role="dialog"
      aria-label="Pembuka Luna"
    >
      <span className="intro-bg" aria-hidden="true" />
      <Dust />
      <div className="intro-copy">
        <h1 className="intro-title" aria-label="Introduction">
          <span className="intro-title-line" aria-hidden="true">
            {HEADLINE.split('').map((ch, i) => (
              <span className="intro-letter" key={i} style={{ '--i': i }}>
                {ch}
              </span>
            ))}
          </span>
          <span className="intro-title-sheen" aria-hidden="true">
            {HEADLINE}
          </span>
        </h1>
      </div>
      <div className="intro-lockup" aria-hidden="true">
        <div className="intro-mark-stage">
          <span className="intro-deco">
            <i className="intro-glow" />
          </span>
          <div
            className="intro-fly"
            style={
              dock
                ? { transform: `translate3d(${dock.x}px, ${dock.y}px, 0) scale(${dock.s})` }
                : undefined
            }
          >
            <span className="intro-mark" ref={markRef}>
              <Mark size={112} />
            </span>
          </div>
        </div>
        <p
          className="intro-word"
          style={
            wordDock
              ? {
                  transform: `translate3d(${wordDock.x}px, ${wordDock.y}px, 0) scale(${wordDock.s})`,
                }
              : undefined
          }
        >
          <span className="intro-word-mask">
            <span className="intro-word-inner">{BRAND}</span>
          </span>
        </p>
        <i className="intro-line" />
      </div>
    </div>
  );
}

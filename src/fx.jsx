import { useEffect, useRef, useState } from 'react';

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced() || !('IntersectionObserver' in window)) {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen];
}

const CRESCENT = 'M 152.05 44.59 A 88 88 0 1 0 152.05 211.41 A 84 84 0 0 1 152.05 44.59 Z';
const BARS = [
  [170, 112, 144],
  [194, 94, 162],
  [218, 107, 149],
];

export function Mark({ size = 32, muted = false, bare = false, title, className = '' }) {
  const full = bare ? size >= 26 : size >= 44;
  const color = bare ? 'currentColor' : muted ? '#c8d0da' : '#eef2f6';
  const art = bare
    ? full
      ? undefined
      : 'translate(34 0)'
    : full
      ? 'translate(5.5 12.8) scale(0.9)'
      : 'translate(42.4 12.8) scale(0.9)';

  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {bare ? null : <rect width="256" height="256" rx="58" fill={muted ? '#171e27' : '#10161d'} />}
      <g transform={art} fill={color}>
        <path d={CRESCENT} stroke={color} strokeWidth={full ? 6 : 8} strokeLinejoin="round" />
        {full
          ? BARS.map(([x, y1, y2]) => (
              <path
                key={x}
                d={`M ${x} ${y1} V ${y2}`}
                stroke={color}
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
              />
            ))
          : null}
      </g>
    </svg>
  );
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, style, ...rest }) {
  const [ref, seen] = useInView();
  return (
    <Tag
      ref={ref}
      {...rest}
      data-in={seen ? '' : undefined}
      className={`reveal ${className}`.trim()}
      style={{ '--d': `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

export function Threads({ className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 4;
    let raf = 0;
    let last = performance.now();
    const mouse = { x: 0.5, y: 0.5 };

    const paint = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const lines = 24;
      for (let i = 0; i < lines; i += 1) {
        const p = i / (lines - 1);
        const mid = 1 - Math.abs(p - 0.5) * 2;
        ctx.beginPath();
        for (let x = -24; x <= width + 24; x += 12) {
          const y =
            height * 0.53 +
            Math.sin(x * 0.007 + time * 0.5 + p * 4.6) * (height * 0.1 + mid * 36) +
            Math.sin(x * 0.016 - time * 0.32 + p * 2.4) * 14 +
            (mouse.y - 0.5) * 28 * Math.sin((x / Math.max(width, 1)) * Math.PI);
          if (x <= -24) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const tint = i % 3 === 0 ? '174,191,255' : '150,170,205';
        ctx.strokeStyle = `rgba(${tint},${(0.03 + mid * 0.08).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      paint();
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt * 0.55;
      paint();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (event) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = event.clientY / window.innerHeight;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    if (!prefersReduced()) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} className={`threads ${className}`.trim()} aria-hidden="true" />;
}

export function Tilt({ className = '', max = 5, children }) {
  const ref = useRef(null);

  const move = (event) => {
    const el = ref.current;
    if (!el || prefersReduced() || event.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100 + 50).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100 + 50).toFixed(1)}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={ref}
      className={`tilt ${className}`.trim()}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      {children}
    </div>
  );
}

export function Spot({ as: Tag = 'article', className = '', children, ...rest }) {
  const ref = useRef(null);

  const move = (event) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--sx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--sy', `${event.clientY - rect.top}px`);
  };

  return (
    <Tag ref={ref} {...rest} onPointerMove={move} className={`spot ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export function Magnet({ className = '', strength = 6, children }) {
  const ref = useRef(null);

  const move = (event) => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    el.style.transform = `translate(${(dx * strength).toFixed(2)}px, ${(dy * strength).toFixed(2)}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <span
      ref={ref}
      className={`magnet ${className}`.trim()}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      {children}
    </span>
  );
}

export function Rotating({ items = [], interval = 2800, className = '' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReduced() || items.length < 2) return undefined;
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % items.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [items.length, interval]);

  return (
    <span className={`rotate ${className}`.trim()}>
      <span className="rotate-stack" aria-hidden="true">
        {items.map((item, i) => (
          <span key={item} className={i === index ? 'rotate-on' : ''}>
            {item}
          </span>
        ))}
      </span>
      <span className="sr-only">{items[index]}</span>
    </span>
  );
}

const SCRAMBLE = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/';

export function Decrypt({ text, className = '' }) {
  const [ref, seen] = useInView(0.5);
  const [out, setOut] = useState(text);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!seen) return undefined;
    setLive(true);
    if (prefersReduced()) {
      setOut(text);
      return undefined;
    }
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / 2);
      if (revealed >= text.length) {
        setOut(text);
        window.clearInterval(id);
        return;
      }
      setOut(
        text
          .split('')
          .map((char, i) => {
            if (i < revealed || char === ' ') return char;
            return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
          })
          .join(''),
      );
    }, 34);
    return () => window.clearInterval(id);
  }, [seen, text]);

  return (
    <span ref={ref} className={`decrypt ${live ? 'is-live' : ''} ${className}`.trim()}>
      {out}
    </span>
  );
}

export function Wave({ bars = 18, active = false, className = '' }) {
  return (
    <span className={`wave ${active ? 'is-on' : ''} ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <i
          key={i}
          style={{
            '--h': (0.34 + ((i * 7) % 10) / 13).toFixed(2),
            '--t': `${((i * 3) % 9) * 0.09}s`,
          }}
        />
      ))}
    </span>
  );
}

export function Marquee({ items = [] }) {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="mq-track">
        {items.map((item) => (
          <span className="mq-item" key={item}>
            {item}
            <i className="mq-dot" />
          </span>
        ))}
        {items.map((item) => (
          <span className="mq-item" key={`dup-${item}`}>
            {item}
            <i className="mq-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

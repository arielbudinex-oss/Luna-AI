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

const DIALOGUE =
  'M56 40H80Q88 40 88 48V152Q88 168 104 168H144L184 208H88Q48 208 48 168V48Q48 40 56 40ZM120 40H168Q208 40 208 80V120L168 160V88Q168 80 160 80H120Q112 80 112 72V48Q112 40 120 40Z';
const SQUIRCLE =
  'M256 128L255.8 141.2L255.1 151.5L253.9 160.8L252.4 169.5L250.3 177.7L247.8 185.5L244.9 192.9L241.5 199.8L237.8 206.4L233.5 212.6L228.9 218.5L223.9 223.9L218.5 228.9L212.6 233.5L206.4 237.8L199.8 241.5L192.9 244.9L185.5 247.8L177.7 250.3L169.5 252.4L160.8 253.9L151.5 255.1L141.2 255.8L128 256L114.8 255.8L104.5 255.1L95.2 253.9L86.5 252.4L78.3 250.3L70.5 247.8L63.1 244.9L56.2 241.5L49.6 237.8L43.4 233.5L37.5 228.9L32.1 223.9L27.1 218.5L22.5 212.6L18.2 206.4L14.5 199.8L11.1 192.9L8.2 185.5L5.7 177.7L3.6 169.5L2.1 160.8L0.9 151.5L0.2 141.2L0 128L0.2 114.8L0.9 104.5L2.1 95.2L3.6 86.5L5.7 78.3L8.2 70.5L11.1 63.1L14.5 56.2L18.2 49.6L22.5 43.4L27.1 37.5L32.1 32.1L37.5 27.1L43.4 22.5L49.6 18.2L56.2 14.5L63.1 11.1L70.5 8.2L78.3 5.7L86.5 3.6L95.2 2.1L104.5 0.9L114.8 0.2L128 0L141.2 0.2L151.5 0.9L160.8 2.1L169.5 3.6L177.7 5.7L185.5 8.2L192.9 11.1L199.8 14.5L206.4 18.2L212.6 22.5L218.5 27.1L223.9 32.1L228.9 37.5L233.5 43.4L237.8 49.6L241.5 56.2L244.9 63.1L247.8 70.5L250.3 78.3L252.4 86.5L253.9 95.2L255.1 104.5L255.8 114.8Z';

export function Mark({ size = 32, muted = false, bare = false, title, className = '' }) {
  const small = size < 40;
  const color = bare ? 'currentColor' : muted ? '#c8d0da' : '#eef2f6';
  const art = !bare && small ? 'translate(-16 -12) scale(1.125)' : undefined;

  return (
    <svg
      viewBox={bare ? '32 24 192 192' : '0 0 256 256'}
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {bare ? null : <path d={SQUIRCLE} fill={muted ? '#171e27' : '#10161d'} />}
      <path transform={art} fill={color} d={DIALOGUE} />
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

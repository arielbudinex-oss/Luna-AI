const PATHS = {
  voice: (
    <>
      <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
    </>
  ),
  spark: (
    <>
      <circle cx="12" cy="12" r="4.6" />
      <path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m7 10 2.5 2L7 14M12.5 15H17" />
    </>
  ),
  bookmark: (
    <>
      <path d="M6.5 4h11a.5.5 0 0 1 .5.5V20l-6-3.6L6 20V4.5a.5.5 0 0 1 .5-.5Z" />
      <path d="M9.5 8.5h5" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.8" width="10" height="18.4" rx="2.8" />
      <path d="M10.4 6h3.2M11 18.2h2" />
    </>
  ),
  screen: (
    <>
      <rect x="3.5" y="4.5" width="17" height="10.5" rx="2" />
      <path d="M9 19h6M12 15v4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10.5" rx="2.5" />
      <path d="M8.2 10V7a3.8 3.8 0 0 1 7.6 0v3" />
    </>
  ),
  chat: (
    <>
      <path d="M20 15a3 3 0 0 1-3 3H9l-4 3V7a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v8Z" />
      <path d="M9 9.5h6M9 12.5h3.5" />
    </>
  ),
  arrow: <path d="M4.5 12h15M13 5.5l6.5 6.5L13 18.5" />,
  download: <path d="M12 4v10.5M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  send: <path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" />,
  reset: <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" />,
  check: <path d="m5 12.5 4.6 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
    </>
  ),
  moon: <path d="M20 14.4A8.2 8.2 0 0 1 9.6 4a8.2 8.2 0 1 0 10.4 10.4Z" />,
};

export function Icon({ name, size = 18, strokeWidth = 1.7, className = '' }) {
  const shape = PATHS[name];
  if (!shape) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {shape}
    </svg>
  );
}

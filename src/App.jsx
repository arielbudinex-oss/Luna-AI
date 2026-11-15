import { useEffect, useRef, useState } from 'react';
import {
  Decrypt,
  Magnet,
  Mark,
  Marquee,
  prefersReduced,
  Reveal,
  Rotating,
  Spot,
  Tilt,
  Wave,
} from './fx.jsx';
import { Icon } from './icons.jsx';
import { PcMock, PhoneMock } from './mockups.jsx';
import { DEMO_CHIPS, replyTo } from './demoBrain.js';
import { SITE } from './site.js';

const NAV = [
  ['#fitur', 'Fitur'],
  ['#cara-kerja', 'Cara kerja'],
  ['#di-hp', 'Di HP'],
  ['#karakter', 'Karakter'],
  ['#tanya-jawab', 'Tanya jawab'],
];

const TICKER = ['membuka aplikasi', 'memutar lagu', 'mengatur pengingat', 'mengingat obrolan'];

const MARQUEE = [
  'GROQ',
  'WHISPER',
  'SUARA',
  'VRM 3D',
  'RUST',
  'WEBSOCKET',
  'WINDOWS',
  'ANDROID',
  'INGATAN',
  'JADWAL',
  'PAIRING',
  'LAN',
];

const DEMO_START = [
  {
    id: 0,
    who: 'luna',
    text: 'Halo, aku Luna. Coba ketik perintah seperti di aplikasi. Ini simulasi di browser, jadi tidak ada yang berjalan di PC-mu.',
  },
  { id: -1, who: 'kamu', text: 'Luna, putar lagu lo-fi.' },
  {
    id: -2,
    who: 'luna',
    text: 'Spotify terbuka. Playlist lo-fi diputar, volume 30%.',
    tag: 'musik diputar',
    kind: 'done',
  },
];

const ACT_ICON = { done: 'check', confirm: 'lock', wait: 'calendar', info: 'spark' };

const CHARACTERS = [
  {
    id: 'tsukuyomi',
    name: 'Tsukuyomi',
    vibe: 'tenang · anggun',
    credit: '3D Character by Rei Yumesaki（夢前黎明）',
    creditUrl: 'https://tyc.rei-yumesaki.net/material/avatar/3d-a/',
    src: '/characters/tsukuyomi.webp',
    thumb: '/characters/tsukuyomi-thumb.webp',
    q: 'Temani aku kerja sebentar.',
    a: 'Siap. Notifikasi kusenyapkan dan playlist fokus kupasang. Istirahat tiap 45 menit, ya.',
    tag: 'mode fokus',
  },
  {
    id: 'vita',
    name: 'Vita',
    vibe: 'tegas · misterius',
    credit: 'Vita (ヴィータ) · VRoid Project',
    creditUrl:
      'https://hub.vroid.com/license?allowed_to_use_user=everyone&characterization_allowed_user=everyone&corporate_commercial_use=allow&credit=unnecessary&modification=allow&personal_commercial_use=profit&redistribution=allow&sexual_expression=allow&version=1&violent_expression=allow',
    src: '/characters/vita.webp',
    thumb: '/characters/vita-thumb.webp',
    q: 'Cari file proposal terbaru.',
    a: 'Ketemu tiga. Paling baru proposal-v4.docx, kemarin 21.14. Langsung kubuka?',
    tag: '3 hasil',
  },
];

const CAPABILITIES = [
  ['Aplikasi & musik', 'buka Spotify, putar playlist, atur volume'],
  ['File & dokumen', 'cari file, ringkas dokumen, buat catatan'],
  ['Jadwal & pengingat', 'bangunin besok jam 7, ingatkan tiap Senin, tunda 10 menit'],
  ['Layar & jendela', 'ambil screenshot, pindahkan jendela, matikan layar'],
  ['Jaringan & sistem', 'cek jaringan, buka pengaturan router, kunci PC'],
  ['HP sebagai remot', 'pasangkan lewat token, lihat layar PC, kirim perintah'],
];

const PROVIDERS = [
  ['Groq', 'bawaan · ada paket gratis', true],
  ['OpenAI', 'GPT lewat kunci API sendiri'],
  ['OpenRouter', 'satu kunci untuk banyak model'],
  ['DeepSeek', 'murah untuk obrolan panjang'],
  ['Together, Mistral, dll', 'selama formatnya kompatibel OpenAI'],
  ['Server lokal', 'LM Studio atau llama.cpp di jaringanmu'],
];

const FAQS = [
  {
    q: 'Apakah Luna butuh internet?',
    a: 'Untuk menyusun jawaban, ya. Teks perintah dikirim ke penyedia AI yang kamu pilih, bawaannya Groq. Audio diproses lokal dengan Whisper, suara Luna dibuat lokal dengan F5, dan kendali PC tetap berjalan di mesinmu.',
  },
  {
    q: 'Harus pakai Groq?',
    a: 'Tidak. Groq jadi bawaan karena ada paket gratisnya. Luna bisa memakai API apa pun yang kompatibel dengan format OpenAI, misalnya OpenAI, OpenRouter, DeepSeek, Together, atau server lokal seperti LM Studio. Cukup isi alamat API, nama model, dan kuncinya di Pengaturan.',
  },
  {
    q: 'Apakah mikrofon selalu menyala?',
    a: 'Aplikasi mendengarkan kata panggilan saat mode dengarkan aktif. Setelah namanya dipanggil, baru percakapan diproses. Mode ini bisa dimatikan dari aplikasi.',
  },
  {
    q: 'Di mana data saya disimpan?',
    a: 'Ingatan, jurnal, dan pengaturan tersimpan sebagai file di PC. Kunci API juga tinggal di mesinmu dan hanya dipakai untuk menghubungi penyedia AI pilihanmu.',
  },
  {
    q: 'Bisakah HP dipakai tanpa PC?',
    a: 'Tidak. Aplikasi Android adalah pendamping yang terhubung ke Luna di PC lewat jaringan lokal. PC harus menyala.',
  },
  {
    q: 'Karakter di layar bisa diganti?',
    a: 'Bisa. Stage mendukung model VRM lain. Karakter di situs ini punya lisensi masing-masing, dan berkas model aslinya tidak dibagikan di sini.',
  },
  {
    q: 'Apakah Luna bisa mengendalikan semua hal?',
    a: 'Tidak. Tindakan berisiko seperti mematikan PC atau menjalankan perintah admin meminta konfirmasi. Membuka kunci HP dan mengunggah file tanpa izin tidak termasuk.',
  },
  {
    q: 'Apakah demo di situs ini menjalankan Luna?',
    a: 'Tidak. Demo berjalan di browser dan tidak terhubung ke PC-mu. Di aplikasi, perintah yang sama baru dijalankan setelah kamu memasang dan memanggil Luna.',
  },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a className="nav-brand" href="#atas" aria-label="Luna, kembali ke atas">
        <Mark size={28} bare />
        <span>Luna</span>
      </a>
      <nav className="nav-links" aria-label="Navigasi utama">
        {NAV.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <a className="btn btn-primary nav-cta" href="#unduh">
        Unduh Luna
      </a>
      <button
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-controls="nav-menu"
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? 'close' : 'menu'} size={18} />
      </button>
      <div id="nav-menu" className={`nav-menu ${open ? 'open' : ''}`}>
        {NAV.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <a className="nav-menu-cta" href="#unduh" onClick={() => setOpen(false)}>
          <Icon name="download" size={15} />
          Unduh Luna
        </a>
      </div>
    </header>
  );
}

function Head({ num, eyebrow, title, lead, center = false }) {
  return (
    <div className={`sec-head ${center ? 'center' : ''}`.trim()}>
      <Reveal as="p" className="eyebrow">
        {num ? <span className="eyebrow-num">{num}</span> : null}
        {eyebrow}
      </Reveal>
      <Reveal as="h2" delay={60}>
        {title}
      </Reveal>
      {lead ? (
        <Reveal as="p" className="lead" delay={120}>
          {lead}
        </Reveal>
      ) : null}
    </div>
  );
}

function HeroShowcase() {
  return (
    <Reveal className="hero-showcase" delay={200}>
      <Tilt className="showcase-tilt" max={2.4}>
        <div className="showcase" aria-hidden="true">
          <span className="showcase-glow" />

          <div className="showcase-ghost ghost-a">
            <span className="ghost-bar">
              <i />
              <i />
              <i />
            </span>
            <span className="ghost-title" />
            <div className="ghost-grid">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="showcase-ghost ghost-b">
            <span className="ghost-bar">
              <i />
              <i />
              <i />
            </span>
            <span className="ghost-title short" />
            <div className="ghost-lines">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="appwin">
            <div className="appwin-bar">
              <span className="appwin-lights">
                <i />
                <i />
                <i />
              </span>
              <span className="appwin-title">
                <Mark size={14} />
                Luna
                <em>ruang kerja</em>
              </span>
              <span className="appwin-state">
                <i />
                siap mendengar
              </span>
            </div>

            <div className="appwin-body">
              <div className="appwin-rail">
                <span className="rail-brand">
                  <Mark size={20} />
                </span>
                <span className="rail-item on">
                  <Icon name="chat" size={16} />
                </span>
                <span className="rail-item">
                  <Icon name="spark" size={16} />
                </span>
                <span className="rail-item">
                  <Icon name="calendar" size={16} />
                </span>
                <span className="rail-item">
                  <Icon name="bookmark" size={16} />
                </span>
                <span className="rail-item">
                  <Icon name="terminal" size={16} />
                </span>
                <span className="rail-item">
                  <Icon name="phone" size={16} />
                </span>
                <span className="rail-bottom">
                  <Icon name="lock" size={15} />
                </span>
              </div>

              <div className="appwin-stage">
                <span className="stage-bg" />
                <span className="stage-ring r1" />
                <span className="stage-ring r2" />
                <img
                  className="stage-person"
                  src="/characters/tsukuyomi.webp"
                  alt=""
                  width="640"
                  height="854"
                  loading="eager"
                />
                <span className="stage-shade" />
                <div className="stage-top">
                  <span className="stage-live">
                    <i />
                    live
                  </span>
                  <span className="stage-mode">mode santai</span>
                </div>
                <div className="stage-note">
                  <Icon name="calendar" size={12} />
                  <span>07.00 · minum air</span>
                </div>
                <div className="stage-mini-chat">
                  <span className="mini-bubble me">Luna, putar lagu lo-fi.</span>
                  <span className="mini-bubble luna">
                    <Mark size={10} />
                    Spotify terbuka. Diputar pelan.
                  </span>
                </div>
                <div className="stage-foot">
                  <div className="stage-who">
                    <b>Luna</b>
                    <small>tenang · hangat</small>
                  </div>
                  <div className="stage-wave">
                    <Wave bars={18} active />
                    <span>mendengarkan</span>
                  </div>
                </div>
              </div>

              <div className="appwin-chat">
                <div className="chat-head">
                  <span className="chat-live">
                    <i />
                    <Rotating items={TICKER} />
                  </span>
                  <small>obrolan · 21.07</small>
                </div>
                <div className="chat-scroll">
                  <div className="chat-row luna">
                    <span className="chat-avatar">
                      <Mark size={14} />
                    </span>
                    <p>Malam. Aku di sini. Mau mulai dari mana?</p>
                  </div>
                  <div className="chat-row me">
                    <p>Luna, putar lagu lo-fi.</p>
                  </div>
                  <div className="chat-row luna">
                    <span className="chat-avatar">
                      <Mark size={14} />
                    </span>
                    <p>Spotify terbuka. Playlist lo-fi diputar, volume 30%.</p>
                  </div>
                  <div className="chat-action">
                    <span className="chat-action-icon">
                      <Icon name="voice" size={13} />
                    </span>
                    <span className="chat-action-copy">
                      <b>spotify · diputar</b>
                      <small>midnight study</small>
                    </span>
                    <Wave bars={8} active />
                  </div>
                  <div className="chat-suggest">
                    <span>“Bangunin aku jam 7”</span>
                    <span>“Cari file proposal”</span>
                  </div>
                  <div className="chat-typing">
                    <span className="typing-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>Luna siap kapan saja</span>
                  </div>
                </div>
                <div className="chat-input">
                  <span>Ketik atau ucapkan…</span>
                  <i className="chat-mic">
                    <Icon name="mic" size={12} />
                  </i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tilt>
    </Reveal>
  );
}

function Hero() {
  return (
    <section className="hero" id="atas">
      <div className="wrap hero-center">
        <Reveal as="p" className="hero-badge">
          <span className="status-dot" />
          <Decrypt text="LUNA · ASISTEN SUARA PRIBADI" />
        </Reveal>
        <Reveal as="h1" delay={50}>
          Bilang saja.
          <br />
          <span className="dim">Luna yang urus.</span>
        </Reveal>
        <Reveal as="p" className="hero-lead" delay={110}>
          Luna tinggal di komputermu dan bekerja lewat suara. Panggil namanya saat tanganmu masih
          sibuk, lalu biarkan ia memutar lagu atau memasang pengingat. Jawabannya keluar sebagai
          suara sambil kamu tetap di jendela yang sama.
        </Reveal>
        <Reveal className="hero-actions" delay={160}>
          <Magnet>
            <a className="btn btn-primary" href={SITE.pc}>
              <Icon name="download" size={16} />
              Unduh untuk Windows
            </a>
          </Magnet>
          <a className="btn btn-ghost" href="#cara-kerja">
            Lihat cara kerjanya
            <Icon name="arrow" size={16} />
          </a>
        </Reveal>
        <Reveal as="p" className="hero-meta" delay={210}>
          <span>Windows 10/11</span>
          <i />
          <span>Android 5.1+</span>
          <i />
          <span>Mulai dari PC</span>
        </Reveal>
      </div>

      <HeroShowcase />
    </section>
  );
}

function OrbDemo() {
  const [listening, setListening] = useState(false);
  return (
    <button
      type="button"
      className={`orb-visual ${listening ? 'is-live' : ''}`}
      aria-pressed={listening}
      aria-label={listening ? 'Hentikan contoh mendengarkan' : 'Putar contoh mendengarkan'}
      onClick={() => setListening((value) => !value)}
    >
      <i className="orb-ring r1" />
      <i className="orb-ring r2" />
      <span className="orb-core" />
      <i className="orb-dot d1" />
      <i className="orb-dot d2" />
      <span className="orb-hint">{listening ? 'mendengarkan…' : 'ketuk untuk contoh'}</span>
    </button>
  );
}

function Features() {
  return (
    <section className="section light" id="fitur">
      <div className="wrap">
        <Head
          center
          num="01"
          eyebrow="Fitur"
          title="Tinggal di desktop, siap dipanggil."
          lead="Luna duduk di desktop dan mendengar saat namanya dipanggil. Dari sana ia bisa membuka aplikasi, mencari file, dan mengingat apa yang kamu ceritakan kemarin, jadi cerita yang sama tidak perlu kamu ulang."
        />

        <div className="bento">
          <Reveal className="span-2">
            <Spot className="card card-wide">
              <div className="card-wide-grid">
                <div className="card-copy">
                  <span className="card-icon">
                    <Icon name="voice" size={18} />
                  </span>
                  <h3>Tidak perlu menunggu giliran</h3>
                  <p>
                    Panggil sekali, lalu bicara sepanjang yang kamu mau. Kalau kamu memotong di
                    tengah jawaban, Luna berhenti dan mendengarkan bagian barunya.
                  </p>
                  <p className="card-note">Wake word · barge-in · suara + teks</p>
                </div>
                <div className="voice-panel" aria-hidden="true">
                  <div className="wave-row">
                    <span>kamu</span>
                    <Wave bars={24} />
                  </div>
                  <div className="wave-row">
                    <span>luna</span>
                    <Wave bars={24} active />
                  </div>
                  <p className="voice-foot">otak AI pilihanmu · suara Luna</p>
                </div>
              </div>
            </Spot>
          </Reveal>

          <Reveal delay={60}>
            <Spot className="card">
              <span className="card-icon">
                <Icon name="spark" size={18} />
              </span>
              <h3>Wajah yang ikut bicara</h3>
              <p>
                Avatarnya berkedip dan bibirnya bergerak mengikuti irama suara. Kalau bosan, kamu
                bisa mengganti model VRM lain dari menu stage.
              </p>
              <OrbDemo />
              <p className="card-note">VRM · ekspresi · lip-sync</p>
            </Spot>
          </Reveal>

          <Reveal delay={100}>
            <Spot className="card">
              <span className="card-icon">
                <Icon name="terminal" size={18} />
              </span>
              <h3>Sampai ke sistem PC</h3>
              <p>
                Luna bisa membuka aplikasi dan mengubah volume, mencari file, atau menjalankan
                perintah PowerShell. Untuk tindakan yang berisiko, ia meminta konfirmasi lebih dulu.
              </p>
              <div className="cmd" aria-hidden="true">
                <div>
                  <span>buka spotify</span>
                  <b className="ok">selesai</b>
                </div>
                <div>
                  <span>volume 35</span>
                  <b className="ok">selesai</b>
                </div>
                <div>
                  <span>cari file “proposal”</span>
                  <b className="ok">3 hasil</b>
                </div>
                <div>
                  <span>matikan layar</span>
                  <b className="warn">konfirmasi</b>
                </div>
              </div>
              <p className="card-note">Windows · PowerShell · sistem</p>
            </Spot>
          </Reveal>

          <Reveal delay={140}>
            <Spot className="card">
              <span className="card-icon">
                <Icon name="bookmark" size={18} />
              </span>
              <h3>Ingat tanpa disuruh</h3>
              <p>
                Setiap obrolan, catatan, dan jurnal tersimpan sebagai file di komputermu. Tanya apa
                yang kamu bahas kemarin, dan Luna masih bisa membukanya lagi.
              </p>
              <div className="memo" aria-hidden="true">
                <div>
                  <span>Rencana presentasi</span>
                  <time>12 Nov</time>
                </div>
                <div>
                  <span>Daftar belanja</span>
                  <time>Sabtu</time>
                </div>
                <div>
                  <span>Lagu favorit · lo-fi</span>
                  <time>tersimpan</time>
                </div>
              </div>
              <p className="card-note">konteks · jurnal · pencarian</p>
            </Spot>
          </Reveal>

          <Reveal delay={180}>
            <Spot className="card">
              <span className="card-icon">
                <Icon name="phone" size={18} />
              </span>
              <h3>HP jadi remot</h3>
              <p>
                Pasangkan HP lewat token, lalu pantau dan kendalikan PC dari layar kecil. Percakapan
                yang sama tetap terbuka di dua perangkat.
              </p>
              <div className="pair" aria-hidden="true">
                <span className="pair-phone">
                  <Mark size={15} />
                </span>
                <span className="pair-copy">
                  <b>PC · ruang kerja</b>
                  <small>pairing · LAN</small>
                </span>
                <span className="pair-state">
                  <i />
                  terhubung
                </span>
              </div>
              <p className="card-note">pairing · LAN · dua arah</p>
            </Spot>
          </Reveal>
        </div>

        <div className="capability">
          <Reveal className="capability-intro">
            <p className="eyebrow">Daftar singkat</p>
            <h3>Yang bisa kamu minta.</h3>
            <p>
              Luna paling berguna saat tanganmu sibuk. Perintah di bawah sudah dipetakan ke
              tindakan di Windows, bukan cuma dijawab dengan teks.
            </p>
            <p className="capability-limit">
              <Icon name="lock" size={13} />
              Tindakan yang mengubah PC tetap minta konfirmasi.
            </p>
          </Reveal>
          <div className="capability-grid">
            {CAPABILITIES.map(([title, items], index) => (
              <Reveal className="capability-item" key={title} delay={index * 40}>
                <b>{title}</b>
                <p>{items}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoChat() {
  const [messages, setMessages] = useState(DEMO_START);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const timers = useRef([]);
  const bodyRef = useRef(null);
  const nextId = useRef(1);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  useEffect(
    () => () => {
      clearTimers();
    },
    [],
  );

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: prefersReduced() ? 'auto' : 'smooth' });
  }, [messages]);

  const send = (value) => {
    const text = String(value ?? '').trim();
    if (!text || busy) return;
    const reply = replyTo(text);
    setDraft('');
    setBusy(true);
    setMessages((list) => [...list, { id: nextId.current++, who: 'kamu', text }]);
    timers.current.push(
      window.setTimeout(() => {
        setMessages((list) => [...list, { id: 'typing', who: 'luna', typing: true }]);
      }, 220),
    );
    timers.current.push(
      window.setTimeout(() => {
        setMessages((list) => [
          ...list.filter((message) => !message.typing),
          { id: nextId.current++, who: 'luna', ...reply },
        ]);
        setBusy(false);
      }, 900),
    );
  };

  const reset = () => {
    clearTimers();
    setMessages(DEMO_START);
    setDraft('');
    setBusy(false);
    nextId.current = 1;
  };

  return (
    <div className="demo">
      <div className="demo-head">
        <Mark size={26} bare />
        <b>Luna</b>
        <small>demo interaktif</small>
        <Wave bars={10} active={busy} className="demo-wave" />
        <button
          type="button"
          className="demo-reset"
          onClick={reset}
          aria-label="Mulai ulang demo"
          title="Mulai ulang demo"
        >
          <Icon name="reset" size={14} />
        </button>
      </div>
      <div className="demo-body" ref={bodyRef} aria-live="polite">
        {messages.map((message) =>
          message.typing ? (
            <div className="dmsg luna typing" key="typing">
              <i />
              <i />
              <i />
            </div>
          ) : (
            <div className={`dmsg ${message.who}`} key={message.id}>
              <span>{message.text}</span>
              {message.tag ? (
                <span className={`act ${message.kind || 'done'}`}>
                  <Icon name={ACT_ICON[message.kind] || 'check'} size={11} />
                  {message.tag}
                </span>
              ) : null}
            </div>
          ),
        )}
      </div>
      <div className="demo-foot">
        <div className="chips" role="group" aria-label="Contoh perintah">
          {DEMO_CHIPS.map((chip) => (
            <button
              type="button"
              className="chip"
              key={chip.label}
              onClick={() => send(chip.q)}
              disabled={busy}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <form
          className="demo-form"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <label className="sr-only" htmlFor="demo-input">
            Tulis perintah untuk Luna
          </label>
          <input
            id="demo-input"
            className="demo-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ketik perintah, misalnya: buka Spotify"
            autoComplete="off"
            maxLength={140}
          />
          <button
            type="submit"
            className="demo-send"
            aria-label="Kirim perintah"
            disabled={busy || !draft.trim()}
          >
            <Icon name="send" size={16} />
          </button>
        </form>
        <p className="demo-note">
          Simulasi di browser. Di aplikasi, perintah yang sama dijalankan lewat jembatan lokal di PC.
        </p>
      </div>
    </div>
  );
}

function Work() {
  return (
    <section className="section night" id="cara-kerja">
      <div className="wrap work">
        <div>
          <Head
            num="02"
            eyebrow="Cara kerja"
            title={
              <>
                Dari satu kata,
                <br />
                jadi tindakan.
              </>
            }
            lead="Panggil namanya, lalu bicara seperti biasa tanpa membuka menu apa pun."
          />
          <div className="steps">
            <Reveal className="step" delay={60}>
              <span className="step-num">01</span>
              <div>
                <h3>Panggil namanya</h3>
                <p>Cukup ucapkan “Luna”. Tidak perlu klik, tidak perlu membuka jendela.</p>
              </div>
            </Reveal>
            <Reveal className="step" delay={110}>
              <span className="step-num">02</span>
              <div>
                <h3>Bicara seperti biasa</h3>
                <p>Luna mendengar lewat mikrofon, memahami konteks, lalu menyusun jawaban dengan otak AI yang kamu pilih.</p>
              </div>
            </Reveal>
            <Reveal className="step" delay={160}>
              <span className="step-num">03</span>
              <div>
                <h3>Lihat ia bertindak</h3>
                <p>Aplikasinya terbuka, pengingatnya terpasang, lalu jawabannya keluar sebagai suara.</p>
              </div>
            </Reveal>
          </div>
        </div>
        <Reveal delay={120}>
          <DemoChat />
        </Reveal>
      </div>

      <div className="wrap privacy">
        <Reveal className="privacy-head">
          <p className="eyebrow">Batas yang jelas</p>
          <h3>Kamu tetap pegang kendali.</h3>
          <p>
            Luna tidak merekam terus-menerus dan tidak bisa membuka kunci HP-mu. Beberapa hal
            memang butuh internet, dan itu disebut apa adanya.
          </p>
        </Reveal>
        <div className="privacy-grid">
          <Reveal className="privacy-item" delay={40}>
            <span className="privacy-icon">
              <Icon name="lock" size={16} />
            </span>
            <b>Di PC-mu</b>
            <p>Whisper dan F5 berjalan lokal. Ingatan, jadwal, dan kendali PC tersimpan di mesinmu.</p>
          </Reveal>
          <Reveal className="privacy-item" delay={80}>
            <span className="privacy-icon">
              <Icon name="spark" size={16} />
            </span>
            <b>Ke penyedia AI</b>
            <p>Hanya teks perintah dan konteks yang perlu dikirim ke API pilihanmu. Audio tidak ikut dikirim.</p>
          </Reveal>
          <Reveal className="privacy-item" delay={120}>
            <span className="privacy-icon">
              <Icon name="check" size={16} />
            </span>
            <b>Minta konfirmasi</b>
            <p>Matikan PC, restart, dan tindakan berisiko lain menunggu persetujuanmu.</p>
          </Reveal>
          <Reveal className="privacy-item" delay={160}>
            <span className="privacy-icon">
              <Icon name="screen" size={16} />
            </span>
            <b>Tidak dilakukan</b>
            <p>Tidak membuka kunci HP, tidak mengunggah file tanpa izin, dan tidak menjalankan perintah admin tanpa konfirmasi.</p>
          </Reveal>
        </div>
      </div>

      <div className="wrap brain">
        <Reveal className="brain-copy">
          <p className="eyebrow">Otak AI</p>
          <h3>Pakai API yang kamu suka.</h3>
          <p>
            Luna tidak terkunci ke satu penyedia. Bawaannya Groq karena gratis dan cepat. Kalau kamu
            sudah punya langganan lain, ganti alamat API, model, dan kuncinya di Pengaturan. Sisanya
            tetap sama: suara, ingatan, dan kendali PC tidak ikut berubah.
          </p>
        </Reveal>
        <Reveal className="brain-panel" delay={80}>
          <ul className="brain-list">
            {PROVIDERS.map(([name, note, isDefault]) => (
              <li key={name} className={isDefault ? 'is-default' : undefined}>
                <b>{name}</b>
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <dl className="brain-fields">
            <div>
              <dt>Alamat API</dt>
              <dd>https://api.groq.com/openai/v1</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>llama-3.3-70b-versatile</dd>
            </div>
            <div>
              <dt>Kunci</dt>
              <dd>tersimpan di PC-mu saja</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section className="section light" id="di-hp">
      <div className="wrap show-grid">
        <div>
          <Head
            num="03"
            eyebrow="Dua layar, satu Luna"
            title={
              <>
                Mulai di PC.
                <br />
                Lanjut di HP.
              </>
            }
            lead="Kendali tetap di PC, sedangkan HP jadi jendela dan remot yang selalu ada di tangan."
          />
          <div className="show-list">
            <Reveal className="show-item" delay={40}>
              <span className="card-icon">
                <Icon name="chat" size={17} />
              </span>
              <div>
                <b>Satu percakapan</b>
                <p>Riwayat dan konteks percakapan tetap sama di PC maupun HP.</p>
              </div>
            </Reveal>
            <Reveal className="show-item" delay={80}>
              <span className="card-icon">
                <Icon name="screen" size={17} />
              </span>
              <div>
                <b>Kendali dari jauh</b>
                <p>Atur volume dan jendela PC dari HP, tanpa perlu kembali ke meja.</p>
              </div>
            </Reveal>
            <Reveal className="show-item" delay={120}>
              <span className="card-icon">
                <Icon name="calendar" size={17} />
              </span>
              <div>
                <b>Jadwal yang ikut</b>
                <p>Pengingat dan jurnal tersimpan di satu tempat yang sama.</p>
              </div>
            </Reveal>
            <Reveal className="show-item" delay={160}>
              <span className="card-icon">
                <Icon name="lock" size={17} />
              </span>
              <div>
                <b>Pairing ber-token</b>
                <p>Hanya perangkat yang sudah dipasangkan yang bisa tersambung, dan hanya lewat jaringanmu sendiri.</p>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal className="easel-reveal" delay={120}>
          <div className="easel">
            <span className="easel-glow" aria-hidden="true" />
            <PcMock />
            <PhoneMock />
            <span className="easel-note">PC + Android · satu sesi</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Characters() {
  const [active, setActive] = useState(0);
  const current = CHARACTERS[active];

  const onKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const dir = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
    const next = (active + dir + CHARACTERS.length) % CHARACTERS.length;
    setActive(next);
    document.getElementById(`char-tab-${CHARACTERS[next].id}`)?.focus();
  };

  return (
    <section className="section light char-sec" id="karakter">
      <div className="wrap">
        <Head
          num="04"
          eyebrow="Karakter"
          title={
            <>
              Satu asisten,
              <br />
              banyak wajah.
            </>
          }
          lead="Luna bisa tampil dengan beberapa model. Pilih satu untuk melihat contoh percakapannya, lalu ganti kapan saja dari menu stage. Wajahnya berganti, asistennya tetap Luna."
        />

        <div className="char-grid">
          <div className="char-pick" role="tablist" aria-label="Contoh karakter" onKeyDown={onKeyDown}>
            {CHARACTERS.map((character, index) => (
              <button
                key={character.id}
                type="button"
                role="tab"
                id={`char-tab-${character.id}`}
                aria-selected={index === active}
                aria-controls="char-panel"
                tabIndex={index === active ? 0 : -1}
                className={`char-option ${index === active ? 'on' : ''}`}
                onClick={() => setActive(index)}
              >
                <img src={character.thumb} alt="" loading="lazy" width="208" height="264" />
                <span className="char-option-copy">
                  <b>{character.name}</b>
                  <small>{character.vibe}</small>
                </span>
                <span className="char-check" aria-hidden="true">
                  <Icon name="check" size={13} />
                </span>
              </button>
            ))}
            <p className="char-tip">Ini pratinjau gambar, bukan model 3D yang bisa diputar. Kredit ada di tiap kartu; berkas VRM tidak dibagikan lewat situs. Di aplikasi, kamu bisa memuat VRM milikmu sendiri.</p>
          </div>

          <div
            className="char-show"
            id="char-panel"
            role="tabpanel"
            aria-labelledby={`char-tab-${current.id}`}
          >
            <div className="char-frame">
              <img
                key={current.id}
                src={current.src}
                alt={`Ilustrasi contoh ${current.name}`}
                width="640"
                height="854"
              />
              <span className="char-veil" aria-hidden="true" />
              <div className="char-plate">
                <Mark size={22} bare />
                <div>
                  <b>{current.name}</b>
                  <small>{current.vibe}</small>
                </div>
                <span className="char-live">
                  <i aria-hidden="true" />
                  pratinjau
                </span>
              </div>
            </div>

            <div className="char-example">
              <p className="char-label">Contoh percakapan</p>
              <div className="char-bubble kamu">{current.q}</div>
              <div className="char-bubble luna">
                {current.a}
                <span className="act">
                  <Icon name="check" size={11} />
                  {current.tag}
                </span>
              </div>
              <p className="char-credit">
                <a href={current.creditUrl} target="_blank" rel="noreferrer">
                  {current.credit}
                </a>
                <span> · lisensi model</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section light faq-sec" id="tanya-jawab">
      <div className="wrap faq">
        <div className="faq-head">
          <Head
            num="05"
            eyebrow="Tanya jawab"
            title={
              <>
                Sebelum kamu
                <br />
                pasang.
              </>
            }
            lead="Kalau masih ada yang mengganjal, tanya langsung ke Luna di PC."
          />
        </div>
        <div className="faq-list">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <Reveal className={`faq-item ${isOpen ? 'open' : ''}`} key={item.q} delay={index * 40}>
                <h3>
                  <button
                    type="button"
                    className="faq-q"
                    id={`faq-q-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpen(isOpen ? -1 : index)}
                  >
                    {item.q}
                    <Icon name="plus" size={18} />
                  </button>
                </h3>
                <div
                  className="faq-a"
                  id={`faq-a-${index}`}
                  role="region"
                  aria-labelledby={`faq-q-${index}`}
                >
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="cta" id="unduh">
      <div className="wrap">
        <Reveal className="cta-mark">
          <span className="cta-glow" aria-hidden="true" />
          <Mark size={78} />
        </Reveal>
        <Reveal as="h2" delay={60}>
          Malam ini, Luna sudah menunggu.
        </Reveal>
        <Reveal as="p" delay={110}>
          Luna berjalan di Windows. Pasang installer-nya dulu, lalu hubungkan HP lewat token kalau
          kamu mau ikut memantau dari layar kecil.
        </Reveal>
        <Reveal className="cta-actions" delay={160}>
          <Magnet>
            <a className="btn btn-primary" href={SITE.pc}>
              <Icon name="download" size={16} />
              Unduh untuk Windows · {SITE.pcVersion}
            </a>
          </Magnet>
          <a className="btn btn-ghost" href={SITE.apk}>
            APK Android · {SITE.apkVersion}
          </a>
        </Reveal>
        <Reveal className="cta-steps" delay={190}>
          <div>
            <span>01</span>
            <b>Unduh installer</b>
            <p>File PC ada di GitHub Releases, terpisah dari kode situs.</p>
          </div>
          <div>
            <span>02</span>
            <b>Pasang di Windows</b>
            <p>Izinkan akses mikrofon saat aplikasi pertama kali berjalan.</p>
          </div>
          <div>
            <span>03</span>
            <b>Panggil Luna</b>
            <p>Ucapkan namanya, lalu minta sesuatu seperti biasa.</p>
          </div>
        </Reveal>
        <Reveal as="dl" className="cta-specs" delay={220}>
          <div>
            <dt>PC</dt>
            <dd>Windows 10 atau 11</dd>
            <small>{SITE.pcSize} · versi {SITE.pcVersion}</small>
          </div>
          <div>
            <dt>HP</dt>
            <dd>Android 5.1 ke atas</dd>
            <small>pendamping, butuh PC menyala</small>
          </div>
          <div>
            <dt>Perlu</dt>
            <dd>Mikrofon dan internet</dd>
            <small>untuk otak AI, bawaannya Groq gratis</small>
          </div>
          <div>
            <dt>Unduhan</dt>
            <dd>GitHub Releases</dd>
            <small>terpisah dari kode situs</small>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand-col">
            <a className="foot-brand" href="#atas">
              <Mark size={36} />
              <span>
                Luna
                <small>asisten suara pribadi</small>
              </span>
            </a>
            <p className="foot-note">
              Kamu bicara, Luna menanggapi. Dari obrolan singkat sampai urusan di PC.
            </p>
          </div>
          <nav className="foot-col" aria-label="Navigasi footer">
            <b>Jelajahi</b>
            {NAV.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="foot-col">
            <b>Unduh</b>
            <a href={SITE.pc}>Windows · {SITE.pcVersion}</a>
            <a href={SITE.apk}>Android · {SITE.apkVersion}</a>
            <a href="https://github.com/arielbudinex-oss/Luna-AI" target="_blank" rel="noreferrer">
              Kode situs di GitHub
            </a>
          </div>
        </div>
        <p className="foot-credit">
          Karakter: Tsukuyomi oleh{' '}
          <a href="https://tyc.rei-yumesaki.net/material/avatar/3d-a/" target="_blank" rel="noreferrer">
            Rei Yumesaki
          </a>
          , Vita oleh{' '}
          <a
            href="https://hub.vroid.com/license?allowed_to_use_user=everyone&characterization_allowed_user=everyone&corporate_commercial_use=allow&credit=unnecessary&modification=allow&personal_commercial_use=profit&redistribution=allow&sexual_expression=allow&version=1&violent_expression=allow"
            target="_blank"
            rel="noreferrer"
          >
            VRoid Project
          </a>
        </p>
        <div className="foot-bottom">
          <span>© 2026 Luna</span>
          <span className="foot-powered">
            Powered by <b>Xinet Group</b>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <a className="skip" href="#fitur">
        Langsung ke fitur
      </a>
      <Nav />
      <main>
        <Hero />
        <Marquee items={MARQUEE} />
        <Features />
        <Work />
        <Showcase />
        <Characters />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

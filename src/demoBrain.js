const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}\s:.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const has = (text, pattern) => pattern.test(text);

const clock = () =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date());

const date = () =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

const parseTime = (text) => {
  const match = text.match(/\b(?:jam|pukul)\s*(\d{1,2})(?:[.:](\d{2}))?\b/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}`;
};

const APPS = [
  [/visual studio code|vscode/, 'Visual Studio Code'],
  [/google chrome|chrome/, 'Chrome'],
  [/microsoft edge|edge/, 'Edge'],
  [/firefox/, 'Firefox'],
  [/notepad/, 'Notepad'],
  [/file explorer|explorer/, 'File Explorer'],
  [/powershell|power shell/, 'PowerShell'],
  [/command prompt|cmd/, 'Command Prompt'],
  [/whatsapp/, 'WhatsApp'],
  [/discord/, 'Discord'],
  [/steam/, 'Steam'],
  [/spotify/, 'Spotify'],
  [/youtube/, 'YouTube'],
  [/microsoft word|word/, 'Word'],
  [/excel/, 'Excel'],
  [/powerpoint|ppt/, 'PowerPoint'],
];

const openTarget = (text) => {
  const match = text.match(/\b(?:buka|jalankan|launch)\s+(.+)$/);
  if (!match) return null;
  return match[1]
    .replace(/\b(dong|ya|yah|sekarang|untuk saya|please|aplikasi)\b/g, '')
    .split(/\s+(?:dan|lalu|terus)\s+/)[0]
    .trim();
};

const fileKeyword = (text) => {
  const match =
    text.match(/\b(?:cari|temukan|buka)\s+(?:file|dokumen|folder)\s+(.+)$/) ||
    text.match(/\b(?:file|dokumen|folder)\s+(.+)$/);
  if (!match) return 'proposal';
  const cleaned = match[1]
    .replace(/\b(terbaru|baru|yang|dong|ya|di|dari|punya saya|ku)\b/g, '')
    .trim();
  return cleaned || 'proposal';
};

export const DEMO_CHIPS = [
  { label: 'Buka Spotify', q: 'Luna, buka Spotify dan putar lagu lo-fi.' },
  { label: 'Bangunin besok jam 7', q: 'Besok jam 7 bangunin aku.' },
  { label: 'Cari file proposal', q: 'Cari file proposal terbaru.' },
  { label: 'Matikan PC', q: 'Luna, matikan PC.' },
];

export function replyTo(raw) {
  const text = normalize(raw).replace(/^luna\s+/, '');
  if (!text) {
    return { text: 'Tulis perintahnya dulu, ya.', tag: 'menunggu', kind: 'wait' };
  }

  if (text === 'luna' || has(text, /^(halo|hai|hi|pagi|siang|sore|malam)\b/)) {
    return {
      text: 'Halo. Aku di sini. Mau buka sesuatu, memasang pengingat, atau sekadar bertanya?',
      tag: 'siap',
      kind: 'done',
    };
  }

  if (has(text, /\b(siapa kamu|kamu siapa|namamu|nama kamu|apa itu luna)\b/)) {
    return {
      text: 'Aku Luna, asisten suara untuk Windows. Di demo ini aku menjawab dari skrip kecil di browser. Di aplikasi, aku terhubung ke Groq dan alat PC-mu.',
      tag: 'tentang Luna',
      kind: 'info',
    };
  }

  if (has(text, /\b(bangun|bangunin|alarm|ingatkan|pengingat|reminder)\b/)) {
    const time = parseTime(text);
    if (!time) {
      return {
        text: 'Pengingatnya kucatat. Mau jam berapa? Sebutkan misalnya "jam 7".',
        tag: 'perlu waktu',
        kind: 'wait',
      };
    }
    const when = has(text, /\bbesok\b/) ? 'besok, ' : has(text, /\bhari ini\b/) ? 'hari ini, ' : '';
    return {
      text: `Pengingat ${when}${time} dipasang. Aku bunyikan sekali, lalu kamu bisa tunda.`,
      tag: 'pengingat dibuat',
      kind: 'done',
    };
  }

  if (has(text, /\b(jam berapa|sekarang jam|pukul berapa)\b/)) {
    return { text: `Sekarang ${clock()}.`, tag: 'waktu lokal', kind: 'info' };
  }

  if (has(text, /\b(hari apa|tanggal berapa|hari ini tanggal)\b/)) {
    return { text: `Hari ini ${date()}.`, tag: 'tanggal lokal', kind: 'info' };
  }

  if (has(text, /\b(hentikan musik|matikan musik|stop musik|jeda musik)\b/)) {
    return { text: 'Musik kuhentikan. Bilang saja kalau mau dilanjutkan.', tag: 'musik berhenti', kind: 'done' };
  }

  if (has(text, /\b(putar|lagu|musik|playlist|lo.?fi)\b/)) {
    const genre = has(text, /lo.?fi/)
      ? 'lo-fi'
      : has(text, /tenang|tidur/)
        ? 'midnight study'
        : has(text, /fokus|kerja/)
          ? 'deep focus'
          : has(text, /ceria|senang|pagi/)
            ? 'pagi cerah'
            : 'pilihanmu';
    const soft = has(text, /pelan|kecil/) ? ', volume 20%' : ', volume 30%';
    return {
      text: `Spotify terbuka. Playlist ${genre} diputar${soft}. Bilang kalau mau diganti.`,
      tag: 'musik diputar',
      kind: 'done',
    };
  }

  if (has(text, /\b(volume|suara)\b/)) {
    if (has(text, /\b(mute|senyap|bisu|matikan suara)\b/)) {
      return { text: 'Suara kusenyapkan. Bilang "unmute" kalau mau kembali.', tag: 'suara dibisukan', kind: 'done' };
    }
    if (has(text, /\b(unmute|nyalakan suara)\b/)) {
      return { text: 'Suara dinyalakan lagi, volume 30%.', tag: 'suara dinyalakan', kind: 'done' };
    }
    const number = text.match(/\b(\d{1,3})\b/);
    const level = number
      ? Math.min(100, Number(number[1]))
      : has(text, /pelan|kecil/)
        ? 25
        : has(text, /keras|besar/)
          ? 70
          : 45;
    return { text: `Volume kuatur ke ${level}%.`, tag: 'volume diatur', kind: 'done' };
  }

  if (has(text, /\b(screenshot|tangkapan layar|ambil layar)\b/)) {
    return {
      text: 'Tangkapan layar diambil dan disimpan ke Pictures/Luna.',
      tag: 'layar disimpan',
      kind: 'done',
    };
  }

  if (has(text, /\bmatikan layar\b/)) {
    return { text: 'Layar kumatikan tanpa mematikan PC. Gerakkan mouse untuk membangunkan.', tag: 'layar dimatikan', kind: 'done' };
  }

  if (has(text, /\b(minimize|minimalkan|tutup jendela|pindah jendela|fokus jendela)\b/)) {
    return { text: 'Jendela aktif kurapikan. Mau kupindahkan ke monitor lain?', tag: 'jendela diatur', kind: 'done' };
  }

  if (has(text, /\b(cari file|cari dokumen|cari folder|temukan file|file|dokumen|folder)\b/)) {
    const keyword = fileKeyword(text);
    if (has(text, /\bfolder\b/)) {
      return {
        text: `Folder "${keyword}" ketemu di Documents. Mau kubuka?`,
        tag: 'folder ditemukan',
        kind: 'done',
      };
    }
    return {
      text: `Ketemu tiga file yang mirip "${keyword}". Paling baru ${keyword}-v4.docx, kemarin 21.14. Mau kubuka?`,
      tag: '3 hasil',
      kind: 'done',
    };
  }

  if (has(text, /\b(wifi|jaringan|router|internet)\b/)) {
    return {
      text: 'Jaringan terhubung. Kalau mau, aku bisa membuka pengaturan router atau mengecek perangkat yang menempel.',
      tag: 'jaringan dicek',
      kind: 'info',
    };
  }

  if (has(text, /\b(ingat|kemarin|rencana|jurnal|catatan)\b/)) {
    return {
      text: 'Kita pernah membahas rencana presentasi dan daftar belanja. Mau kurangkum jadi catatan?',
      tag: 'ingatan dibaca',
      kind: 'info',
    };
  }

  const open = openTarget(text);
  if (open) {
    const known = APPS.find(([pattern]) => pattern.test(open));
    const name = known ? known[1] : open;
    if (!known) {
      return {
        text: `Aku catat "${name}" sebagai aplikasi. Di PC, aku akan mencocokkan namanya dulu supaya tidak salah buka.`,
        tag: 'perlu dicek',
        kind: 'wait',
      };
    }
    return {
      text: `${name} dibuka. Jendelanya muncul di layar utama.`,
      tag: 'aplikasi dibuka',
      kind: 'done',
    };
  }

  const system =
    has(text, /\b(shutdown|restart|reboot|hibernate|logoff)\b/) ||
    (has(text, /\bmatikan\b/) && has(text, /\b(pc|komputer|laptop)\b/)) ||
    (has(text, /\b(tidur|sleep)\b/) && has(text, /\b(pc|komputer|laptop)\b/)) ||
    (has(text, /\b(kunci|lock)\b/) && has(text, /\b(pc|komputer|layar|windows)\b/));

  if (has(text, /\b(batal|jangan jadi|urungkan)\b/)) {
    return { text: 'Baik, tidak ada yang kujalankan.', tag: 'dibatalkan', kind: 'done' };
  }

  if (system) {
    return {
      text: 'Itu mengubah keadaan PC. Di aplikasi, aku akan menampilkan konfirmasi dulu dan baru menjalankannya setelah kamu setuju.',
      tag: 'perlu konfirmasi',
      kind: 'confirm',
    };
  }

  if (has(text, /\b(capek|lelah|ngantuk|pusing|stress)\b/)) {
    return {
      text: 'Kalau kamu masih di depan layar, aku bisa mengecilkan volume dan memasang pengingat istirahat 15 menit. Mau?',
      tag: 'istirahat',
      kind: 'wait',
    };
  }

  if (has(text, /\b(makasih|terima kasih|thanks|terimakasih)\b/)) {
    return { text: 'Sama-sama. Panggil saja kalau ada yang lain.', tag: 'siap', kind: 'done' };
  }

  if (has(text, /\b(lelucon|joke|bercanda|garing)\b/)) {
    return {
      text: 'Aku bisa membuka Spotify, memasang pengingat, dan menemani begadang. Untuk membuat orang tertawa, aku masih perlu belajar.',
      tag: 'percobaan bercanda',
      kind: 'info',
    };
  }

  if (has(text, /\b(cuaca|hujan|panas|prakiraan)\b/)) {
    return {
      text: 'Di demo ini aku tidak mengambil cuaca. Di aplikasi, aku bisa mencari prakiraan lewat web kalau kamu mengizinkan.',
      tag: 'butuh internet',
      kind: 'info',
    };
  }

  if (has(text, /\b(cari di web|google|cari info|berita)\b/)) {
    return {
      text: 'Di aplikasi, aku bisa mencari lewat web dan merangkum hasilnya. Di demo ini, aku belum terhubung ke internet.',
      tag: 'butuh internet',
      kind: 'info',
    };
  }

  return {
    text: 'Aku belum punya contoh untuk itu di demo ini. Coba "buka Spotify", "bangunin besok jam 7", atau "cari file proposal". Di aplikasi, pertanyaan bebas diteruskan ke Groq.',
    tag: 'contoh lain',
    kind: 'info',
  };
}

const repo = 'https://github.com/arielbudinex-oss/Luna-AI';
const latest = `${repo}/releases/latest/download`;

export const SITE = {
  repo,
  releases: `${repo}/releases`,
  pcVersion: '1.3.19',
  apkVersion: '1.3.19',
  pcSize: '164 MB',
  pc: import.meta.env.VITE_PC_DOWNLOAD_URL || `${latest}/luna-setup-1.3.19.exe`,
  apk: import.meta.env.VITE_APK_DOWNLOAD_URL || `${latest}/luna-1.3.19.apk`,
};

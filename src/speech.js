// Japanese pronunciation through the browser's Web Speech API (no audio files needed).
// Works offline on most devices that ship a Japanese voice.
export const SOUND_SETTING_KEY = 'game-mode-sound';

let japaneseVoice = null;

function pickJapaneseVoice() {
  const voices = window.speechSynthesis.getVoices();
  japaneseVoice =
    voices.find(voice => voice.lang === 'ja-JP' && voice.localService) ||
    voices.find(voice => voice.lang === 'ja-JP') ||
    voices.find(voice => voice.lang?.toLowerCase().startsWith('ja')) ||
    null;
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function';
}

if (isSpeechSupported()) {
  pickJapaneseVoice();
  // Chrome loads its voices asynchronously
  window.speechSynthesis.addEventListener?.('voiceschanged', pickJapaneseVoice);
}

export function isSoundEnabled() {
  return isSpeechSupported() && localStorage.getItem(SOUND_SETTING_KEY) === 'true';
}

export function speak(text, { rate = 0.9 } = {}) {
  if (!text || !isSpeechSupported()) return;
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
  if (japaneseVoice) utterance.voice = japaneseVoice;
  // A new answer interrupts the previous one instead of queueing behind it
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// Speaks only when the user turned sound on in the menu
export function speakIfEnabled(text) {
  if (isSoundEnabled()) speak(text);
}

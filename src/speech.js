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

// Speech-to-text through the same Web Speech API, used to answer the
// sentence practice by voice. Recognition lives in the browser (Chrome,
// Edge, Safari); Firefox only speaks, it cannot listen.
export function isRecognitionSupported() {
  return typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Starts listening to Japanese speech. The recognizer is set up to be
// forgiving: it keeps listening across short pauses (continuous), reports
// partial results so a sentence can be recognized early, and offers several
// transcript alternatives. When the browser ends the session on its own
// (e.g. after a moment of silence) it is started again, until stop() is
// called - so the player can keep speaking without touching the mic.
//
// onTranscript({ finals, interim }): finals are the parts the recognizer is
// sure about (each with its alternatives), interim the part it is still
// guessing. onError(code) is called when listening stops for good (e.g. the
// microphone is not allowed).
// Returns { stop() }, or null when the browser cannot listen.
export function startListening({ onTranscript, onError } = {}) {
  const Recognition = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;

  let stopped = false;
  // A session that keeps ending again and again (and is restarted) is not
  // left listening forever when nobody speaks
  let restarts = 0;

  recognition.onresult = (event) => {
    if (!onTranscript) return;
    const finals = [];
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finals.push(Array.from(result, alternate => alternate.transcript));
      } else {
        interim += result[0].transcript;
      }
    }
    onTranscript({ finals, interim });
  };

  recognition.onerror = (event) => {
    // Silence and our own stop() are normal; everything else ends the
    // listening until the player turns the mic on again
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    stopped = true;
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (stopped) return;
    if (restarts >= 30) {
      stopped = true;
      return;
    }
    restarts++;
    try {
      recognition.start();
    } catch (error) {
      // Already started or unusable: nothing left to do
    }
  };

  try {
    recognition.start();
  } catch (error) {
    return null;
  }

  return {
    stop() {
      stopped = true;
      try {
        recognition.stop();
      } catch (error) {
        // Already stopped
      }
    },
  };
}

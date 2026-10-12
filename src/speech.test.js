import { isRecognitionSupported, isSoundEnabled, SOUND_SETTING_KEY, speak, speakIfEnabled, startListening } from './speech';

describe('speech', () => {
  let spoken;

  beforeEach(() => {
    spoken = [];
    localStorage.clear();
    window.SpeechSynthesisUtterance = function (text) { this.text = text; };
    window.speechSynthesis = {
      getVoices: () => [],
      cancel: jest.fn(),
      speak: utterance => spoken.push(utterance),
    };
  });

  it('speaks in Japanese', () => {
    speak('あ');
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe('あ');
    expect(spoken[0].lang).toBe('ja-JP');
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('ignores empty text', () => {
    speak('');
    expect(spoken).toHaveLength(0);
  });

  it('only speaks during the game when sound is turned on', () => {
    speakIfEnabled('か');
    expect(isSoundEnabled()).toBe(false);
    expect(spoken).toHaveLength(0);

    localStorage.setItem(SOUND_SETTING_KEY, 'true');
    speakIfEnabled('か');
    expect(isSoundEnabled()).toBe(true);
    expect(spoken).toHaveLength(1);
  });
});

/*
 * Speech-to-text for the sentence practice: startListening() wraps the
 * browser's SpeechRecognition. The fake below records every session, so the
 * tests can drive it the way a browser would (results, silence, errors).
 */
describe('listening to spoken answers', () => {
  let recognitions = [];

  class FakeSpeechRecognition {
    constructor() {
      this.start = jest.fn();
      this.stop = jest.fn();
      recognitions.push(this);
    }
  }

  // One result of the recognizer: a transcript with its alternatives
  const speechResult = (transcript, isFinal) => Object.assign([{ transcript }], { isFinal });

  beforeEach(() => {
    recognitions = [];
    window.SpeechRecognition = FakeSpeechRecognition;
  });

  afterEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });

  it('is supported through SpeechRecognition and webkitSpeechRecognition', () => {
    expect(isRecognitionSupported()).toBe(true);

    delete window.SpeechRecognition;
    expect(isRecognitionSupported()).toBe(false);
    window.webkitSpeechRecognition = FakeSpeechRecognition;
    expect(isRecognitionSupported()).toBe(true);
  });

  it('listens in Japanese, on and on and with several transcript alternatives', () => {
    const listening = startListening({ onTranscript: jest.fn() });
    const recognition = recognitions[0];

    expect(recognition.start).toHaveBeenCalled();
    expect(recognition.lang).toBe('ja-JP');
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);
    expect(recognition.maxAlternatives).toBe(5);

    listening.stop();
    expect(recognition.stop).toHaveBeenCalled();
  });

  it('reports the final parts with their alternatives and the interim part', () => {
    const heard = [];
    startListening({ onTranscript: update => heard.push(update) });

    recognitions[0].onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'これは' }, { transcript: 'こりは' }], { isFinal: true }),
        speechResult('水です', false),
      ],
    });
    expect(heard).toEqual([{ finals: [['これは', 'こりは']], interim: '水です' }]);
  });

  it('keeps listening when the browser ends the session on its own', () => {
    startListening({});
    const recognition = recognitions[0];
    recognition.start.mockClear();

    recognition.onend();
    expect(recognition.start).toHaveBeenCalledTimes(1);
  });

  it('stays stopped after stop(), even when the session ends', () => {
    const listening = startListening({});
    const recognition = recognitions[0];

    listening.stop();
    recognition.start.mockClear();
    recognition.onend();
    expect(recognition.start).not.toHaveBeenCalled();
  });

  it('silence is normal: the session restarts without an error', () => {
    const errors = [];
    startListening({ onError: error => errors.push(error) });
    const recognition = recognitions[0];

    recognition.onerror({ error: 'no-speech' });
    expect(errors).toEqual([]);
    recognition.start.mockClear();
    recognition.onend();
    expect(recognition.start).toHaveBeenCalled();
  });

  it('an error that ends listening for good is reported and never restarted', () => {
    const errors = [];
    startListening({ onError: error => errors.push(error) });
    const recognition = recognitions[0];

    recognition.onerror({ error: 'not-allowed' });
    expect(errors).toEqual(['not-allowed']);
    recognition.start.mockClear();
    recognition.onend();
    expect(recognition.start).not.toHaveBeenCalled();
  });

  it('gives up after too many silent restarts', () => {
    startListening({});
    const recognition = recognitions[0];
    recognition.start.mockClear();

    for (let session = 0; session < 40; session++) recognition.onend();
    expect(recognition.start).toHaveBeenCalledTimes(30);
  });

  it('returns null when listening is unsupported or cannot start', () => {
    delete window.SpeechRecognition;
    expect(startListening({})).toBeNull();

    window.SpeechRecognition = class extends FakeSpeechRecognition {
      constructor() {
        super();
        this.start = jest.fn(() => { throw new Error('no microphone'); });
      }
    };
    expect(startListening({})).toBeNull();
  });
});

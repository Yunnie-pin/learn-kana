import { speak, speakIfEnabled, isSoundEnabled, SOUND_SETTING_KEY } from './speech';

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

import React, { useState } from 'react'
import CheckMark from './CheckMark';
import Icon from './Icon';
import { useLanguage } from '../i18n';
import { isSpeechSupported, SOUND_SETTING_KEY } from '../speech';
import { getSentenceOptions } from '../sentences';
import { CHARACTER_ORDER_KEY, getCharacterOrder, getWordTopic, WORD_TOPIC_KEY } from '../practiceList';

// A row of mutually exclusive practice or answer modes.
function SegmentedControl(props) {
  return (
    <div className={`segmented-row${props.className ? ` ${props.className}` : ''}`}>
      <span className='segmented-label'>{props.label}</span>
      <div className='segmented-control' role='radiogroup' aria-label={props.label}>
        {props.options.map((option) => (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={props.value === option.value}
            className={'segmented-option' + (props.value === option.value ? ' active' : '')}
            disabled={option.disabled}
            title={option.disabled ? option.disabledReason : undefined}
            onClick={() => props.onChange(option.value)}
          >
            {option.icon && <Icon name={option.icon} className='segmented-option-icon' />}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Session length of each practice type: { characters: gameMode, words: ... }
const LIMITS_BY_PRACTICE_KEY = 'gameModeByPractice';

function readLimitsByPractice() {
  try {
    const stored = JSON.parse(localStorage.getItem(LIMITS_BY_PRACTICE_KEY));
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : null;
  } catch (error) {
    return null;
  }
}

// gameMode as the stepper shows it: { type: count | time | unlimited, count, minutes }
function toLimit(gameMode) {
  const isTime = gameMode?.type === "time-selector";
  const isUnlimited = !gameMode || (!isTime && gameMode.value === -1);
  const storedValue = Number(gameMode?.value) > 0 ? Number(gameMode.value) : 5;
  return {
    type: isUnlimited ? "unlimited" : isTime ? "time" : "count",
    count: !isUnlimited && !isTime ? storedValue : 5,
    minutes: isTime ? storedValue : 5,
  };
}

// The session length a practice type had last time. Before lengths were kept
// per practice type, the one length (gameMode) belongs to the type in use;
// a type never set before starts unlimited
function readPracticeLimit(practice) {
  const byPractice = readLimitsByPractice();
  if (byPractice && byPractice[practice]) return toLimit(byPractice[practice]);
  if (!byPractice) {
    try {
      return toLimit(JSON.parse(localStorage.getItem("gameMode")));
    } catch (error) { }
  }
  return toLimit(null);
}

export default function GameModeSelector(props) {
  const { t } = useLanguage();
  // Checks if the current device has a touchscreen
  const touchDefault = ('ontouchstart' in window | navigator.msMaxTouchPoints) === 1;
  if (localStorage.getItem('game-mode-kanji-readings') === null) {
    const showReadings =
      localStorage.getItem('game-mode-kanji-onyomi') === 'true' ||
      localStorage.getItem('game-mode-kanji-kunyomi') === 'true';
    localStorage.setItem('game-mode-kanji-readings', String(showReadings));
  }

  const [practice, setPractice] = useState(() => {
    const stored = localStorage.getItem('game-mode-practice') ||
      (localStorage.getItem("game-mode-word") === "true" ? "words" : "characters");
    // "kanji" used to be a practice type: kanji now come with "characters".
    // "srs" is the kanji review (flash cards, /game?mode=review)
    return ['words', 'mixed', 'long', 'srs'].includes(stored) ? stored : 'characters';
  });
  const [answerBy, setAnswerBy] = useState(() => {
    const storedTouch = localStorage.getItem("game-mode-touch");
    const useTouch = storedTouch === null ? touchDefault : storedTouch === "true";
    return useTouch && !['words', 'mixed', 'long'].includes(practice) ? "touch" : "typing";
  });

  React.useEffect(() => {
    localStorage.setItem("game-mode-practice", practice);
    localStorage.setItem("game-mode-word", practice === "words");
    if (['words', 'mixed', 'long'].includes(practice) && answerBy === 'touch') {
      setAnswerBy('typing');
    }
    localStorage.setItem("game-mode-touch", answerBy === "touch");
    if (props.onChange) {
      props.onChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice, answerBy]);

  // Characters practice: random (weakest more often) or in kana table order
  const [characterOrder, setCharacterOrder] = useState(getCharacterOrder);
  React.useEffect(() => {
    localStorage.setItem(CHARACTER_ORDER_KEY, characterOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterOrder]);

  // Words / mixed / sentence practice: everything, or only the IT and workplace ones
  const [wordTopic, setWordTopic] = useState(getWordTopic);
  React.useEffect(() => {
    localStorage.setItem(WORD_TOPIC_KEY, wordTopic);
    if (props.onChange) {
      props.onChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordTopic]);

  // Sentence practice: length, grammar pattern and kind of exercise
  const [sentenceOptions, setSentenceOptions] = useState(getSentenceOptions);
  const changeSentenceOption = (key, value) => setSentenceOptions(current => ({ ...current, [key]: value }));
  React.useEffect(() => {
    localStorage.setItem('game-mode-sentence-level', sentenceOptions.level);
    localStorage.setItem('game-mode-sentence-pattern', sentenceOptions.pattern);
    localStorage.setItem('game-mode-sentence-jlpt', sentenceOptions.jlpt);
    localStorage.setItem('game-mode-sentence-exercise', sentenceOptions.exercise);
    if (props.onChange) {
      props.onChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentenceOptions]);

  const handlePracticeChange = (value) => {
    setPractice(value);
    // The session length this practice type had last time
    setLimit(readPracticeLimit(value));
    if (['words', 'mixed', 'long'].includes(value)) {
      setAnswerBy("typing");
    }
  };

  // Session length: a number of kanas, a number of minutes or unlimited.
  // Stored as gameMode = { type: "kana-selector" | "time-selector", value }, value -1 means unlimited.
  // Each practice type remembers its own (10 sentences take as long as 50
  // characters): they are kept in LIMITS_BY_PRACTICE_KEY, and gameMode always
  // holds the one of the practice type picked, which the game reads.
  const [limit, setLimit] = useState(() => readPracticeLimit(practice));

  React.useEffect(() => {
    const gameMode = limit.type === "time"
      ? { type: "time-selector", value: limit.minutes }
      : { type: "kana-selector", value: limit.type === "count" ? limit.count : -1 };
    localStorage.setItem("gameMode", JSON.stringify(gameMode));
    const byPractice = readLimitsByPractice() || {};
    byPractice[practice] = gameMode;
    localStorage.setItem(LIMITS_BY_PRACTICE_KEY, JSON.stringify(byPractice));
    // practice: the limit is saved for the practice type it was set in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  // Kanas go up in steps of 5 until 50 and in steps of 10 after that, minutes in steps of 1
  const changeLimit = (direction) => {
    setLimit(current => {
      if (current.type === "time") {
        return { ...current, minutes: Math.max(1, current.minutes + direction) };
      }
      const step = current.count > 50 || (current.count === 50 && direction > 0) ? 10 : 5;
      return { ...current, count: Math.max(5, current.count + direction * step) };
    });
  };

  // The practice types; the options below each depend on the one picked
  const PRACTICES = [
    { value: 'characters', label: t('practiceCharacters'), icon: 'type' },
    { value: 'words', label: t('practiceWords'), icon: 'book-open' },
    { value: 'mixed', label: t('practiceMixed'), icon: 'shuffle' },
    { value: 'long', label: t('practiceLong'), icon: 'languages' },
    { value: 'srs', label: t('practiceSrs'), icon: 'rotate-ccw' },
  ];
  const PRACTICE_DESCRIPTION_KEYS = {
    characters: 'practiceCharactersDescription',
    words: 'practiceWordsDescription',
    mixed: 'practiceMixedDescription',
    long: 'practiceLongDescription',
    srs: 'practiceSrsDescription',
  };

  // The on / off options of the "More options" fold, and the practice types
  // they apply to
  const toggles = [
    { id: 'game-mode-hints', icon: 'lightbulb', label: t('optionHints'), defaultOn: true, show: practice !== 'srs' },
    { id: 'game-mode-random-fonts', icon: 'pen', label: t('optionHandwrittenFonts'), show: practice !== 'long' },
    { id: 'game-mode-auto-next', icon: 'skip-forward', label: t('optionAutoNext'), defaultOn: true, show: practice !== 'srs' },
    { id: SOUND_SETTING_KEY, icon: 'volume', label: t('optionSound'), show: isSpeechSupported() },
    // Kanji readings come with kanji questions and kanji words; sentences have
    // none, and the review cards always show them on their back
    {
      id: 'game-mode-kanji-readings', icon: 'languages', label: t('kanjiReadingsOption'),
      show: ['characters', 'words', 'mixed'].includes(practice),
      disabled: !props.kanjiSelected, disabledReason: t('kanjiReadingsDisabled'),
    },
  ].filter(toggle => toggle.show);
  // Recounts the options that are on when one is switched
  const [, setToggleVersion] = useState(0);
  const isToggleOn = (toggle) => !toggle.disabled && (
    localStorage.getItem(toggle.id) === null ? Boolean(toggle.defaultOn) : localStorage.getItem(toggle.id) === 'true'
  );
  const activeToggles = toggles.filter(isToggleOn).map(toggle => toggle.label);

  return (
    <div className='game-mode-selector-group'>
      <h2>{t('modeTitle')}</h2>

      {/* The practice type comes first: everything below depends on it */}
      <div className='practice-tabs' role='tablist' aria-label={t('practiceLabel')}>
        {PRACTICES.map(option => (
          <button
            key={option.value}
            type='button'
            role='tab'
            id={`practice-tab-${option.value}`}
            aria-selected={practice === option.value}
            aria-controls='practice-panel'
            className={'practice-tab' + (practice === option.value ? ' active' : '')}
            onClick={() => handlePracticeChange(option.value)}
          >
            <Icon name={option.icon} className='practice-tab-icon' />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      <p className='practice-description'>{t(PRACTICE_DESCRIPTION_KEYS[practice])}</p>

      {/* key: the panel fades in again when the practice type changes */}
      <div
        key={practice}
        className='game-mode-selector-segments practice-panel'
        role='tabpanel'
        id='practice-panel'
        aria-labelledby={`practice-tab-${practice}`}
      >
        {/* A review session is set by the schedule (due + new), not by a count or a time */}
        {practice !== 'srs' && (
          <div className='limit-setting'>
            <SegmentedControl
              label={t('limitLabel')}
              value={limit.type}
              onChange={(type) => setLimit(current => ({ ...current, type }))}
              options={[
                { value: "count", label: t('limitCount'), icon: 'hash' },
                { value: "time", label: t('limitTime'), icon: 'timer' },
                { value: "unlimited", label: t('modeUnlimited'), icon: 'infinity' },
              ]}
            />
            {limit.type !== "unlimited" && (
              <div className='limit-stepper'>
                <button type='button' aria-label={t('limitDecrease')} onClick={() => changeLimit(-1)}><Icon name='minus' strokeWidth={2.5} /></button>
                <span aria-live='polite'>
                  {limit.type === "time"
                    ? t('modeMinutes', { count: limit.minutes })
                    : t('modeCount', { count: limit.count, practice })}
                </span>
                <button type='button' aria-label={t('limitIncrease')} onClick={() => changeLimit(1)}><Icon name='plus' strokeWidth={2.5} /></button>
              </div>
            )}
          </div>
        )}
        {practice === 'characters' && (
          <SegmentedControl
            className='character-order-row'
            label={t('characterOrderLabel')}
            value={characterOrder}
            onChange={setCharacterOrder}
            options={[
              { value: 'random', label: t('characterOrderRandom'), icon: 'shuffle' },
              { value: 'sequential', label: t('characterOrderSequential'), icon: 'arrow-right' },
            ]}
          />
        )}
        {/* One topic for the words and the sentences: "IT & work" keeps their IT and workplace ones */}
        {(practice === 'words' || practice === 'mixed' || practice === 'long') && (
          <SegmentedControl
            className='word-topic-row'
            label={t('wordTopicLabel')}
            value={wordTopic}
            onChange={setWordTopic}
            options={[
              { value: 'all', label: t('wordTopicAll'), icon: 'book-open' },
              { value: 'it', label: t('wordTopicIt'), icon: 'keyboard' },
            ]}
          />
        )}
        {/* Multiple choice only works with single characters: words and
            sentences are typed, review cards are graded */}
        {practice === 'characters' && (
          <SegmentedControl
            className='answer-mode-row'
            label={t('answerByLabel')}
            value={answerBy}
            onChange={setAnswerBy}
            options={[
              { value: "typing", label: t('answerTyping'), icon: 'keyboard' },
              { value: "touch", label: t('answerMultipleChoice'), icon: 'grid' },
            ]}
          />
        )}
        {practice === 'long' && (
          <>
            <SegmentedControl
              className='sentence-exercise-row'
              label={t('sentenceExerciseLabel')}
              value={sentenceOptions.exercise}
              onChange={(value) => changeSentenceOption('exercise', value)}
              options={[
                { value: 'type', label: t('sentenceExerciseType'), icon: 'keyboard' },
                { value: 'listen', label: t('sentenceExerciseListen'), icon: 'volume', disabled: !isSpeechSupported(), disabledReason: t('sentenceExerciseListenDisabled') },
                { value: 'particle', label: t('sentenceExerciseParticle'), icon: 'target' },
                { value: 'arrange', label: t('sentenceExerciseArrange'), icon: 'shuffle' },
              ]}
            />
            <SegmentedControl
              className='sentence-jlpt-row'
              label={t('sentenceJlptLabel')}
              value={sentenceOptions.jlpt}
              onChange={(value) => changeSentenceOption('jlpt', value)}
              options={[
                { value: 'all', label: t('sentenceAll') },
                { value: 'N5', label: 'N5' },
                { value: 'N4', label: 'N4' },
              ]}
            />
            <SegmentedControl
              className='sentence-level-row'
              label={t('sentenceLevelLabel')}
              value={sentenceOptions.level}
              onChange={(value) => changeSentenceOption('level', value)}
              options={[
                { value: 'all', label: t('sentenceAll') },
                { value: 'easy', label: t('sentenceLevelEasy') },
                { value: 'medium', label: t('sentenceLevelMedium') },
                { value: 'hard', label: t('sentenceLevelHard') },
              ]}
            />
            <SegmentedControl
              className='sentence-pattern-row'
              label={t('sentencePatternLabel')}
              value={sentenceOptions.pattern}
              onChange={(value) => changeSentenceOption('pattern', value)}
              options={[
                { value: 'all', label: t('sentenceAll') },
                { value: 'desu', label: '〜です' },
                { value: 'verb', label: '〜ます' },
                { value: 'exist', label: 'あります' },
                { value: 'question', label: '〜か' },
              ]}
            />
          </>
        )}
      </div>

      {/* The on / off options are set once and rarely changed: folded, with
          the ones that are on listed next to the title */}
      <details className='more-options'>
        <summary>
          <span className='more-options-title'>{t('moreOptions')}</span>
          <span className='more-options-active'>{activeToggles.length ? activeToggles.join(' · ') : t('moreOptionsNone')}</span>
        </summary>
        <div className='game-mode-selector-button-group'>
          {toggles.map(toggle => (
            <CheckMark
              key={toggle.id}
              characterText={<><Icon name={toggle.icon} className='icon-leading' />{toggle.label}</>}
              class="game-mode-selector-button-group-row-2"
              id={toggle.id}
              default={toggle.defaultOn ? 'true' : undefined}
              disabled={toggle.disabled}
              disabledReason={toggle.disabledReason}
              onChange={() => setToggleVersion(version => version + 1)}
            />
          ))}
        </div>
      </details>
    </div>
  )
}

// Opens the Learning Progress window (owned by GameMenu) from elsewhere, e.g. a navbar notification,
// at a given section, which is then highlighted so the user learns where that feature lives
export const OPEN_PROGRESS_EVENT = 'learn-kana:open-progress';

// Section -> the tab it is on (null: above the tabs, any tab shows it)
export const PROGRESS_SECTIONS = {
  weakest: null,
  confusions: 'activity',
};

export function openLearningProgress(section) {
  window.dispatchEvent(new CustomEvent(OPEN_PROGRESS_EVENT, { detail: { section } }));
}

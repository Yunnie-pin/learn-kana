import React, { useRef } from 'react';
import { downloadBackup, readBackup, restoreBackup } from '../statsStorage.js';

// Saves all progress to a file and loads it back, e.g. on another device
function BackupPanel({ t }) {
  const fileInputRef = useRef(null);

  function exportProgress() {
    downloadBackup();
  }

  async function importProgress(event) {
    const file = event.target.files[0];
    // Picking the same file again must fire change again
    event.target.value = '';
    if (!file) return;

    let data = null;
    try {
      data = readBackup(JSON.parse(await file.text()));
    } catch (error) {
      data = null;
    }
    if (!data) {
      alert(t('backupInvalid'));
      return;
    }
    if (!window.confirm(t('backupConfirm'))) return;
    restoreBackup(data);
    window.location.reload();
  }

  return (
    <div className='progress-activity-calendar-block'>
      <div className='progress-stats-weakest-header progress-activity-panel-header'>
        <span>{t('backupTitle')}</span>
      </div>
      <p className='progress-stats-weakest-empty'>{t('backupDescription')}</p>
      <div className='backup-panel-buttons'>
        <button className='progress-stats-weakest-button' onClick={exportProgress}>{t('backupExport')}</button>
        <button className='progress-stats-weakest-button backup-panel-import' onClick={() => fileInputRef.current.click()}>
          {t('backupImport')}
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='application/json,.json'
          hidden
          onChange={importProgress}
        />
      </div>
    </div>
  );
}

export default BackupPanel;

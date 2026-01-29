import { useEffect, useState } from 'react';
import { X, Download, Sparkles } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { openUrl } from '@tauri-apps/plugin-opener';
import './UpdateNotification.css';

interface UpdateInfo {
  has_update: boolean;
  latest_version: string;
  current_version: string;
  download_url: string;
}

interface UpdateNotificationProps {
  onClose: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const info = await invoke<UpdateInfo>('check_for_updates');
      if (info.has_update) {
        setUpdateInfo(info);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      onClose();
    }
  };

  const handleDownload = async () => {
    if (updateInfo?.download_url) {
      try {
        await openUrl(updateInfo.download_url);
      } catch {
        // Fallback to window.open if plugin fails
        window.open(updateInfo.download_url, '_blank');
      }
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!updateInfo) {
    return null;
  }

  return (
    <div className="modal-overlay update-overlay" onClick={handleClose}>
      <div className="modal update-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="update-modal-title">
            <span className="update-icon">
              <Sparkles size={18} />
            </span>
            {t('update_notification.title')}
          </h2>
          <button className="modal-close" onClick={handleClose} aria-label={t('common.cancel')}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body update-modal-body">
          <div className="update-version">v{updateInfo.latest_version}</div>
          <p className="update-message">
            {t('update_notification.message', { current: updateInfo.current_version })}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} />
            {t('update_notification.action')}
          </button>
        </div>
      </div>
    </div>
  );
};

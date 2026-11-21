import React, { useState } from 'react';
import { AppLanguage } from '../types/game';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { triggerUsbOfflineDownload } from '../utils/usbOfflineExporter';
import {
  Download,
  HardDriveDownload,
  WifiOff,
  CheckCircle2,
  X,
  Smartphone,
} from 'lucide-react';

interface OfflineControlsProps {
  language: AppLanguage;
}

export const PWAInstallButton: React.FC<OfflineControlsProps> = ({
  language,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="px-3.5 py-2 bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] font-bold text-xs sm:text-sm rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>
          {language === 'id'
            ? 'Pasang Aplikasi Offline'
            : 'Install Offline App'}
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuideModal(true)}
        className="px-3.5 py-2 bg-[#0B2249] dark:bg-[#14B8C4] hover:bg-[#12336B] dark:hover:bg-[#2DD4BF] text-white dark:text-[#062134] font-bold text-xs sm:text-sm rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Smartphone className="w-4 h-4" />
        <span>
          {isIOS
            ? language === 'id'
              ? 'Pasang di iPad / iPhone'
              : 'Install on iPhone / iPad'
            : language === 'id'
            ? 'Pasang Offline di Perangkat'
            : 'Install Offline on Device'}
        </span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071731]/80 backdrop-blur-sm p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-[#0B2249] dark:text-white">
                {language === 'id'
                  ? 'Pasang untuk Bermain Offline'
                  : 'Install App for Offline Play'}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg bg-[#E8F5F8] dark:bg-[#122E5E] text-[#0B2249] dark:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {isIOS ? (
              <p className="text-xs sm:text-sm text-[#466284] dark:text-[#B8D4EE] leading-relaxed">
                {language === 'id'
                  ? '1. Ketuk tombol Bagikan (Share) di browser Safari.\n2. Gulir ke bawah dan pilih "Tambah ke Layar Utama" (Add to Home Screen).'
                  : '1. Tap the Share button in your Safari toolbar.\n2. Scroll down and tap "Add to Home Screen" so children can launch LearnLink offline anytime.'}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-[#466284] dark:text-[#B8D4EE] leading-relaxed">
                {language === 'id'
                  ? 'Buka menu browser (⋮) lalu pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama". Atau gunakan tombol Simpan ke USB (.html) untuk menyalin langsung ke flashdisk USB!'
                  : 'Open your browser menu (⋮) and choose "Install App" / "Add to Home Screen", or use the Save for USB (.html) button to copy a single self-contained game file onto any USB flash drive.'}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 rounded-lg bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] font-bold text-xs cursor-pointer"
            >
              {language === 'id' ? 'Mengerti' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC<OfflineControlsProps> = ({
  language,
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-12 left-4 z-40 flex items-center gap-2 rounded-lg bg-[#0B2249] border border-[#14B8C4] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
      <WifiOff className="w-3.5 h-3.5 text-[#2DD4BF]" />
      <span>
        {language === 'id'
          ? 'Mode Offline Aktif — Semua 37 Permainan Siap Dimainkan'
          : 'Offline Mode Active — All 37 Games Ready'}
      </span>
    </div>
  );
};

export const UsbOfflineSaveCard: React.FC<OfflineControlsProps> = ({
  language,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadUsb = () => {
    triggerUsbOfflineDownload();
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 3500);
  };

  return (
    <section className="rounded-xl bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-xs font-semibold text-[#0D949E] dark:text-[#2DD4BF]">
            {language === 'id'
              ? 'Mode Offline & Penyimpanan Flashdisk USB'
              : language === 'en'
              ? '100% Offline Classroom & USB Flash Drive Edition'
              : '100% Offline & USB Flash Drive Edition · Simpan ke USB'}
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold font-display text-[#0B2249] dark:text-white">
            {language === 'id'
              ? 'Simpan Seluruh Portal 37 Permainan ke USB (Tanpa Internet)'
              : language === 'en'
              ? 'Save the Entire 37-Game Portal to a USB Drive'
              : 'Save the Entire 37-Game Portal to a USB Drive'}
          </h2>
          <p className="text-xs sm:text-sm text-[#466284] dark:text-[#B8D4EE] leading-relaxed">
            {language === 'id'
              ? 'Unduh satu file HTML lengkap berisi seluruh 37 permainan otak & susun kalimat Bahasa Inggris–Indonesia, bunyi lonceng, konfeti, dan pengucapan suara. Salin file tersebut ke flashdisk USB dan klik dua kali di komputer atau tablet mana saja tanpa internet.'
              : language === 'en'
              ? 'Download a single self-contained HTML file with all 37 bilingual English–Indonesian brain games, sentence scrambles, audio chimes, confetti, and speech pronunciation. Copy it onto any USB stick and double-click on any computer — zero internet required.'
              : 'Download a single self-contained HTML file with all 37 bilingual games, audio chimes, confetti, and speech pronunciation — copy it onto a USB drive and double-click to play anywhere with zero internet. · Unduh satu file HTML lengkap untuk disalin ke USB dan dimainkan di mana saja tanpa internet.'}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadUsb}
            className="px-4 py-2.5 bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] font-extrabold text-xs sm:text-sm rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'id'
                    ? 'File USB Terunduh!'
                    : 'USB File Downloaded!'}
                </span>
              </>
            ) : (
              <>
                <HardDriveDownload className="w-4 h-4" />
                <span>
                  {language === 'id'
                    ? 'Simpan ke USB (.html)'
                    : 'Save to USB (.html)'}
                </span>
              </>
            )}
          </button>

          <PWAInstallButton language={language} />
        </div>
      </div>

      {/* 3 Simple Steps for Orphanage Teachers / Caregivers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#D7EEF3] dark:border-[#1E447D] text-xs text-[#466284] dark:text-[#B8D4EE]">
        <div>
          <strong className="text-[#0B2249] dark:text-white">
            1. {language === 'id' ? 'Unduh File USB' : 'Download USB File'}
          </strong>
          <p className="mt-0.5">
            {language === 'id'
              ? 'Klik "Simpan ke USB (.html)" untuk menyimpan LearnLink-Brain-Workout-Offline-USB.html.'
              : 'Click "Save to USB (.html)" to save LearnLink-Brain-Workout-Offline-USB.html.'}
          </p>
        </div>
        <div>
          <strong className="text-[#0B2249] dark:text-white">
            2. {language === 'id' ? 'Salin ke Flashdisk USB' : 'Copy to USB Stick'}
          </strong>
          <p className="mt-0.5">
            {language === 'id'
              ? 'Pindahkan file HTML tunggal itu ke flashdisk USB untuk dibagikan ke komputer kelas.'
              : 'Drag that single HTML file onto any USB flash drive to carry between classroom computers.'}
          </p>
        </div>
        <div>
          <strong className="text-[#0B2249] dark:text-white">
            3. {language === 'id' ? 'Klik 2× Tanpa Internet' : 'Double-Click Offline'}
          </strong>
          <p className="mt-0.5">
            {language === 'id'
              ? 'Buka file langsung di Chrome, Edge, atau Safari — semua 37 permainan berjalan 100% offline!'
              : 'Double-click the file in Chrome, Edge, or Safari — all 37 games work 100% offline!'}
          </p>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { AppLanguage } from '../types/game';
import { UsbOfflineSaveCard } from './OfflineControls';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Film,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

interface LearnLinkPromoPageProps {
  language: AppLanguage;
  onReturnToGame: () => void;
}

interface PromoVideoItem {
  id: string;
  src: string;
  poster: string;
  titleEn: string;
  titleId: string;
  captionEn: string;
  captionId: string;
}

interface ToolShowcaseItem {
  id: string;
  kickerEn: string;
  kickerId: string;
  name: string;
  url: string;
  displayUrl: string;
  summaryEn: string;
  summaryId: string;
  highlightsEn: string[];
  highlightsId: string[];
  images: {
    src: string;
    labelEn: string;
    labelId: string;
    aspect: 'landscape' | 'portrait';
  }[];
}

const PROMO_VIDEOS: PromoVideoItem[] = [
  {
    id: 'promo_1',
    src: '/assets/aistudio/gemini_generated_video_478848f9_27336089.mp4',
    poster:
      '/assets/aistudio/Screenshot_20261023_163829_Chrome_3088d235.jpg',
    titleEn: 'LearnLink Promo Reel 1',
    titleId: 'Video Promo LearnLink 1',
    captionEn:
      'Discover how LearnLink connects visual lessons, bilingual English practice, and daily learning tools in one ecosystem.',
    captionId:
      'Lihat bagaimana LearnLink menghubungkan pelajaran visual, latihan Bahasa Inggris dwibahasa, dan alat belajar harian dalam satu sistem.',
  },
  {
    id: 'promo_2',
    src: '/assets/aistudio/gemini_generated_video_f3812b17_fa9599ef.mp4',
    poster:
      '/assets/aistudio/Screenshot_20261023_155337_Chrome_22a07515.jpg',
    titleEn: 'LearnLink Promo Reel 2',
    titleId: 'Video Promo LearnLink 2',
    captionEn:
      'Interactive classroom tools, guided daily schedules, and engaging visual English builders designed for children and educators.',
    captionId:
      'Alat kelas interaktif, jadwal harian terpandu, dan penyusun kalimat Bahasa Inggris visual yang dirancang untuk anak-anak dan guru.',
  },
];

const LEARNLINK_TOOLS: ToolShowcaseItem[] = [
  {
    id: 'learnlink_portal',
    kickerEn: '01. Interactive English Mastery',
    kickerId: '01. Portal Belajar Bahasa Inggris Interaktif',
    name: 'LearnLink Portal',
    url: 'https://learn-link-app.vercel.app',
    displayUrl: 'learn-link-app.vercel.app',
    summaryEn:
      'A complete English learning hub featuring interactive Alphabet, Numbers & Colors, Vocabulary, Real-Life Scenarios, Video Lessons, AI Chat, Pronunciation, Translation, Word Match, and Flipbooks.',
    summaryId:
      'Pusat belajar Bahasa Inggris lengkap dengan Alfabet, Angka & Warna, Kosakata, Skenario Harian, Pelajaran Video, Obrolan AI, Pelafalan, Terjemahan, Cocok Kata, dan Flipbook.',
    highlightsEn: [
      'Alphabet, Numbers, Colors & Core Vocabulary',
      'Pronunciation, Sentences & Live Translation',
      'Word Match, Identify Object, Flipbook & Video Lessons',
    ],
    highlightsId: [
      'Alfabet, Angka, Warna & Kosakata Dasar',
      'Pelafalan, Kalimat & Terjemahan Langsung',
      'Cocok Kata, Kenali Benda, Flipbook & Pelajaran Video',
    ],
    images: [
      {
        src: '/assets/aistudio/Screenshot_20261023_163829_Chrome_3088d235.jpg',
        labelEn: 'LearnLink Portal Home',
        labelId: 'Beranda LearnLink Portal',
        aspect: 'landscape',
      },
    ],
  },
  {
    id: 'bilingual_master',
    kickerEn: '02. Bilingual Teacher & Student Kit',
    kickerId: '02. Bahan Ajar Interaktif Guru & Murid',
    name: 'LearnLink Bilingual Master Language',
    url: 'https://learnlink-bilingual-master-language.vercel.app',
    displayUrl: 'learnlink-bilingual-master-language.vercel.app',
    summaryEn:
      'Ready-to-teach interactive English–Indonesian lessons built around 90+ visual S+V+O slides, an interactive Driving Simulator HUD, and Reverse Simon Says games — with Free Unit 01 access requiring no PIN or login.',
    summaryId:
      'Bahan ajar interaktif Bahasa Inggris–Indonesia siap pakai dengan 90+ slide visual S+V+O, Simulator Mobil interaktif, dan game Reverse Simon Says — gratis coba Unit 01 tanpa PIN atau login.',
    highlightsEn: [
      '90+ Visual S+V+O (Person · Action · Object) Interactive Slides',
      'Driving Simulator HUD & Reverse Simon Says Classroom Games',
      '7 Complete Interactive Units — Free Unit 01 Preview',
    ],
    highlightsId: [
      '90+ Slide Visual S+V+O (Subjek · Kata Kerja · Objek)',
      'Simulator Mobil HUD & Permainan Reverse Simon Says',
      '7 Unit Lengkap Interaktif — Gratis Coba Unit 01',
    ],
    images: [
      {
        src: '/assets/aistudio/Gemini_Generated_Image_imtskuimtskuimts_dbd499fa.jpeg',
        labelEn: '90+ Visual S+V+O Slides & Simulators',
        labelId: '90+ Slide Visual S+V+O & Simulator',
        aspect: 'portrait',
      },
      {
        src: '/assets/aistudio/Gemini_Generated_Image_8uvwa28uvwa28uvw_30611153.jpeg',
        labelEn: 'Free Unit 01 & Full 7-Unit License',
        labelId: 'Gratis Unit 01 & Lisensi 7 Unit Lengkap',
        aspect: 'portrait',
      },
    ],
  },
  {
    id: 'dominion_freedom_guide',
    kickerEn: '03. Daily Life & Special-Needs Classroom Suite',
    kickerId: '03. Panduan Kehidupan Harian & Kelas Anak',
    name: 'Dominion Freedom Guide',
    url: 'https://dominion-freedom-guide-20.vercel.app',
    displayUrl: 'dominion-freedom-guide-20.vercel.app',
    summaryEn:
      'A structured daily communication and life-skills system featuring visual picture boards (Meals, Water, Wardrobe, Transport, Security), bilingual Live Message Feed, My Daily Schedule checklists, School Calendar, Calculator, and Maps.',
    summaryId:
      'Sistem komunikasi visual dan keterampilan harian dengan papan gambar (Makan, Air, Pakaian, Transportasi, Keamanan), pesan dwibahasa langsung, Jadwal Harian Anak, Kalender Sekolah, Kalkulator, dan Peta.',
    highlightsEn: [
      'Visual Communication Board with Formal, Endearment & Peer Modes',
      'My Daily Schedule (15-Step Morning & Afternoon Visual Checklist)',
      'Built-in School Calendar, Classroom Calculator & Maps',
    ],
    highlightsId: [
      'Papan Komunikasi Visual dengan Mode Formal, Kasih Sayang & Teman',
      'Jadwal Harianku (Daftar Visual Pagi & Sore 15 Langkah)',
      'Kalender Sekolah, Kalkulator Kelas & Peta Interaktif',
    ],
    images: [
      {
        src: '/assets/aistudio/Screenshot_20261023_155337_Chrome_22a07515.jpg',
        labelEn: 'Visual Communication Board',
        labelId: 'Papan Komunikasi Visual',
        aspect: 'landscape',
      },
      {
        src: '/assets/aistudio/Screenshot_20261023_155657_Chrome_8ed66b8e.jpg',
        labelEn: 'Daily Schedule (Now & Next)',
        labelId: 'Jadwal Harian (Sekarang & Berikutnya)',
        aspect: 'landscape',
      },
      {
        src: '/assets/aistudio/Screenshot_20261023_155711_Chrome_66c6dcea.jpg',
        labelEn: 'Morning Routine Checklist',
        labelId: 'Daftar Rutinitas Pagi',
        aspect: 'landscape',
      },
      {
        src: '/assets/aistudio/Screenshot_20261023_155458_Chrome_8b0d32ac.jpg',
        labelEn: 'School Calendar',
        labelId: 'Kalender Sekolah',
        aspect: 'landscape',
      },
      {
        src: '/assets/aistudio/Screenshot_20261023_155515_Chrome_6459f238.jpg',
        labelEn: 'Classroom Calculator & Live Feed',
        labelId: 'Kalkulator Kelas & Pesan Langsung',
        aspect: 'landscape',
      },
      {
        src: '/assets/aistudio/Screenshot_20261023_155536_Google_938d8cbd.jpg',
        labelEn: 'Interactive Maps Module',
        labelId: 'Modul Peta Interaktif',
        aspect: 'landscape',
      },
    ],
  },
  {
    id: 'kids_word_unscrambler',
    kickerEn: '04. Unscramble Pals · Picture Words & Alignment',
    kickerId: '04. Unscramble Pals · Kata Bergambar & Penyelarasan Belajar',
    name: 'Kids Word Unscrambler',
    url: 'https://kids-word-unscrambler.vercel.app',
    displayUrl: 'kids-word-unscrambler.vercel.app',
    summaryEn:
      'A joyful bilingual spelling and learning companion featuring Unscramble Pals: Mira’s Spelling Meadow with a 130+ EN & ID picture word library, Dolly-Ann’s Alignment Studio (Mind, Heart & Action lamps), Ziggy’s Puzzles, and Echo Owl episode videos.',
    summaryId:
      'Teman belajar mengeja dwibahasa yang menyenangkan bersama Unscramble Pals: Mira’s Spelling Meadow dengan 130+ pustaka kata bergambar Inggris & Indonesia, Studio Penyelarasan Dolly-Ann (Lampu Pikiran, Hati & Tindakan), Puzzle Ziggy, dan video episode Echo Owl.',
    highlightsEn: [
      'Mira’s Spelling Meadow: 130+ English & Bahasa Indonesia 3D Picture Words',
      'Dolly-Ann’s Alignment Studio: Activate Mind, Heart & Action Learning Lamps',
      'Ziggy’s Puzzles (Bus, Horse, Dome & Whale) & Echo Owl Video Episodes',
    ],
    highlightsId: [
      'Mira’s Spelling Meadow: 130+ Kata Bergambar 3D Bahasa Inggris & Indonesia',
      'Studio Penyelarasan Dolly-Ann: Aktifkan Lampu Pikiran, Hati & Tindakan',
      'Puzzle Ziggy (Bus, Kuda, Kubah & Paus) serta Video Episode Echo Owl',
    ],
    images: [
      {
        src: '/assets/aistudio/Screenshot_2026-11-21-09-58-28-27_40deb401b9ffe8e1df2f1cc5ba480b12_38b01dde.jpg',
        labelEn: 'Unscramble Pals Home',
        labelId: 'Beranda Unscramble Pals',
        aspect: 'portrait',
      },
      {
        src: '/assets/aistudio/Screenshot_2026-11-21-09-59-05-12_40deb401b9ffe8e1df2f1cc5ba480b12_a916f36a.jpg',
        labelEn: "Mira's 130+ Picture Word Library",
        labelId: 'Pustaka 130+ Kata Bergambar Mira',
        aspect: 'portrait',
      },
      {
        src: '/assets/aistudio/Screenshot_2026-11-21-09-58-42-88_40deb401b9ffe8e1df2f1cc5ba480b12_78739624.jpg',
        labelEn: "Dolly-Ann's Alignment Studio",
        labelId: 'Studio Penyelarasan Dolly-Ann',
        aspect: 'portrait',
      },
      {
        src: '/assets/aistudio/Screenshot_2026-11-21-09-58-51-87_40deb401b9ffe8e1df2f1cc5ba480b12_1ccce3a3.jpg',
        labelEn: '3 Learning Lamps (Mind, Heart & Action)',
        labelId: '3 Lampu Belajar (Pikiran, Hati & Tindakan)',
        aspect: 'portrait',
      },
    ],
  },
];

export const LearnLinkPromoPage: React.FC<LearnLinkPromoPageProps> = ({
  language,
  onReturnToGame,
}) => {
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const [selectedImageIdxByTool, setSelectedImageIdxByTool] = useState<
    Record<string, number>
  >({});
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    images: { src: string; labelEn: string; labelId: string }[];
    index: number;
    toolName: string;
  } | null>(null);

  const activeVideo = PROMO_VIDEOS[activeVideoIdx];

  const handleCopyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback if clipboard API unavailable
    }
    setCopiedUrlId(id);
    window.setTimeout(() => {
      setCopiedUrlId((prev) => (prev === id ? null : prev));
    }, 2200);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 space-y-10">
      {/* Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#C5E4EC] dark:border-[#1E447D]">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-semibold text-[#0D949E] dark:text-[#2DD4BF]">
            {language === 'id'
              ? 'Ekosistem Pendidikan LearnLink · Alat Belajar Lainnya'
              : language === 'en'
              ? 'LearnLink Educational Learning System · Companion Tools'
              : 'LearnLink Educational Learning System · Ekosistem Alat Belajar'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-[#0B2249] dark:text-white text-balance">
            {language === 'id'
              ? 'Jelajahi Alat Belajar LearnLink Lainnya'
              : language === 'en'
              ? 'Explore Our LearnLink Learning Tools'
              : 'Explore Our LearnLink Learning Tools'}
          </h1>
          <p className="text-sm sm:text-base text-[#466284] dark:text-[#B8D4EE] leading-relaxed">
            {language === 'id'
              ? 'Tonton video promo resmi LearnLink dan temukan aplikasi belajar Bahasa Inggris, bahan ajar visual dwibahasa, serta alat jadwal harian anak yang dirancang untuk ruang kelas dan rumah.'
              : language === 'en'
              ? 'Watch the official LearnLink promo videos and explore our interactive English portals, bilingual visual teaching slides, and structured daily classroom tools.'
              : 'Watch the LearnLink promo videos and explore our interactive English portals, bilingual visual slides, and daily classroom tools. · Tonton video promo LearnLink dan jelajahi alat belajar Bahasa Inggris serta jadwal kelas interaktif kami.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onReturnToGame}
          className="px-4 py-2.5 bg-[#0B2249] dark:bg-[#14B8C4] hover:bg-[#12336B] dark:hover:bg-[#2DD4BF] text-white dark:text-[#062134] font-semibold text-xs sm:text-sm rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start sm:self-end cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {language === 'id'
              ? 'Kembali ke Permainan'
              : language === 'en'
              ? 'Back to Game'
              : 'Back to Game · Main'}
          </span>
        </button>
      </div>

      {/* Focal Anchor: Official LearnLink Promo Video Theater */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0B2249] dark:text-white">
            <Film className="w-4 h-4 text-[#14B8C4]" />
            <span>
              {language === 'id'
                ? activeVideo.titleId
                : language === 'en'
                ? activeVideo.titleEn
                : `${activeVideo.titleEn} · ${activeVideo.titleId}`}
            </span>
          </div>

          {/* Segmented Video Reel Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#E8F5F8] dark:bg-[#0D244B] rounded-lg border border-[#C5E4EC] dark:border-[#1E447D]">
            {PROMO_VIDEOS.map((vid, idx) => (
              <button
                key={vid.id}
                type="button"
                onClick={() => setActiveVideoIdx(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeVideoIdx === idx
                    ? 'bg-[#0B2249] dark:bg-[#14B8C4] text-white dark:text-[#062134] shadow-sm'
                    : 'text-[#466284] dark:text-[#A9C8E8] hover:text-[#0B2249] dark:hover:text-white'
                }`}
              >
                {language === 'id' ? `Video Promo ${idx + 1}` : `Promo Video ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Single-Elevation Video Container */}
        <div className="rounded-xl overflow-hidden bg-[#071731] border-2 border-[#0B2249] dark:border-[#14B8C4]/50 shadow-sm">
          <video
            key={activeVideo.src}
            src={activeVideo.src}
            poster={activeVideo.poster}
            controls
            playsInline
            preload="metadata"
            className="w-full aspect-video max-h-[520px] bg-black object-contain"
          >
            Your browser does not support embedded video playback.
          </video>
        </div>

        <p className="text-xs sm:text-sm text-[#466284] dark:text-[#A9C8E8] max-w-3xl">
          {language === 'id'
            ? activeVideo.captionId
            : language === 'en'
            ? activeVideo.captionEn
            : `${activeVideo.captionEn} — ${activeVideo.captionId}`}
        </p>
      </section>

      {/* 100% Offline & USB Portable Classroom Save Section */}
      <UsbOfflineSaveCard language={language} />

      {/* Clean Hairline Divider */}
      <hr className="border-[#C5E4EC] dark:border-[#1E447D]" />

      {/* 4 Curated LearnLink Companion Tools */}
      <section className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-[#0B2249] dark:text-white">
            {language === 'id'
              ? 'Alat Belajar Lainnya dari LearnLink'
              : language === 'en'
              ? 'Our Other LearnLink Tools'
              : 'Our Other LearnLink Tools · Alat Belajar LearnLink Lainnya'}
          </h2>
          <p className="text-xs sm:text-sm text-[#466284] dark:text-[#A9C8E8]">
            {language === 'id'
              ? 'Ketuk gambar mana saja untuk memperbesar, atau buka tautan alat belajar secara langsung.'
              : language === 'en'
              ? 'Click any preview image to enlarge, or launch each LearnLink learning tool directly.'
              : 'Click any preview image to enlarge, or launch each tool directly. · Ketuk gambar untuk memperbesar atau buka tautan alat belajar.'}
          </p>
        </div>

        <div className="space-y-10">
          {LEARNLINK_TOOLS.map((tool) => {
            const currentImgIdx = selectedImageIdxByTool[tool.id] || 0;
            const activeImg = tool.images[currentImgIdx] || tool.images[0];
            const isCopied = copiedUrlId === tool.id;

            return (
              <article
                key={tool.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pb-10 border-b border-[#C5E4EC] dark:border-[#1E447D] last:border-b-0 last:pb-0"
              >
                {/* Media Preview Column */}
                <div className="lg:col-span-6 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox({
                        images: tool.images,
                        index: currentImgIdx,
                        toolName: tool.name,
                      })
                    }
                    className="group relative block w-full rounded-xl overflow-hidden bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#14B8C4]"
                    title="Enlarge preview"
                  >
                    <img
                      src={activeImg.src}
                      alt={`${tool.name} — ${activeImg.labelEn}`}
                      referrerPolicy="no-referrer"
                      className={`w-full transition-transform duration-300 group-hover:scale-[1.01] ${
                        activeImg.aspect === 'portrait'
                          ? 'max-h-[420px] object-contain bg-[#0B2249]'
                          : 'aspect-[16/10] object-cover object-top'
                      }`}
                    />
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-[#0B2249]/90 text-white text-[11px] font-medium rounded-md inline-flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3 text-[#2DD4BF]" />
                      <span>
                        {language === 'id' ? 'Perbesar' : 'Enlarge'}
                      </span>
                    </span>
                  </button>

                  {/* Clean Thumbnail Switcher if a tool has multiple screenshots */}
                  {tool.images.length > 1 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tool.images.map((img, idx) => (
                        <button
                          key={img.src}
                          type="button"
                          onClick={() =>
                            setSelectedImageIdxByTool((prev) => ({
                              ...prev,
                              [tool.id]: idx,
                            }))
                          }
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            currentImgIdx === idx
                              ? 'bg-[#14B8C4] text-[#062134]'
                              : 'bg-[#E8F5F8] dark:bg-[#0D244B] text-[#0B2249] dark:text-[#CBE7F0] border border-[#C5E4EC] dark:border-[#1E447D] hover:bg-[#D5EEF4] dark:hover:bg-[#122E5E]'
                          }`}
                        >
                          {language === 'id' ? img.labelId : img.labelEn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editorial Details Column */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-[#0D949E] dark:text-[#2DD4BF]">
                      {language === 'id' ? tool.kickerId : tool.kickerEn}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold font-display text-[#0B2249] dark:text-white">
                      {tool.name}
                    </h3>
                    <div className="text-xs font-mono text-[#0D949E] dark:text-[#2DD4BF]">
                      {tool.displayUrl}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-[#355275] dark:text-[#CBE7F0] leading-relaxed">
                    {(language === 'en' || language === 'bilingual') && (
                      <p>{tool.summaryEn}</p>
                    )}
                    {(language === 'id' || language === 'bilingual') && (
                      <p
                        className={
                          language === 'bilingual'
                            ? 'text-[#557293] dark:text-[#9FC0E2] text-xs sm:text-sm'
                            : ''
                        }
                      >
                        {tool.summaryId}
                      </p>
                    )}
                  </div>

                  {/* Clean Unboxed Feature List */}
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[#0B2249] dark:text-[#E2F2F8]">
                    {(language === 'id'
                      ? tool.highlightsId
                      : tool.highlightsEn
                    ).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="text-[#14B8C4] font-bold mt-0.5"
                        >
                          ·
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#0B2249] dark:bg-[#14B8C4] hover:bg-[#12336B] dark:hover:bg-[#2DD4BF] text-white dark:text-[#062134] font-semibold text-xs sm:text-sm rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <span>
                        {language === 'id'
                          ? 'Buka Alat Belajar'
                          : language === 'en'
                          ? 'Open Tool'
                          : 'Open Tool · Buka'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyUrl(tool.id, tool.url)}
                      className="px-3.5 py-2 bg-[#E8F5F8] dark:bg-[#122E5E] hover:bg-[#D5EEF4] dark:hover:bg-[#1A3E7A] text-[#0B2249] dark:text-white border border-[#C5E4EC] dark:border-[#1E447D] font-medium text-xs sm:text-sm rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>
                            {language === 'id' ? 'Tersalin' : 'Copied'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#0D949E] dark:text-[#2DD4BF]" />
                          <span>
                            {language === 'id' ? 'Salin Tautan' : 'Copy Link'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Clean Full-Size Screenshot Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-[#071731]/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[#C5E4EC] dark:border-[#1E447D] bg-[#0B2249] text-white">
              <div className="text-sm font-semibold truncate">
                {lightbox.toolName} ·{' '}
                <span className="text-[#2DD4BF] font-normal">
                  {language === 'id'
                    ? lightbox.images[lightbox.index].labelId
                    : lightbox.images[lightbox.index].labelEn}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-[#071731] flex items-center justify-center">
              <img
                src={lightbox.images[lightbox.index].src}
                alt={lightbox.images[lightbox.index].labelEn}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain"
              />

              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              index:
                                (prev.index - 1 + prev.images.length) %
                                prev.images.length,
                            }
                          : null
                      )
                    }
                    className="absolute left-3 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: (prev.index + 1) % prev.images.length,
                            }
                          : null
                      )
                    }
                    className="absolute right-3 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

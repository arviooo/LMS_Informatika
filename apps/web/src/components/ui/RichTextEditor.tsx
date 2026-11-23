import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  PenLine,
  HelpCircle
} from 'lucide-react';
import RichTextRenderer from './RichTextRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: string;
  id?: string;
  disabled?: boolean;
  helperText?: string;
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Tuliskan deskripsi atau konten di sini...',
  label,
  minHeight = '140px',
  id,
  disabled = false,
  helperText,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showTips, setShowTips] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (
    prefix: string,
    suffix: string = '',
    placeholderText: string = 'teks',
    isLinePrefix: boolean = false
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = '';
    let newCursorPos = 0;

    if (isLinePrefix) {
      // Find start of the current line
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const beforeLine = value.substring(0, lineStart);
      const afterLine = value.substring(lineStart);
      newText = beforeLine + prefix + afterLine;
      newCursorPos = start + prefix.length;
    } else if (selectedText) {
      newText =
        value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        value.substring(end);
      newCursorPos = end + prefix.length + suffix.length;
    } else {
      newText =
        value.substring(0, start) +
        prefix +
        placeholderText +
        suffix +
        value.substring(end);
      newCursorPos = start + prefix.length + placeholderText.length;
    }

    onChange(newText);

    // Maintain focus and restore cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectedText ? newCursorPos : start + prefix.length,
        selectedText ? newCursorPos : start + prefix.length + placeholderText.length
      );
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        applyFormatting('**', '**', 'teks tebal');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        applyFormatting('*', '*', 'teks miring');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        applyFormatting('<u>', '</u>', 'teks garis bawah');
      }
    }
  };

  const toolbarButtons = [
    {
      label: 'Judul Utama (H1)',
      icon: <Heading1 className="w-4 h-4" />,
      action: () => applyFormatting('# ', '', 'Judul Utama', true),
    },
    {
      label: 'Subjudul (H2)',
      icon: <Heading2 className="w-4 h-4" />,
      action: () => applyFormatting('## ', '', 'Subjudul', true),
    },
    {
      divider: true,
    },
    {
      label: 'Tebal (Ctrl+B)',
      icon: <Bold className="w-4 h-4" />,
      action: () => applyFormatting('**', '**', 'teks tebal'),
    },
    {
      label: 'Miring (Ctrl+I)',
      icon: <Italic className="w-4 h-4" />,
      action: () => applyFormatting('*', '*', 'teks miring'),
    },
    {
      label: 'Garis Bawah (Ctrl+U)',
      icon: <Underline className="w-4 h-4" />,
      action: () => applyFormatting('<u>', '</u>', 'teks garis bawah'),
    },
    {
      divider: true,
    },
    {
      label: 'Daftar Poin (Bullet)',
      icon: <List className="w-4 h-4" />,
      action: () => applyFormatting('- ', '', 'Poin daftar', true),
    },
    {
      label: 'Daftar Angka (Nomor)',
      icon: <ListOrdered className="w-4 h-4" />,
      action: () => applyFormatting('1. ', '', 'Poin bernomor', true),
    },
    {
      label: 'Kutipan / Catatan Penting',
      icon: <Quote className="w-4 h-4" />,
      action: () => applyFormatting('> ', '', 'Catatan atau kutipan penting', true),
    },
    {
      label: 'Kode / Perintah',
      icon: <Code className="w-4 h-4" />,
      action: () => applyFormatting('`', '`', 'kode/perintah'),
    },
  ];

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-sm font-semibold text-on-surface">
            {label}
          </label>
        </div>
      )}

      <div className="border border-outline-variant/60 rounded-2xl overflow-hidden bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
        {/* Editor Topbar: Tab Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-surface-container-low/70 border-b border-outline-variant/40">
          {/* Write / Preview Tabs */}
          <div className="flex items-center gap-1 bg-surface-container-high/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'write'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/50'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau</span>
              {value.trim() && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
          </div>

          {/* Quick Help toggle */}
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-surface-container-high/40"
            title="Panduan format tulisan"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Format Rapi</span>
          </button>
        </div>

        {/* Toolbar (Only shown in 'write' mode) */}
        {activeTab === 'write' && (
          <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 bg-surface-container-low/30 border-b border-outline-variant/30">
            {toolbarButtons.map((btn, index) => {
              if (btn.divider) {
                return (
                  <div
                    key={`div-${index}`}
                    className="h-4 w-px bg-outline-variant/50 mx-1 hidden sm:block"
                  />
                );
              }
              return (
                <button
                  key={btn.label}
                  type="button"
                  disabled={disabled}
                  onClick={btn.action}
                  title={btn.label}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {btn.icon}
                </button>
              );
            })}
          </div>
        )}

        {/* Tips Box (Expandable) */}
        {showTips && (
          <div className="px-4 py-2.5 bg-primary/5 border-b border-primary/20 text-xs text-on-surface space-y-1">
            <p className="font-bold text-primary flex items-center gap-1">
              ✨ Tips Menulis Rapi & Menarik:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-on-surface-variant">
              <div>• <b># Judul</b> atau <b>## Subjudul</b> untuk memisahkan bab/topik</div>
              <div>• <b>**Teks Tebal**</b> (Ctrl+B) untuk kata-kata penting</div>
              <div>• <i>*Teks Miring*</i> (Ctrl+I) untuk istilah asing</div>
              <div>• <u>&lt;u&gt;Garis Bawah&lt;/u&gt;</u> (Ctrl+U) untuk penegasan</div>
              <div>• <b>- Poin 1</b> untuk membuat daftar berbutir</div>
              <div>• <b>1. Poin 1</b> untuk membuat langkah-langkah berurutan</div>
              <div>• <b>&gt; Catatan</b> untuk membuat kotak sorotan/kutipan</div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full p-3.5 bg-transparent text-on-surface placeholder:text-on-surface-variant/50 font-sans text-sm sm:text-base leading-relaxed focus:outline-hidden resize-y"
          />
        ) : (
          <div
            style={{ minHeight }}
            className="w-full p-4 bg-surface-container-lowest overflow-y-auto"
          >
            {value.trim() ? (
              <RichTextRenderer content={value} />
            ) : (
              <div className="text-sm text-on-surface-variant/60 italic py-4 text-center">
                Belum ada teks yang ditulis. Ketik di tab "Tulis" untuk melihat pratinjau di sini.
              </div>
            )}
          </div>
        )}

        {/* Bottom Bar: Character count & Helper hint */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-low/40 border-t border-outline-variant/30 text-[11px] text-on-surface-variant">
          <span>
            {activeTab === 'write'
              ? 'Gunakan toolbar di atas atau pintasan keyboard untuk merapikan teks'
              : 'Mode Pratinjau Tampilan'}
          </span>
          <span className="font-mono">
            {value.length} karakter
          </span>
        </div>
      </div>

      {helperText && (
        <p className="text-xs text-on-surface-variant mt-1">{helperText}</p>
      )}
    </div>
  );
}

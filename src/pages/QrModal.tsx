import { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Copy, Download, Check } from 'lucide-react';

interface QrModalProps {
  surveyUrl: string;
  surveyTitle: string;
  onClose: () => void;
}

export default function QrModal({ surveyUrl, surveyTitle, onClose }: QrModalProps) {
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = wrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-${surveyTitle || 'survey'}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative animate-in fade-in">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-semibold text-slate-800 text-center mb-1">
            QR-код опроса
          </h3>
          <p className="text-sm text-slate-500 text-center mb-5 truncate px-4">
            {surveyTitle}
          </p>

          <div ref={wrapperRef} className="flex justify-center mb-4">
            <div className="p-4 bg-white border-2 border-slate-100 rounded-xl">
              <QRCodeCanvas value={surveyUrl} size={220} level="M" />
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center truncate mb-5 px-2">
            {surveyUrl}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Скопировать
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Скачать PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

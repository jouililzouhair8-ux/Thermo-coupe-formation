import { useRef, useState } from 'react';
import { Upload, Link, X, ImageIcon, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept: 'image' | 'pdf';
  label?: string;
}

export function MediaUpload({ value, onChange, accept, label }: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const acceptAttr = accept === 'image' ? 'image/*' : 'application/pdf';
  const folder = accept === 'image' ? 'images' : 'pdfs';

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || '';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('app-assets')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('app-assets').getPublicUrl(fileName);
      onChange(urlData.publicUrl);
    } catch {
      setError('فشل رفع الملف');
    }
    setUploading(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="label-text">{label}</label>}

      {value && (
        <div className="relative rounded-xl overflow-hidden border border-ink-200 bg-ink-50">
          {accept === 'image' ? (
            <img src={value} alt="preview" className="w-full h-32 object-cover" />
          ) : (
            <div className="flex items-center gap-2 p-3">
              <FileText className="w-8 h-8 text-ink-700 shrink-0" />
              <p className="text-sm text-ink-700 truncate flex-1">{value.split('/').pop()}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!value && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-ink-300 rounded-xl cursor-pointer hover:border-ink-500 hover:bg-ink-50 transition-all active:scale-[0.98]"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-ink-400 animate-spin" />
          ) : accept === 'image' ? (
            <ImageIcon className="w-6 h-6 text-ink-400" />
          ) : (
            <FileText className="w-6 h-6 text-ink-400" />
          )}
          <p className="text-xs text-ink-500 text-center px-4">
            {uploading
              ? 'جاري الرفع...'
              : accept === 'image'
                ? 'اضغط لرفع صورة من جهازك'
                : 'اضغط لرفع ملف PDF من جهازك'}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-700 bg-ink-100 rounded-lg py-2 hover:bg-ink-200 active:scale-95 transition-all disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          رفع ملف
        </button>
        <button
          type="button"
          onClick={() => { setShowUrlInput(!showUrlInput); setUrlInput(''); }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-700 bg-ink-100 rounded-lg py-2 hover:bg-ink-200 active:scale-95 transition-all"
        >
          <Link className="w-3.5 h-3.5" />
          رابط خارجي
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="input-field text-sm flex-1"
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="bg-ink-900 text-white text-sm font-semibold rounded-xl px-4 py-2 active:scale-95 transition-transform"
          >
            تأكيد
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

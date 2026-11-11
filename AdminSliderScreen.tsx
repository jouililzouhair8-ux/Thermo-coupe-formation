import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Image, Pencil, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MediaUpload } from '@/components/MediaUpload';
import { SafeImage } from '@/components/SafeImage';
import type { SliderImage } from '@/lib/types';

const DEFAULT_LOGO = 'https://i.ibb.co/JRqmCZx6/1790514205185.jpg';

export function AdminSliderScreen() {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<SliderImage | null>(null);
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoEditing, setLogoEditing] = useState(false);
  const [logoInput, setLogoInput] = useState('');

  useEffect(() => {
    loadImages();
    loadLogo();
  }, []);

  const loadImages = async () => {
    const { data } = await supabase.from('slider_images').select('*').order('display_order');
    if (data) setImages(data as SliderImage[]);
    setLoading(false);
  };

  const loadLogo = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('logo_url')
      .eq('id', 1)
      .maybeSingle();
    if (data?.logo_url) setLogoUrl(data.logo_url as string);
  };

  const openAddForm = () => {
    setEditingImage(null);
    setUrl('');
    setOrder(images.length + 1);
    setShowForm(true);
  };

  const openEditForm = (img: SliderImage) => {
    setEditingImage(img);
    setUrl(img.image_url);
    setOrder(img.display_order);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError(null);
    setSubmitting(true);

    try {
      if (editingImage) {
        const { error: updateError } = await supabase
          .from('slider_images')
          .update({ image_url: url.trim(), display_order: order })
          .eq('id', editingImage.id);
        if (updateError) setError(updateError.message);
        else { setShowForm(false); loadImages(); }
      } else {
        const { error: insertError } = await supabase.from('slider_images').insert({
          image_url: url.trim(),
          display_order: order,
        });
        if (insertError) setError(insertError.message);
        else { setShowForm(false); loadImages(); }
      }
    } catch {
      setError('فشل الحفظ');
    }
    setSubmitting(false);
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    const { error } = await supabase.from('slider_images').delete().eq('id', imageId);
    if (!error) loadImages();
  };

  const saveLogo = async () => {
    setError(null);
    setSubmitting(true);
    const { error: updateError } = await supabase
      .from('app_settings')
      .update({ logo_url: logoInput.trim(), updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (updateError) setError(updateError.message);
    else {
      setLogoUrl(logoInput.trim());
      setLogoEditing(false);
      setLogoInput('');
    }
    setSubmitting(false);
  };

  const deleteLogo = async () => {
    if (!confirm('هل أنت متأكد من حذف الشعار؟')) return;
    const { error } = await supabase
      .from('app_settings')
      .update({ logo_url: '', updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (!error) {
      setLogoUrl('');
      setLogoEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink-900 text-lg">إدارة الصور</h2>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 bg-ink-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          إضافة صورة
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-ink-900" />
          <h3 className="font-bold text-ink-900 text-sm">شعار التطبيق</h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-ink-100 border border-ink-200 flex items-center justify-center overflow-hidden shrink-0">
            <SafeImage
              src={logoUrl || DEFAULT_LOGO}
              alt="logo"
              className="w-full h-full object-cover"
              fallbackClassName="w-full h-full"
              fallbackIconSize={28}
              rounded="rounded-2xl"
            />
          </div>

          <div className="flex-1 min-w-0">
            {logoEditing ? (
              <div className="space-y-2">
                <MediaUpload
                  value={logoInput}
                  onChange={setLogoInput}
                  accept="image"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveLogo}
                    disabled={submitting || !logoInput.trim()}
                    className="flex-1 bg-ink-900 text-white text-sm font-semibold rounded-xl py-2 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setLogoEditing(false)}
                    className="flex-1 bg-ink-100 text-ink-700 text-sm font-semibold rounded-xl py-2 active:scale-95 transition-transform"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setLogoInput(logoUrl); setLogoEditing(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-700 bg-ink-100 rounded-xl py-2.5 hover:bg-ink-200 active:scale-95 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  تغيير الصورة
                </button>
                {logoUrl && (
                  <button
                    onClick={deleteLogo}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-700 bg-ink-100 rounded-xl py-2.5 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف الصورة
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-ink-900 text-sm mb-3">صور السلايدر</h3>
        {images.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-12 h-12 text-ink-300 mx-auto mb-3" />
            <p className="text-ink-500 text-sm">لا توجد صور في السلايدر</p>
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={img.id} className="card overflow-hidden">
                <div className="relative">
                  <SafeImage
                    src={img.image_url}
                    alt={`slide ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-xl"
                    fallbackClassName="w-full h-32"
                    fallbackIconSize={28}
                    rounded="rounded-xl"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-xs text-ink-500">ترتيب {img.display_order}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditForm(img)}
                      className="flex items-center gap-1 text-xs font-semibold text-ink-700 bg-ink-100 rounded-lg px-3 py-1.5 hover:bg-ink-200 active:scale-95 transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                      تغيير الصورة
                    </button>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-ink-700 bg-ink-100 rounded-lg px-3 py-1.5 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      حذف الصورة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink-900 text-base">
                {editingImage ? 'تغيير الصورة' : 'إضافة صورة'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-ink-100 active:scale-90 transition-all"
              >
                <X className="w-5 h-5 text-ink-900" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <MediaUpload
                value={url}
                onChange={setUrl}
                accept="image"
                label="صورة السلايدر"
              />
              <div>
                <label className="label-text">ترتيب العرض</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !url.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  editingImage ? 'حفظ التغييرات' : 'إضافة الصورة'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

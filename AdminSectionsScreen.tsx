import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MediaUpload } from '@/components/MediaUpload';
import { SafeImage } from '@/components/SafeImage';
import type { Section } from '@/lib/types';

export function AdminSectionsScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [form, setForm] = useState({ title: '', description: '', display_order: 0, cover_url: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    const { data } = await supabase.from('sections').select('*').order('display_order');
    if (data) setSections(data as Section[]);
    setLoading(false);
  };

  const openAddForm = () => {
    setEditingSection(null);
    setForm({ title: '', description: '', display_order: sections.length + 1, cover_url: '' });
    setShowForm(true);
  };

  const openEditForm = (section: Section) => {
    setEditingSection(section);
    setForm({ title: section.title, description: section.description, display_order: section.display_order, cover_url: section.cover_url || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setError(null);
    setSubmitting(true);

    try {
      if (editingSection) {
        const { error: updateError } = await supabase
          .from('sections')
          .update({
            title: form.title,
            description: form.description,
            display_order: form.display_order,
            cover_url: form.cover_url,
          })
          .eq('id', editingSection.id);
        if (updateError) setError(updateError.message);
        else { setShowForm(false); loadSections(); }
      } else {
        const { error: insertError } = await supabase.from('sections').insert({
          title: form.title,
          description: form.description,
          display_order: form.display_order,
          cover_url: form.cover_url,
        });
        if (insertError) setError(insertError.message);
        else { setShowForm(false); loadSections(); }
      }
    } catch {
      setError('فشل الحفظ');
    }
    setSubmitting(false);
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الدروس المرتبطة به.')) return;
    const { error } = await supabase.from('sections').delete().eq('id', sectionId);
    if (!error) loadSections();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink-900 text-lg">إدارة الأقسام</h2>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 bg-ink-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          إضافة
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">لا توجد أقسام بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center shrink-0 overflow-hidden">
                {section.cover_url ? (
                  <SafeImage
                    src={section.cover_url}
                    alt={section.title}
                    className="w-full h-full object-cover"
                    fallbackClassName="w-full h-full"
                    fallbackIconSize={18}
                  />
                ) : (
                  <FolderOpen className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 text-sm truncate">{section.title}</p>
                {section.description && (
                  <p className="text-xs text-ink-500 truncate">{section.description}</p>
                )}
              </div>
              <button
                onClick={() => openEditForm(section)}
                className="p-2 rounded-lg text-ink-500 hover:bg-ink-200 active:scale-90 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(section.id)}
                className="p-2 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 active:scale-90 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink-900 text-base">
                {editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-ink-100 active:scale-90 transition-all"
              >
                <X className="w-5 h-5 text-ink-900" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label-text">عنوان القسم</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="عنوان القسم"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">الوصف</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف القسم"
                  className="input-field"
                />
              </div>
              <MediaUpload
                value={form.cover_url}
                onChange={(url) => setForm({ ...form, cover_url: url })}
                accept="image"
                label="صورة الغلاف (اختياري)"
              />
              <div>
                <label className="label-text">ترتيب العرض</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
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
                disabled={submitting || !form.title.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  editingSection ? 'حفظ التعديلات' : 'إضافة القسم'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

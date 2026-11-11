import { useEffect, useState } from 'react';
import { ChevronLeft, BookOpen, FileText, Video, File, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/lib/navigation';
import { useAuth } from '@/lib/auth';
import { MediaUpload } from '@/components/MediaUpload';
import type { Lesson, Section, LessonProgress, ContentType } from '@/lib/types';

export function LessonsListScreen() {
  const { current, navigate } = useNav();
  const { profile } = useAuth();
  const sectionId = current.params?.sectionId ?? '';
  const [section, setSection] = useState<Section | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    content_type: 'text' as ContentType,
    content_url: '',
    content_text: '',
    display_order: 0,
  });
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    loadLessons();
  }, [sectionId]);

  const loadLessons = async () => {
    const { data: sectionData } = await supabase
      .from('sections')
      .select('*')
      .eq('id', sectionId)
      .maybeSingle();

    if (sectionData) setSection(sectionData as Section);

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('section_id', sectionId)
      .order('display_order');

    let lessonList = (lessonsData ?? []) as Lesson[];
    if (!isAdmin) {
      lessonList = lessonList.filter((l) => l.published);
    }
    setLessons(lessonList);

    if (profile && profile.role === 'trainee' && lessonList.length > 0) {
      const lessonIds = lessonList.map((l) => l.id);
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('trainee_id', profile.id)
        .in('lesson_id', lessonIds);

      const map: Record<string, boolean> = {};
      (progressData ?? []).forEach((p: LessonProgress) => {
        map[p.lesson_id] = p.completed;
      });
      setProgressMap(map);
    }

    setLoading(false);
  };

  const openAddForm = () => {
    setEditingLesson(null);
    setForm({ title: '', description: '', content_type: 'text', content_url: '', content_text: '', display_order: lessons.length + 1 });
    setVideoUrl('');
    setPdfUrl('');
    setShowForm(true);
  };

  const openEditForm = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title,
      description: lesson.description,
      content_type: lesson.content_type,
      content_url: lesson.content_url,
      content_text: lesson.content_text,
      display_order: lesson.display_order,
    });
    setVideoUrl(lesson.video_url || (lesson.content_type === 'video' ? lesson.content_url : ''));
    setPdfUrl(lesson.document_url || (lesson.content_type === 'pdf' ? lesson.content_url : ''));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !sectionId) return;
    setError(null);
    setSubmitting(true);

    const vUrl = videoUrl.trim();
    const pUrl = pdfUrl.trim();
    const determinedType: ContentType = vUrl ? 'video' : pUrl ? 'pdf' : 'text';

    try {
      if (editingLesson) {
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            title: form.title,
            description: form.description,
            content_type: determinedType,
            content_url: vUrl || pUrl,
            content_text: form.content_text,
            video_url: vUrl,
            document_url: pUrl,
            display_order: form.display_order,
          })
          .eq('id', editingLesson.id);
        if (updateError) setError(updateError.message);
        else { setShowForm(false); loadLessons(); }
      } else {
        const { error: insertError } = await supabase.from('lessons').insert({
          section_id: sectionId,
          title: form.title,
          description: form.description,
          content_type: determinedType,
          content_url: vUrl || pUrl,
          content_text: form.content_text,
          video_url: vUrl,
          document_url: pUrl,
          display_order: form.display_order,
        });
        if (insertError) setError(insertError.message);
        else { setShowForm(false); loadLessons(); }
      }
    } catch {
      setError('فشل الحفظ');
    }
    setSubmitting(false);
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (!error) loadLessons();
  };

  const togglePublish = async (lesson: Lesson) => {
    const { error } = await supabase
      .from('lessons')
      .update({ published: !lesson.published })
      .eq('id', lesson.id);
    if (!error) loadLessons();
  };

  const getIcon = (type: string) => {
    if (type === 'video') return <Video className="w-5 h-5 text-white" />;
    if (type === 'pdf') return <File className="w-5 h-5 text-white" />;
    return <FileText className="w-5 h-5 text-white" />;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="text-center pb-3 border-b border-ink-200">
        <h2 className="font-bold text-ink-900 text-xl">{section?.title ?? 'لائحة الدروس'}</h2>
        {section?.description && (
          <p className="text-xs text-ink-500 mt-1">{section.description}</p>
        )}
      </div>

      {isAdmin && (
        <div className="mt-3">
          <button
            onClick={openAddForm}
            className="w-full flex items-center justify-center gap-2 bg-ink-900 text-white text-sm font-semibold rounded-xl px-4 py-3 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            إضافة درس جديد
          </button>
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">لا توجد دروس في هذا القسم حاليا</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="space-y-1.5">
              <button
                onClick={() => navigate('lesson-detail', { lessonId: lesson.id })}
                className="w-full card flex items-center gap-3 text-right hover:bg-ink-200 active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center shrink-0">
                  {getIcon(lesson.content_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-400 font-mono">{idx + 1}.</span>
                    <h3 className="font-semibold text-ink-900 text-sm truncate">{lesson.title}</h3>
                    {!lesson.published && (
                      <span className="text-xs text-ink-500 bg-ink-200 px-1.5 py-0.5 rounded">غير منشور</span>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-xs text-ink-500 truncate mt-0.5">{lesson.description}</p>
                  )}
                </div>
                {progressMap[lesson.id] && (
                  <span className="text-xs text-ink-900 font-bold bg-ink-200 px-2 py-0.5 rounded-full shrink-0">
                    مكتمل
                  </span>
                )}
                <ChevronLeft className="w-4 h-4 text-ink-400 shrink-0" />
              </button>

              {isAdmin && (
                <div className="flex gap-1.5 px-2">
                  <button
                    onClick={() => openEditForm(lesson)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-ink-700 bg-ink-100 rounded-lg py-2 hover:bg-ink-200 active:scale-95 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-ink-700 bg-ink-100 rounded-lg py-2 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </button>
                  <button
                    onClick={() => togglePublish(lesson)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-ink-700 bg-ink-100 rounded-lg py-2 hover:bg-ink-200 active:scale-95 transition-all"
                  >
                    {lesson.published ? (
                      <><EyeOff className="w-3.5 h-3.5" />إلغاء النشر</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5" />نشر</>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-ink-900 text-base mb-4">
              {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label-text">عنوان الدرس</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="عنوان الدرس"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">الوصف</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">رابط الفيديو (YouTube/Vimeo/MP4)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <MediaUpload
                value={pdfUrl}
                onChange={setPdfUrl}
                accept="pdf"
                label="ملف PDF"
              />
              <div>
                <label className="label-text">محتوى الدرس / تعليمات مكتوبة</label>
                <textarea
                  value={form.content_text}
                  onChange={(e) => setForm({ ...form, content_text: e.target.value })}
                  placeholder="اكتب محتوى الدرس هنا..."
                  className="input-field min-h-[120px] resize-y"
                />
              </div>
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
                  editingLesson ? 'حفظ التعديلات' : 'إضافة الدرس'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

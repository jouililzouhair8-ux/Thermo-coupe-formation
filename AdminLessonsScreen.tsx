import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, BookOpen, Video, File, FileText, Eye, EyeOff, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MediaUpload } from '@/components/MediaUpload';
import type { Section, Lesson, ContentType, QuizQuestion } from '@/lib/types';

export function AdminLessonsScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    content_type: 'text' as ContentType,
    content_url: '',
    content_text: '',
    display_order: 0,
    published: true,
  });
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (selectedSection) loadLessons();
  }, [selectedSection]);

  const loadSections = async () => {
    const { data } = await supabase.from('sections').select('*').order('display_order');
    if (data) {
      const sectionsData = data as Section[];
      setSections(sectionsData);
      if (sectionsData.length > 0 && !selectedSection) {
        setSelectedSection(sectionsData[0].id);
      }
    }
    setLoading(false);
  };

  const loadLessons = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('section_id', selectedSection)
      .order('display_order');
    if (data) setLessons(data as Lesson[]);
  };

  const openAddForm = () => {
    setEditingLesson(null);
    setForm({ title: '', description: '', content_type: 'text', content_url: '', content_text: '', display_order: lessons.length + 1, published: true });
    setVideoUrl('');
    setPdfUrl('');
    setImageUrl('');
    setQuizQuestions([]);
    setShowQuizEditor(false);
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
      published: lesson.published,
    });
    setVideoUrl(lesson.video_url || (lesson.content_type === 'video' ? lesson.content_url : ''));
    setPdfUrl(lesson.document_url || (lesson.content_type === 'pdf' ? lesson.content_url : ''));
    setImageUrl(lesson.image_url || '');
    setQuizQuestions(lesson.quiz_data ?? []);
    setShowQuizEditor(false);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedSection) return;
    setError(null);
    setSubmitting(true);

    const vUrl = videoUrl.trim();
    const pUrl = pdfUrl.trim();
    const iUrl = imageUrl.trim();
    const determinedType: ContentType = vUrl ? 'video' : pUrl ? 'pdf' : 'text';

    try {
      if (editingLesson) {
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            title: form.title,
            description: form.description,
            content_type: determinedType,
            content_url: vUrl || pUrl || iUrl,
            content_text: form.content_text,
            video_url: vUrl,
            document_url: pUrl,
            image_url: iUrl,
            display_order: form.display_order,
            published: form.published,
            quiz_data: quizQuestions,
          })
          .eq('id', editingLesson.id);

        if (updateError) setError(updateError.message);
        else { setShowForm(false); loadLessons(); }
      } else {
        const { error: insertError } = await supabase.from('lessons').insert({
          section_id: selectedSection,
          title: form.title,
          description: form.description,
          content_type: determinedType,
          content_url: vUrl || pUrl || iUrl,
          content_text: form.content_text,
          video_url: vUrl,
          document_url: pUrl,
          image_url: iUrl,
          display_order: form.display_order,
          published: form.published,
          quiz_data: quizQuestions,
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

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correct_index: 0 }]);
  };

  const updateQuizQuestion = (idx: number, field: keyof QuizQuestion, value: string | number) => {
    setQuizQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateQuizOption = (qIdx: number, optIdx: number, value: string) => {
    setQuizQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const newOptions = [...q.options];
      newOptions[optIdx] = value;
      return { ...q, options: newOptions };
    }));
  };

  const removeQuizQuestion = (idx: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const getTypeIcon = (type: string) => {
    if (type === 'video') return <Video className="w-4 h-4" />;
    if (type === 'pdf') return <File className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
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
        <h2 className="font-bold text-ink-900 text-lg">إدارة الدروس</h2>
        <button
          onClick={openAddForm}
          disabled={sections.length === 0}
          className="flex items-center gap-1.5 bg-ink-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 active:scale-95 transition-transform disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          إضافة
        </button>
      </div>

      {sections.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                selectedSection === section.id
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      )}

      {sections.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">يرجى إضافة قسم أولا</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">لا توجد دروس في هذا القسم</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="space-y-1.5">
              <div className="card flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center shrink-0">
                  {getTypeIcon(lesson.content_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm truncate">{lesson.title}</p>
                  <p className="text-xs text-ink-500 truncate">
                    {lesson.content_type === 'video' ? 'فيديو' : lesson.content_type === 'pdf' ? 'PDF' : 'نص'}
                    {' · '}
                    ترتيب {lesson.display_order}
                    {!lesson.published && ' · غير منشور'}
                  </p>
                </div>
              </div>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink-900 text-base">
                {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
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
                <label className="label-text">رابط الفيديو (YouTube/Vimeo/Bunny.net/MP4)</label>
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
              <MediaUpload
                value={imageUrl}
                onChange={setImageUrl}
                accept="image"
                label="صورة / مرفق"
              />
              <div>
                <label className="label-text">محتوى الدرس / تعليمات مكتوبة</label>
                <textarea
                  value={form.content_text}
                  onChange={(e) => setForm({ ...form, content_text: e.target.value })}
                  placeholder="اكتب محتوى الدرس أو التعليمات الإضافية هنا..."
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, published: !form.published })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    form.published ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700'
                  }`}
                >
                  {form.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {form.published ? 'منشور' : 'غير منشور'}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowQuizEditor(!showQuizEditor)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-ink-100 text-ink-900 font-semibold text-sm hover:bg-ink-200 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    أسئلة التقييم ({quizQuestions.length})
                  </span>
                  {showQuizEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showQuizEditor && (
                  <div className="mt-2 space-y-3 p-3 bg-ink-50 rounded-xl">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-2 p-3 bg-white rounded-xl border border-ink-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink-500">سؤال {qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuizQuestion(qIdx)}
                            className="p-1 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuizQuestion(qIdx, 'question', e.target.value)}
                          placeholder="نص السؤال"
                          className="input-field text-sm"
                        />
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuizQuestion(qIdx, 'correct_index', optIdx)}
                                className={`w-5 h-5 rounded-full border-2 shrink-0 transition-all ${
                                  q.correct_index === optIdx
                    ? 'bg-ink-900 border-ink-900'
                    : 'border-ink-300'
                                }`}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateQuizOption(qIdx, optIdx, e.target.value)}
                                placeholder={`الخيار ${optIdx + 1}`}
                                className="input-field text-sm flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addQuizQuestion}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ink-100 text-ink-700 text-sm font-semibold hover:bg-ink-200 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة سؤال
                    </button>
                  </div>
                )}
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

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Video, File, FileText, HelpCircle, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/lib/navigation';
import { useAuth } from '@/lib/auth';
import type { Lesson, QuizQuestion } from '@/lib/types';

export function LessonDetailScreen() {
  const { current } = useNav();
  const { profile } = useAuth();
  const lessonId = current.params?.lessonId ?? '';
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonNumber, setLessonNumber] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle();

    if (data) {
      const lessonData = data as Lesson;
      setLesson(lessonData);

      const { data: sectionLessons } = await supabase
        .from('lessons')
        .select('id, display_order')
        .eq('section_id', lessonData.section_id)
        .order('display_order');

      if (sectionLessons) {
        const idx = (sectionLessons as { id: string }[]).findIndex((l) => l.id === lessonId);
        setLessonNumber(idx + 1);
      }

      if (profile && profile.role === 'trainee') {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('trainee_id', profile.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();
        if (progress) setCompleted((progress as { completed: boolean }).completed);
      }
    }
    setLoading(false);
  };

  const toggleComplete = async () => {
    if (!profile || profile.role !== 'trainee' || !lesson) return;
    setUpdating(true);
    const newCompleted = !completed;
    setCompleted(newCompleted);

    const { error } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          trainee_id: profile.id,
          lesson_id: lesson.id,
          completed: newCompleted,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'trainee_id,lesson_id' }
      );

    if (error) {
      setCompleted(!newCompleted);
    }
    setUpdating(false);
  };

  const renderVideo = () => {
    const url = lesson?.video_url?.trim() || (lesson?.content_type === 'video' ? lesson?.content_url?.trim() : '');
    if (!url) return null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return (
          <div className="relative w-full overflow-hidden rounded-2xl bg-ink-900 aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={lesson?.title ?? ''}
            />
          </div>
        );
      }
    }
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (vimeoId) {
        return (
          <div className="relative w-full overflow-hidden rounded-2xl bg-ink-900 aspect-video">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={lesson?.title ?? ''}
            />
          </div>
        );
      }
    }
    return (
      <div className="relative w-full overflow-hidden rounded-2xl bg-ink-900 aspect-video">
        <video
          src={url}
          controls
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  };

  const renderImage = () => {
    const url = lesson?.image_url?.trim();
    if (!url) return null;

    return (
      <div className="w-full overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
        <img
          src={url}
          alt={lesson?.title ?? ''}
          className="w-full h-auto object-contain"
        />
      </div>
    );
  };

  const renderPdf = () => {
    const url = lesson?.document_url?.trim() || (lesson?.content_type === 'pdf' ? lesson?.content_url?.trim() : '');
    if (!url) return null;

    return (
      <div className="w-full overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
        <iframe
          src={url}
          className="w-full h-[500px]"
          title={lesson?.title ?? ''}
        />
      </div>
    );
  };

  const renderText = () => {
    if (!lesson?.content_text) return null;
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-ink-900" />
          <span className="text-sm font-semibold text-ink-900">محتوى الدرس</span>
        </div>
        <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-wrap">
          {lesson.content_text}
        </p>
      </div>
    );
  };

    const renderContent = () => {
    if (!lesson) return null;

    return (
      <div className="space-y-6 w-full">
        {/* 1. النص */}
        {lesson.content && (
          <div className="card p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {lesson.content}
            </p>
          </div>
        )}

        {/* 2. الفيديو */}
        {lesson.video_url && (
          <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video">
            <iframe
              src={lesson.video_url.replace("watch?v=", "embed/")}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={lesson.title ?? ''}
            />
          </div>
        )}

        {/* 3. الصورة */}
        {lesson.image_url && (
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <img
              src={lesson.image_url}
              alt={lesson.title ?? ''}
              className="w-full h-auto object-contain"
            />
          </div>
        )}

        {/* 4. المستند PDF */}
        {lesson.document_url && (
          <div className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
            <span className="font-medium text-sm">📄 المستند المرفق (PDF)</span>
            <a
              href={lesson.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow hover:bg-blue-700 transition"
            >
              فتح / تحميل المستند
            </a>
          </div>
        )}
      </div>
    );
  };


  const getTypeIcon = () => {
    if (!lesson) return null;
    if (lesson.content_type === 'video') return <Video className="w-4 h-4" />;
    if (lesson.content_type === 'pdf') return <File className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const quiz: QuizQuestion[] = lesson?.quiz_data ?? [];

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
  };

  const quizScore = () => {
    let correct = 0;
    quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_index) correct++;
    });
    return correct;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12 text-ink-500 text-sm">
        الدرس غير موجود
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5 animate-fade-in">
      <div className="pb-3 border-b border-ink-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-ink-400 font-medium flex items-center gap-1">
            {getTypeIcon()}
            {lesson.content_type === 'video' ? 'فيديو' : lesson.content_type === 'pdf' ? 'ملف PDF' : 'نص'}
          </span>
        </div>
        <h2 className="font-bold text-ink-900 text-lg leading-tight">
          <span className="text-ink-500">الدرس {lessonNumber}:</span> {lesson.title}
        </h2>
        {lesson.description && (
          <p className="text-sm text-ink-500 mt-1">{lesson.description}</p>
        )}
      </div>

      {renderContent()}

      {quiz.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-ink-900" />
            <h3 className="font-bold text-ink-900 text-base">أسئلة التقييم</h3>
          </div>

          <div className="space-y-4">
            {quiz.map((q, qIdx) => (
              <div key={qIdx} className="space-y-2">
                <p className="text-sm font-semibold text-ink-900">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswers[qIdx] === optIdx;
                    const isCorrect = q.correct_index === optIdx;
                    const showResult = quizSubmitted && isSelected;
                    const showCorrect = quizSubmitted && isCorrect;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => !quizSubmitted && handleQuizAnswer(qIdx, optIdx)}
                        disabled={quizSubmitted}
                        className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                          showResult && !isCorrect
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : showCorrect
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : isSelected
                            ? 'bg-ink-900 text-white'
                            : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                        } ${quizSubmitted ? 'cursor-default' : 'active:scale-[0.98]'}`}
                      >
                        <span>{opt}</span>
                        {showResult && !isCorrect && <X className="w-4 h-4 shrink-0" />}
                        {showCorrect && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {quizSubmitted ? (
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-ink-900">
                النتيجة: {quizScore()} / {quiz.length}
              </p>
              <button
                onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                className="mt-3 btn-secondary text-sm"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(quizAnswers).length < quiz.length}
              className="mt-4 w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              تأكيد الإجابات
            </button>
          )}
        </div>
      )}

      {profile && profile.role === 'trainee' && (
        <button
          onClick={toggleComplete}
          disabled={updating}
          className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold transition-all active:scale-[0.98] ${
            completed
              ? 'bg-ink-100 text-ink-900 hover:bg-ink-200'
              : 'bg-ink-900 text-white hover:bg-ink-800'
          }`}
        >
          {completed ? (
            <>
              <CheckCircle className="w-5 h-5" />
              تم إكمال الدرس
            </>
          ) : (
            <>
              <Circle className="w-5 h-5" />
              تحديد كمنجز
            </>
          )}
        </button>
      )}
    </div>
  );
}

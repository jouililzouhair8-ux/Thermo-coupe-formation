import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/lib/navigation';
import { useAuth } from '@/lib/auth';
import { SafeImage } from '@/components/SafeImage';
import type { SliderImage, Section, Lesson } from '@/lib/types';

export function HomeScreen() {
  const { navigate } = useNav();
  const { profile } = useAuth();
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [latestLessons, setLatestLessons] = useState<{ lesson: Lesson; section: Section }[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [sliderRes, sectionsRes] = await Promise.all([
      supabase.from('slider_images').select('*').order('display_order'),
      supabase.from('sections').select('*').order('display_order'),
    ]);

    const images = (sliderRes.data ?? []) as SliderImage[];
    const sections = (sectionsRes.data ?? []) as Section[];
    setSliderImages(images);

    if (sections.length > 0) {
      const sectionIds = sections.map((s) => s.id);
      const sectionMap = new Map(sections.map((s) => [s.id, s]));

      const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .in('section_id', sectionIds)
        .eq('published', true)
        .order('created_at', { ascending: false });

      const allLessons = (lessons ?? []) as Lesson[];

      const latestPerSection: { lesson: Lesson; section: Section }[] = [];
      const seenSections = new Set<string>();
      for (const lesson of allLessons) {
        if (!seenSections.has(lesson.section_id)) {
          const section = sectionMap.get(lesson.section_id);
          if (section) {
            latestPerSection.push({ lesson, section });
            seenSections.add(lesson.section_id);
          }
        }
      }
      setLatestLessons(latestPerSection);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  const nextSlide = () => {
    if (sliderImages.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    if (sliderImages.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prevSlide();
      else nextSlide();
    }
    touchStartX.current = null;
  };

  const handleEnterApp = () => {
    if (profile) {
      navigate('sections');
    } else {
      navigate('login');
    }
  };

  const handleLessonClick = (lessonId: string) => {
    if (profile) {
      navigate('lesson-detail', { lessonId });
    } else {
      navigate('login');
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
    <div className="flex flex-col animate-fade-in">
      {sliderImages.length > 0 && (
        <div className="mt-4">
          <div
            className="relative overflow-hidden rounded-2xl bg-ink-100"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${currentSlide * 100}%)` }}
            >
              {sliderImages.map((img, idx) => (
                <div key={img.id} className="w-full shrink-0">
                  <SafeImage
                    src={img.image_url}
                    alt={`slide ${idx + 1}`}
                    className="w-full h-48 sm:h-56 object-cover rounded-2xl"
                    fallbackClassName="w-full h-48 sm:h-56"
                    fallbackIconSize={32}
                    rounded="rounded-2xl"
                  />
                </div>
              ))}
            </div>

            {sliderImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md active:scale-90 transition-transform"
                >
                  <ChevronRight className="w-5 h-5 text-ink-900" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md active:scale-90 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5 text-ink-900" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {sliderImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'w-5 bg-ink-900' : 'w-1.5 bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="text-center px-4 mt-8">
        <p className="text-sm leading-relaxed text-ink-700 font-medium">
          thermo-coupe formation هي منصة تكوينية احترافية موجهة للعاملين في صناعة الاكياس البلاستيكية تهدف الى تطوير مهاراتكم في تقنيات القطع الحراري والانتاج الصناعي
        </p>
      </div>

      {latestLessons.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-ink-900" />
            <h2 className="font-bold text-ink-900 text-sm">آخر الدروس المضافة</h2>
          </div>
          {!profile && (
            <p className="text-xs text-ink-400 mb-2 leading-relaxed">
              يرجى تسجيل الدخول للوصول إلى الدرس
            </p>
          )}
          <div className="space-y-2">
            {latestLessons.map(({ lesson, section }) => (
              <button
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id)}
                className="w-full card flex items-center gap-3 text-right hover:bg-ink-200 active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm truncate">{lesson.title}</p>
                  <p className="text-xs text-ink-500 truncate">{section.title}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-ink-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pb-4">
        <button
          onClick={handleEnterApp}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <span>الدخول إلى التطبيق</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

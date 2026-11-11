import { useEffect, useState } from 'react';
import { ChevronLeft, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNav } from '@/lib/navigation';
import { SafeImage } from '@/components/SafeImage';
import type { Section } from '@/lib/types';

export function SectionsScreen() {
  const { navigate } = useNav();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('display_order');

    if (!error && data) {
      setSections(data as Section[]);
    }
    setLoading(false);
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
      <div className="text-center mb-8">
        <h2 className="font-display font-bold italic text-ink-900 text-2xl">
          الأقسام المتاحة
        </h2>
        <div className="mx-auto mt-3 w-24 h-0.5 bg-ink-900 rounded-full" />
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">لا توجد أقسام متاحة حاليا</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => navigate('lessons', { sectionId: section.id })}
              className="w-full card text-right hover:bg-ink-200 active:scale-[0.98] transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  {section.cover_url ? (
                    <SafeImage
                      src={section.cover_url}
                      alt={section.title}
                      className="w-full h-full object-cover"
                      fallbackClassName="w-full h-full"
                      fallbackIconSize={20}
                    />
                  ) : (
                    <FolderOpen className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-ink-900 text-base mb-0.5">{section.title}</h3>
                  {section.description && (
                    <p className="text-xs text-ink-500 leading-relaxed line-clamp-2">
                      {section.description}
                    </p>
                  )}
                </div>
                <ChevronLeft className="w-5 h-5 text-ink-400 shrink-0 mt-3" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

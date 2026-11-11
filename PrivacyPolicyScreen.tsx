import { Shield, X } from 'lucide-react';
import { useState } from 'react';
import { APP_TITLE } from '@/lib/constants';

export function PrivacyPolicyScreen() {
  const [showFr, setShowFr] = useState(true);

  return (
    <div className="flex flex-col animate-fade-in pb-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-ink-900 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h2 className="font-bold text-ink-900 text-lg">سياسة الخصوصية</h2>
        <p className="text-xs text-ink-500 mt-1">Politique de Confidentialité</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowFr(true)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            showFr ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700'
          }`}
        >
          Français
        </button>
        <button
          onClick={() => setShowFr(false)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            !showFr ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700'
          }`}
        >
          العربية
        </button>
      </div>

      {showFr ? (
        <div className="card space-y-4 text-sm text-ink-700 leading-relaxed text-right" dir="ltr">
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">1. Responsable du traitement</h3>
            <p className="text-xs">{APP_TITLE} est responsable du traitement des données personnelles collectées dans le cadre de cette application. Les données sont stockées de manière sécurisée sur les serveurs Supabase (hébergement cloud conforme au RGPD).</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">2. Données collectées</h3>
            <p className="text-xs">Nous collectons les données suivantes : adresse e-mail, nom complet, progression d'apprentissage et résultats d'évaluation. Aucune donnée sensible n'est collectée.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">3. Finalité du traitement</h3>
            <p className="text-xs">Les données sont utilisées uniquement pour : la gestion des comptes utilisateurs, le suivi de la formation, l'évaluation des compétences et l'amélioration du contenu pédagogique.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">4. Conservation des données</h3>
            <p className="text-xs">Les données sont conservées pendant la durée nécessaire à la fourniture du service. Les comptes inactifs peuvent être supprimés après une période prolongée d'inactivité.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">5. Partage des données</h3>
            <p className="text-xs">Vos données personnelles ne sont jamais partagées avec des tiers ni vendues à des fins commerciales. Elles restent strictement internes à la plateforme {APP_TITLE}.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">6. Sécurité</h3>
            <p className="text-xs">Les données sont chiffrées et stockées sur Supabase, un service cloud sécurisé conforme aux normes RGPD. L'accès aux données est restreint aux administrateurs autorisés uniquement.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">7. Vos droits</h3>
            <p className="text-xs">Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement et d'opposition. Pour exercer ces droits, contactez l'administrateur de la plateforme.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">8. Application installable (PWA)</h3>
            <p className="text-xs">Cette application est une PWA (Progressive Web App). Aucune donnée n'est stockée localement sur votre appareil en dehors des informations de session nécessaires au fonctionnement de l'application.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">9. Contact</h3>
            <p className="text-xs">Pour toute question concernant vos données personnelles, veuillez contacter l'administrateur de la plateforme.</p>
          </div>
        </div>
      ) : (
        <div className="card space-y-4 text-sm text-ink-700 leading-relaxed text-right" dir="rtl">
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">1. المسؤول عن المعالجة</h3>
            <p className="text-xs">{APP_TITLE} هي المسؤولة عن معالجة البيانات الشخصية المجمعة في إطار هذا التطبيق. يتم تخزين البيانات بشكل آمن على خوادم Supabase (استضافة سحابية متوافقة مع اللائحة العامة لحماية البيانات RGPD).</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">2. البيانات المجمعة</h3>
            <p className="text-xs">نجمع البيانات التالية: عنوان البريد الإلكتروني، الاسم الكامل، تقدم التعلم ونتائج التقييم. لا يتم جمع أي بيانات حساسة.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">3. غرض المعالجة</h3>
            <p className="text-xs">تُستخدم البيانات حصراً من أجل: إدارة حسابات المستخدمين، متابعة التكوين، تقييم الكفاءات وتحسين المحتوى التعليمي.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">4. حفظ البيانات</h3>
            <p className="text-xs">تُحفظ البيانات طوال المدة اللازمة لتقديم الخدمة. يمكن حذف الحسابات غير النشطة بعد فترة طويلة من عدم النشاط.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">5. مشاركة البيانات</h3>
            <p className="text-xs">لا تتم مشاركة بياناتك الشخصية مع أي طرف ثالث ولا تُباع لأغراض تجارية. تبقى حصراً داخل منصة {APP_TITLE}.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">6. الأمان</h3>
            <p className="text-xs">البيانات مشفرة ومخزنة على Supabase، خدمة سحابية آمنة متوافقة مع معايير RGPD. الوصول إلى البيانات مقتصر على المسؤولين المصرح لهم فقط.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">7. حقوقك</h3>
            <p className="text-xs">وفقاً للائحة RGPD، لديك حقوق الوصول والتصحيح والحذف والاعتراض. لممارسة هذه الحقوق، اتصل بمسؤول المنصة.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">8. التطبيق القابل للتثبيت (PWA)</h3>
            <p className="text-xs">هذا التطبيق هو PWA (تطبيق ويب تقدمي). لا يتم تخزين أي بيانات محلياً على جهازك خارج معلومات الجلسة الضرورية لعمل التطبيق.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-1.5">9. الاتصال</h3>
            <p className="text-xs">لأي سؤال يتعلق ببياناتك الشخصية، يرجى الاتصال بمسؤول المنصة.</p>
          </div>
        </div>
      )}
    </div>
  );
}

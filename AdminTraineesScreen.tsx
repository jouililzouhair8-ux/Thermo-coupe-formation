import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Mail, Phone, X, Users, Ban, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Profile } from '@/lib/types';

export function AdminTraineesScreen() {
  const { profile: adminProfile } = useAuth();
  const [trainees, setTrainees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadTrainees();
  }, []);

  const loadTrainees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'trainee')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrainees(data as Profile[]);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword) return;
    setError(null);
    setSubmitting(true);

    const rawInput = newEmail.trim();
    const isEmail = rawInput.includes('@');
    const authEmail = isEmail ? rawInput.toLowerCase() : `${rawInput}@app.local`;
    const phoneNumber = isEmail ? '' : rawInput;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: newPassword,
        options: {
          data: {
            full_name: newName.trim(),
            role: 'trainee',
            phone_number: phoneNumber,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setSubmitting(false);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: authEmail,
          full_name: newName.trim(),
          phone_number: phoneNumber,
          role: 'trainee',
          status: 'active',
        }, { onConflict: 'id' });

        if (profileError) {
          setError('تم إنشاء الحساب ولكن فشل حفظ البيانات');
        } else {
          setNewName('');
          setNewEmail('');
          setNewPassword('');
          setShowAdd(false);
          loadTrainees();
        }
      }
    } catch {
      setError('فشل إنشاء الحساب');
    }
    setSubmitting(false);
  };

  const handleDelete = async (traineeId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المتدرب؟')) return;

    const { error: progressError } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('trainee_id', traineeId);

    if (progressError) {
      console.error('Error deleting progress:', progressError.message);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', traineeId);

    if (!profileError) {
      setTrainees((prev) => prev.filter((t) => t.id !== traineeId));
    }
  };

  const toggleBlock = async (trainee: Profile) => {
    setTogglingId(trainee.id);
    const newStatus = trainee.status === 'blocked' ? 'active' : 'blocked';
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', trainee.id);

    if (!error) {
      setTrainees((prev) =>
        prev.map((t) => (t.id === trainee.id ? { ...t, status: newStatus } : t))
      );
    }
    setTogglingId(null);
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
        <h2 className="font-bold text-ink-900 text-lg">إدارة المتدربين</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-ink-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 active:scale-95 transition-transform"
        >
          <UserPlus className="w-4 h-4" />
          إضافة
        </button>
      </div>

      {trainees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">لا يوجد متدربون بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trainees.map((trainee) => (
            <div key={trainee.id} className="card space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ink-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {trainee.full_name?.charAt(0) || trainee.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm truncate">
                    {trainee.full_name || 'بدون اسم'}
                  </p>
                  {trainee.phone_number ? (
                    <p className="text-xs text-ink-500 truncate flex items-center gap-1" dir="ltr">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{trainee.phone_number}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-ink-500 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {trainee.email}
                    </p>
                  )}
                </div>
                {trainee.status === 'blocked' && (
                  <span className="text-xs font-semibold text-white bg-ink-900 px-2 py-0.5 rounded-full shrink-0">
                    محظور
                  </span>
                )}
              </div>

              {trainee.id !== adminProfile?.id && (
                <div className="flex gap-1.5 pt-1 border-t border-ink-200">
                  <button
                    onClick={() => toggleBlock(trainee)}
                    disabled={togglingId === trainee.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 active:scale-95 transition-all disabled:opacity-50 ${
                      trainee.status === 'blocked'
                        ? 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                        : 'bg-ink-100 text-ink-700 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    {togglingId === trainee.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : trainee.status === 'blocked' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تفعيل الحساب
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        حظر المتدرب
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(trainee.id)}
                    className="flex items-center justify-center gap-1 text-xs font-semibold text-ink-700 bg-ink-100 rounded-lg px-3 py-2 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in" onClick={() => setShowAdd(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink-900 text-base">إضافة متدرب جديد</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-2 rounded-lg hover:bg-ink-100 active:scale-90 transition-all"
              >
                <X className="w-5 h-5 text-ink-900" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="label-text">الاسم الكامل</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="اسم المتدرب"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">رقم الهاتف / البريد</label>
                <input
                  type="text"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="06XXXXXXXX"
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="label-text">كلمة المرور</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !newEmail.trim() || !newPassword}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'إنشاء الحساب'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { applyUpdate, usePendingUpdate } from "@/lib/pwa";

export function UpdatePrompt() {
  const { pending, dismiss } = usePendingUpdate();
  if (!pending) return null;
  return (
    <div dir="rtl" className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 px-[24px]">
      <div className="w-full max-w-[340px] rounded-[20px] bg-card p-[22px] text-center shadow-xl">
        <h2 className="text-[18px] font-extrabold">يوجد تحديث جديد</h2>
        <p className="mt-[8px] text-[15px] text-foreground/70">هل تريد التحديث؟</p>
        <div className="mt-[20px] flex gap-[8px]">
          <button onClick={() => applyUpdate(pending)} className="h-[48px] flex-1 rounded-[12px] bg-primary font-bold text-primary-foreground active:scale-95">نعم</button>
          <button onClick={dismiss} className="h-[48px] flex-1 rounded-[12px] border border-foreground font-bold active:scale-95">لا</button>
        </div>
      </div>
    </div>
  );
}

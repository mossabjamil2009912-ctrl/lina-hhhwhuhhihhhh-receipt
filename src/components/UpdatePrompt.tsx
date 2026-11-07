import { useEffect } from "react";
import { applyUpdate, usePendingUpdate } from "@/lib/pwa";

// Forced update: when a new version is downloaded, apply it immediately.
export function UpdatePrompt() {
  const { pending } = usePendingUpdate();
  useEffect(() => { if (pending) applyUpdate(pending); }, [pending]);
  if (!pending) return null;
  return (
    <div dir="rtl" className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 px-[24px]">
      <div className="w-full max-w-[340px] rounded-[20px] bg-card p-[22px] text-center shadow-xl">
        <h2 className="text-[18px] font-extrabold">جارٍ التحديث…</h2>
        <p className="mt-[8px] text-[15px] text-foreground/70">يتم تثبيت النسخة الجديدة</p>
      </div>
    </div>
  );
}

import { addOp } from "@/lib/ops";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { JaibLoader, JaibReceiptLogo } from "@/components/JaibMark";
import toneUrl from "@/assets/jaib/tone2.mp3";
const okTone = { url: toneUrl };
import { Copy, Download, Eye, EyeOff, Heart, Share2, X } from "lucide-react";
import top from "@/assets/jaib/sub_top.webp";
import ct from "@/assets/jaib/sub_ct.webp";
import logo from "@/assets/jaib/sub_logo.webp";
import { useOwner } from "@/lib/owner";
function OwnerName() { return <>{useOwner().name}</>; }
function OwnerPhone() { return <>{useOwner().phone}</>; }

import jaibMark from "@/assets/jaib/jaiblogo.webp";
import { fmt, saveBalances, useWallet } from "@/lib/wallet";
import { curName, deduct, makeRef, toWords, type Cur } from "@/lib/transfer";

const order: Cur[] = ["yer", "sar", "usd"];
const PIN = "7735909";

function Field({ label, value, focus, children }: { label: string; value: boolean; focus?: boolean; children: ReactNode }) {
  return (
    <div className={`relative flex h-[59px] items-center rounded-[12px] border bg-card ${focus ? "border-2 border-foreground" : "border-border"}`}>
      {value && <span className="absolute -top-[10px] right-[14px] bg-card px-[4px] text-[13px] text-muted-foreground">{label}</span>}
      {children}
    </div>
  );
}

function Sheet({ children, onClose, top, dim = true, fit }: { children: ReactNode; onClose: () => void; top?: number; dim?: boolean; fit?: number }) {
  return (
    <div className={`fixed inset-0 z-40 flex justify-center px-[12px] ${top === undefined ? "items-end pb-[28px]" : "items-start"} ${dim ? (top === undefined ? "bg-foreground/60" : "bg-foreground/65") : ""} jaib-fade`} style={top === undefined ? undefined : { paddingTop: top }}>
      <div className="jaib-up relative w-full max-w-[366px] rounded-[22px] bg-card" style={fit ? (() => { const z = Math.min(1, (window.innerHeight - 150) / fit); return { zoom: z, maxWidth: "none", width: `calc(min(100vw - 24px, 366px) / ${z})` }; })() : undefined}>
        <button aria-label="إغلاق" onClick={onClose} className="absolute left-[24px] top-[20px] z-10 active:scale-90"><X className="h-[22px] w-[22px]" strokeWidth={2.5} /></button>
        {children}
      </div>
    </div>
  );
}

export function TransferForm() {
  const { balances, customers } = useWallet();
  const [cur, setCur] = useState<Cur>("yer");
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState("");
  const [msg, setMsg] = useState("");
  const [step, setStep] = useState<"form" | "review" | "pin" | "load" | "done">("form");
  const [pin, setPin] = useState("");
  const [pinShow, setPinShow] = useState(false);
  const [pinErr, setPinErr] = useState("");
  const [receipt, setReceipt] = useState<{ ref: string; date: string; name: string; phone: string; amount: number; cur: Cur } | null>(null);
  const [fav, setFav] = useState(false);
  const [toast, setToast] = useState(false);
  const rcpt = useRef<HTMLDivElement>(null);
  const tone = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    let blobUrl = "";
    const a = new Audio(okTone.url);
    a.preload = "auto";
    tone.current = a;
    fetch(okTone.url).then((r) => r.blob()).then((b) => {
      blobUrl = URL.createObjectURL(b);
      a.src = blobUrl;
      a.load();
    }).catch(() => a.load());
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, []);

  const n = Number(amount);
  const who = customers.find((c) => c.phone.trim() === phone.trim());

  const proceed = () => {
    if (!phone.trim()) return setMsg("الرجاء إدخال رقم الموبايل");
    if (!who) return setMsg("هذا الرقم غير مسجل");
    if (!(n > 0)) return setMsg("الرجاء إدخال المبلغ");
    if (n > balances[cur]) return setMsg("الرصيد غير كافٍ");
    setMsg("");
    setStep("load");
    setTimeout(() => setStep("review"), 2000);
  };

  const execute = () => {
    const nb = deduct(balances, cur, n);
    if (!nb) { setStep("form"); return setMsg("الرصيد غير كافٍ"); }
    setStep("load");
    setTimeout(() => {
      saveBalances(nb);
      addOp({ title: "تحويل مشترك", amount: n, cur, sign: -1 });
      const d = new Date();
      const p = (x: number) => String(x).padStart(2, "0");
      setReceipt({
        ref: makeRef(),
        date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} (${p(d.getHours())}:${p(d.getMinutes())})`,
        name: who!.name, phone: who!.phone, amount: n, cur,
      });
      setStep("done");
      const a = tone.current ?? new Audio(okTone.url);
      a.currentTime = 0;
      a.play().catch(() => {});
    }, 2000);
  };

  const confirm = (bio = false) => {
    if (!bio && pin.length < 4) return setPinErr("طول رمز التأكيد يجب أن يكون 4 أرقام أو أكثر");
    if (!bio && pin !== PIN) return setPinErr("رمز التأكيد غير صحيح");
    setPinErr(""); setPin(""); execute();
  };

  const reset = () => { setStep("form"); setPhone(""); setAmount(""); setNotes(""); setReceipt(null); setFav(false); };

  const share = async () => {
    if (!receipt) return;
    const text = `ايصال جيب\n${receipt.amount} ${curName[receipt.cur]}\nرقم المرجع: ${receipt.ref}\nالمستفيد: ${receipt.name} ${receipt.phone}`;
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch { /* ignore */ }
  };

  const save = async () => {
    try {
      if (rcpt.current) { rcpt.current.classList.add("jaib-rc-still"); let url = ""; try { url = await toPng(rcpt.current, { backgroundColor: "#fff", pixelRatio: 2 }); } finally { rcpt.current?.classList.remove("jaib-rc-still"); } const a = document.createElement("a"); a.href = url; a.download = `jaib-${receipt?.ref}.png`; a.click(); }
    } catch { /* ignore */ }
    setToast(true); setTimeout(() => setToast(false), 3000);
  };
  const sugg = phone && !who ? customers.filter((c) => c.phone.startsWith(phone)) : [];

  const input = "h-full w-full bg-transparent px-[16px] text-[16.5px] outline-none placeholder:text-muted-foreground";
  const sq = "flex h-[59px] w-[59px] shrink-0 items-center justify-center rounded-[12px] border border-border bg-card active:scale-90";

  return (
    <div className="-mt-[12px] min-h-[calc(100dvh-93px)] rounded-t-[28px] bg-card px-[16px] pt-[24px]">
      <div className="mb-[18px] flex justify-center">
        <img src={top} alt="" className="h-[50px] w-[67px] rounded-[10px] bg-card shadow-md" />
      </div>

      <div className="flex gap-[5px]">
        <div className="relative flex-1">
          <Field label="حساب المحفظة" value focus={open}>
            <button onClick={() => setOpen(!open)} className="flex h-full w-full items-center justify-between px-[16px] text-[16.5px] text-muted-foreground">
              <span>{curName[cur]} | {show ? fmt(balances[cur]) : "#####"}</span>
              <span className={`border-x-[6px] border-x-transparent ${open ? "border-b-[7px] border-b-foreground" : "border-t-[7px] border-t-foreground"}`} />
            </button>
          </Field>
          {open && (
            <div className="absolute inset-x-0 top-[60px] z-10 bg-card py-[8px] shadow-lg">
              {order.map((c) => (
                <button key={c} onClick={() => { setCur(c); setOpen(false); }} className="block w-full px-[13px] py-[14px] text-start text-[16px] active:bg-muted">{curName[c]}</button>
              ))}
            </div>
          )}
        </div>
        <button aria-label="إظهار الرصيد" onClick={() => setShow(!show)} className={sq}>
          {show ? <Eye className="h-6 w-6 text-primary" strokeWidth={2.5} /> : <EyeOff className="h-6 w-6 text-primary" strokeWidth={2.5} />}
        </button>
      </div>

      <div className="mt-[15px] flex gap-[5px]">
        <div className="relative flex-1">
          <Field label="رقم الموبايل" value={!!phone || focus === "phone"} focus={focus === "phone"}>
            <input value={phone} onFocus={() => setFocus("phone")} onBlur={() => setFocus("")} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={focus === "phone" ? "" : "رقم الموبايل"} className={input} />
            <img src={ct} alt="" className="ms-[8px] me-[12px] h-[28px] w-[25px]" />
          </Field>
          {focus === "phone" && sugg.length > 0 && (
            <div className="absolute inset-x-0 top-[62px] z-10 mt-[4px] rounded-[12px] border border-border bg-card py-[6px] shadow-lg">
              {sugg.map((c) => (
                <button key={c.phone} onMouseDown={(e) => e.preventDefault()} onClick={() => setPhone(c.phone)} className="flex w-full items-center justify-between px-[12px] py-[10px] text-[14px] active:bg-muted">
                  <span>[ {c.name} ]</span><span className="font-bold">{c.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button aria-label="المفضلة" className={sq}><Heart className="h-[26px] w-[26px] text-primary" strokeWidth={2.3} /></button>
        <button aria-label="مسح" className={sq}>
          <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="none" strokeWidth="2"><path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3" className="stroke-foreground" /><path d="M6 9h12M6 12h12M6 15h12" strokeWidth="1.3" className="stroke-primary" /></svg>
        </button>
      </div>
      <p className="mt-[8px] px-[4px] text-[15.5px] text-foreground">يمكنك استخدام الرقم البديل أو رقم الموبايل للتحويل إلى مشترك</p>

      <div className="mt-[14px]">
        <Field label="المبلغ" value={!!amount || focus === "amount"} focus={focus === "amount" || step === "review" || step === "pin"}>
          <input value={amount} onFocus={() => setFocus("amount")} onBlur={() => setFocus("")} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder={focus === "amount" ? "" : "المبلغ"} className={input} />
        </Field>
        {n > 0 && step !== "review" && step !== "pin" && <p className="mt-[9px] px-[4px] text-[15px]">{toWords(n)} {curName[cur]}</p>}
      </div>
      <div className="mt-[14px]">
        <Field label="ملاحظات" value={!!notes || focus === "notes"} focus={focus === "notes"}>
          <input value={notes} onFocus={() => setFocus("notes")} onBlur={() => setFocus("")} onChange={(e) => setNotes(e.target.value)} placeholder={focus === "notes" ? "" : "ملاحظات"} className={input} />
        </Field>
      </div>
      {msg && <p className="mt-[12px] text-center text-[14px] text-primary">{msg}</p>}
      <button onClick={proceed} className="mt-[25px] h-[52px] w-full rounded-[12px] bg-primary text-[15px] font-bold text-primary-foreground active:scale-[0.98]">استمرار</button>

      {(step === "review" || step === "pin") && who && (
        <Sheet onClose={() => setStep("form")}>
          <div className="px-[12px] pb-[24px] pt-[55px]">
            <h2 className="text-center text-[21px] font-bold leading-[24px]">بيانات الحركة</h2>
            <div className="mt-[11px] flex h-[60px] items-center justify-center gap-[34px] rounded-[12px] bg-foreground/15">
              <span className="text-[25px] font-bold">{amount}</span>
              <span className="text-[19px] text-foreground/80">{curName[cur]}</span>
            </div>
            <div className="mt-[17px] flex h-[20px] items-center justify-between px-[1px] text-[16.5px]"><span className="text-muted-foreground">العملية</span><span className="font-semibold">تحويل إلى مشترك</span></div>
            <div className="mt-[11px] flex h-[58px] flex-col justify-center gap-[6px] rounded-[12px] border border-foreground text-center text-[16.5px] font-bold leading-[20px]">
              <div>{who.name}</div>
              <div>{who.phone}</div>
            </div>
            <p className="mt-[25px] h-[20px] text-center text-[16px] font-bold leading-[20px] text-primary">يرجى التحقق من البيانات كون العملية لا يمكن إلغائها</p>
            <div className="mt-[14px] flex gap-[7px]">
              <button onClick={() => setStep("pin")} className="h-[51px] flex-1 rounded-[14px] bg-primary text-[17px] font-bold text-primary-foreground active:scale-95">تنفيذ</button>
              <button onClick={() => setStep("form")} className="h-[51px] flex-1 rounded-[14px] border-[1.5px] border-foreground text-[17px] font-bold active:scale-95">إلغاء</button>
            </div>
          </div>
        </Sheet>
      )}
      {step === "pin" && (
        <Sheet top={250} onClose={() => setStep("review")}>
          <div className="px-[17px] pb-[25px] pt-[56px]">
            <h2 className="text-center text-[21px] font-bold leading-[24px]">تأكيد العملية</h2>
            <p className="mt-[10px] text-center text-[16.5px] leading-[26px]">لتأكيد العمليات باستخدام البصمة، قم بتفعيل الخيار من الإعدادات</p>
            <p className="mt-[30px] h-[22px] text-center text-[17px] leading-[22px]">قم بإدخال رمز التأكيد أو كلمة المرور</p>
            <div className={`mt-[12px] flex h-[59px] items-center rounded-[12px] ${pinErr ? "border-2 border-primary" : "border border-border"}`}>
              <button aria-label="إظهار" onClick={() => setPinShow(!pinShow)} className="px-[14px]">{pinShow ? <Eye className="h-6 w-6" strokeWidth={2.5} /> : <EyeOff className="h-6 w-6" strokeWidth={2.5} />}</button>
              <input value={pin} onChange={(e) => { setPin(e.target.value); setPinErr(""); }} inputMode="numeric" type={pinShow ? "text" : "password"} placeholder="رمز التأكيد" className="h-full flex-1 bg-transparent px-[16px] text-left text-[16.5px] outline-none placeholder:text-muted-foreground" />
            </div>
            {pinErr && <p className="mt-[6px] text-start text-[13px] text-primary">{pinErr}</p>}
            <button onClick={() => confirm()} className="mt-[13px] h-[50px] w-full rounded-[14px] bg-primary text-[17px] font-bold text-primary-foreground active:scale-95">تأكيد</button>
          </div>
        </Sheet>
      )}

      {step === "load" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 jaib-fade">
          <JaibLoader />
        </div>
      )}

      {step === "done" && receipt && (
        <Sheet onClose={reset} fit={650}>
          <div ref={rcpt} className="relative rounded-[22px] bg-card pb-[25px] pt-[59px]">
            <JaibReceiptLogo />
            <h2 className="mt-[12px] text-center text-[19px] font-bold leading-[22px]">ايصال العملية</h2>
            <div className="mx-[20px] mt-[11px] flex h-[53px] items-center justify-center gap-[14px] rounded-[12px] bg-foreground/15">
              <span className="text-[23px] font-bold text-primary">{receipt.amount}</span>
              <span className="text-[19px] text-foreground/80">{curName[receipt.cur]}</span>
            </div>
            <div className="mx-[28px] mt-[5px] text-[15.5px]">
              <div className="flex h-[42px] items-center justify-between border-b border-border"><span className="text-foreground/50">رقم مرجع العملية</span>
                <button onClick={() => navigator.clipboard?.writeText(receipt.ref)} className="flex items-center gap-[6px] font-bold active:scale-95"><Copy className="h-[19px] w-[19px]" strokeWidth={2.4} />{receipt.ref}</button></div>
              <div className="flex h-[43px] items-center justify-between border-b border-border"><span className="text-foreground/50">العملية</span><span className="font-bold">تحويل مشترك</span></div>
              <div className="flex h-[44px] items-center justify-between border-b border-border"><span className="text-foreground/50">تاريخ العملية</span><span className="font-bold" dir="ltr">{receipt.date}</span></div>
              <div className="flex h-[69px] items-start justify-between border-b border-border pt-[12px]"><span className="text-foreground/50">المستفيد</span><span className="text-end font-bold leading-[26px]">{receipt.name}<br />{receipt.phone}</span></div>
              <div className="flex h-[68px] items-start justify-between border-b border-border pt-[12px]"><span className="text-foreground/50">المودع</span><span className="text-end font-bold leading-[26px]"><OwnerName /><br /><OwnerPhone /></span></div>
            </div>
            <div className="mt-[22px] flex justify-center gap-[26px] text-[14.5px] font-bold">
              {[
                { l: "حفظ", i: <Download className="h-[24px] w-[24px] text-primary" />, f: save },
                { l: "اضافة للمفضلة", i: <Heart className={`h-[24px] w-[24px] text-primary ${fav ? "fill-primary" : ""}`} />, f: () => setFav(!fav) },
                { l: "مشاركة", i: <Share2 className="h-[24px] w-[24px]" />, f: share },
              ].map((b) => (
                <button key={b.l} onClick={b.f} className="flex w-[57px] flex-col items-center gap-[14px] whitespace-nowrap active:scale-95">
                  <span className="flex h-[57px] w-[57px] items-center justify-center rounded-[12px] bg-muted">{b.i}</span>{b.l}
                </button>
              ))}
            </div>
            {toast && (
              <div className="jaib-fade absolute inset-x-0 bottom-[40px] flex justify-center">
                <div className="flex items-center gap-[8px] rounded-full bg-foreground/75 px-[18px] py-[10px] text-[14px] text-background">
                  <img src={jaibMark} alt="" className="h-[18px] w-[18px] rounded-full bg-background" />تم حفظ الايصال لمعرض الصور
                </div>
              </div>
            )}
          </div>
        </Sheet>
      )}
    </div>
  );
}

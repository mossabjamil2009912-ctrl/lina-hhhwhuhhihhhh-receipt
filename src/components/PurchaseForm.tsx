import { useState } from "react";
import { ChevronDown, EyeOff, Eye, Heart, ScanLine } from "lucide-react";
import pay from "@/assets/jaib/pay.webp";
import { saveBalances, useWallet } from "@/lib/wallet";
import { deduct, type Cur } from "@/lib/transfer";
import { addOp } from "@/lib/ops";

export function PurchaseForm() {
  const { accounts: w, balances } = useWallet();
  const keys: Cur[] = ["yer", "sar", "usd"];
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const accounts = [w[1]!, w[0]!, w[2]!];
  const [via, setVia] = useState<"jaib" | "other">("jaib");
  const [acc, setAcc] = useState(0);
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  const field = "h-[59px] w-full rounded-[12px] border border-border bg-card px-[16px] text-[15px] outline-none placeholder:text-muted-foreground focus:border-foreground/40";
  const tab = (on: boolean) => `h-[41px] flex-1 rounded-[12px] border-[1.5px] border-foreground text-[15px] font-bold active:scale-95 ${on ? "bg-foreground/20" : "bg-card"}`;

  const submit = () => {
    if (!pos.trim()) return setMsg("الرجاء إدخال رقم نقطة البيع");
    const n = Number(amount);
    if (!(n > 0)) return setMsg("الرجاء إدخال المبلغ");
    const nb = deduct(balances, keys[acc]!, n);
    if (!nb) return setMsg("الرصيد غير كافٍ");
    setMsg("");
    setBusy(true);
    setTimeout(() => { saveBalances(nb); addOp({ title: "دفع مشتريات", amount: n, cur: keys[acc]!, sign: -1 }); setBusy(false); setDone(true); setPos(""); setAmount(""); setNotes(""); }, 1200);
  };

  return (
    <div className="-mt-[12px] min-h-[calc(100dvh-93px)] rounded-t-[28px] bg-card px-[16px] pt-[32px]">
      <div className="mb-[24px] flex justify-center">
        <img src={pay} alt="" className="h-[50px] w-[67px] rounded-[10px] bg-card shadow-md" />
      </div>
      <div className="flex gap-[9px]">
        <button className={tab(via === "jaib")} onClick={() => setVia("jaib")}>عبر جيب</button>
        <button className={tab(via === "other")} onClick={() => setVia("other")}>عبر محافظ اخرى</button>
      </div>

      <div className="mt-[15px] flex gap-[5px]">
        <div className="relative flex-1">
          <span className="absolute -top-[9px] right-[12px] bg-card px-[4px] text-[12px] text-muted-foreground">حساب المحفظة</span>
          <button onClick={() => setOpen(!open)} className={`${field} flex items-center justify-between text-muted-foreground`}>
            <span>{accounts[acc]!.name} | {show ? accounts[acc]!.amount : "#####"}</span>
            <ChevronDown className="h-5 w-5 fill-foreground text-foreground" />
          </button>
          {open && (
            <div className="absolute inset-x-0 top-[62px] z-10 overflow-hidden rounded-[12px] border border-border bg-card shadow-lg">
              {accounts.map((a, i) => (
                <button key={a.name} onClick={() => { setAcc(i); setOpen(false); }} className="block w-full px-[16px] py-[12px] text-start text-[15px] active:bg-muted">{a.name}</button>
              ))}
            </div>
          )}
        </div>
        <button aria-label="إظهار الرصيد" onClick={() => setShow(!show)} className="flex h-[59px] w-[59px] items-center justify-center rounded-[12px] border border-border active:scale-90">
          {show ? <Eye className="h-6 w-6 text-primary" strokeWidth={2.5} /> : <EyeOff className="h-6 w-6 text-primary" strokeWidth={2.5} />}
        </button>
      </div>

      <div className="mt-[16px] flex items-center gap-[12px]">
        <div className="relative flex-1">
          <input value={pos} onChange={(e) => setPos(e.target.value)} inputMode="numeric" placeholder="رقم نقطة البيع" className={`${field} pe-[60px]`} />
          <ScanLine className="pointer-events-none absolute left-[16px] top-1/2 h-7 w-7 -translate-y-1/2 text-primary" />
        </div>
        <span className="text-[15px]">أو</span>
        <button aria-label="المفضلة" className="flex h-[57px] w-[57px] items-center justify-center rounded-[12px] border border-border active:scale-90">
          <Heart className="h-6 w-6 text-primary" strokeWidth={2.5} />
        </button>
      </div>

      <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="المبلغ" className={`${field} mt-[16px]`} />
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات" className={`${field} mt-[16px]`} />

      {msg && <p className="mt-[10px] text-[13px] text-primary">{msg}</p>}
      {busy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40">
          <div className="h-[56px] w-[56px] animate-spin rounded-full border-[5px] border-card border-t-primary" />
        </div>
      )}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-[24px]" onClick={() => setDone(false)}>
          <div className="w-full rounded-[16px] bg-card p-[20px] text-center">
            <p className="text-[16px] font-bold">تمت عملية الدفع بنجاح</p>
            <button onClick={() => setDone(false)} className="mt-[16px] h-[46px] w-full rounded-[12px] bg-primary text-[15px] font-bold text-primary-foreground">موافق</button>
          </div>
        </div>
      )}
      <button onClick={submit} className="mt-[26px] h-[51px] w-full rounded-[12px] bg-primary text-[15px] font-bold text-primary-foreground active:scale-[0.98]">استمرار</button>
    </div>
  );
}

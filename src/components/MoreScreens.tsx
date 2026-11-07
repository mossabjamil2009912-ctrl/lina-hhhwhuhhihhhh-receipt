import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Eye, EyeOff, Heart } from "lucide-react";
import { saveBalances, useWallet } from "@/lib/wallet";
import { curName, deduct, toWords, type Cur } from "@/lib/transfer";
import { exchange, exchangeCost, PACKAGES, RATES } from "@/lib/exchange";
import { addOp, filterOps, useOps } from "@/lib/ops";
import { JaibLoader } from "@/components/JaibMark";
import ctc from "@/assets/jaib/ctc.webp";
import xch from "@/assets/jaib/xch.webp";
import xswap from "@/assets/jaib/xswap.webp";
import nwgrid from "@/assets/jaib/nwgrid.webp";
import ln1 from "@/assets/jaib/ln1.webp";
import ln2 from "@/assets/jaib/ln2.webp";
import ln3 from "@/assets/jaib/ln3.webp";

const field = "h-[56px] w-full rounded-[12px] border border-border bg-card px-[16px] text-[15px] outline-none placeholder:text-muted-foreground focus:border-foreground/40";
const red = "h-[51px] w-full rounded-[12px] bg-primary text-[15px] font-bold text-primary-foreground active:scale-[0.98]";
const curs: Cur[] = ["yer", "sar", "usd"];

function Card({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="-mt-[12px] min-h-[calc(100dvh-93px)] rounded-t-[28px] bg-card px-[16px] pb-[30px] pt-[32px]">
      <div className="mb-[24px] flex justify-center"><img src={icon} alt="" className="h-[50px] w-[67px] rounded-[10px] bg-card object-cover shadow-md" /></div>
      {children}
    </div>
  );
}

function Label({ t, children }: { t: string; children: ReactNode }) {
  return <div className="relative">{<span className="absolute -top-[9px] right-[12px] z-[1] bg-card px-[4px] text-[12px] text-muted-foreground">{t}</span>}{children}</div>;
}

function useResult() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const run = (fn: () => void, text: string) => { setBusy(true); setTimeout(() => { fn(); setBusy(false); setDone(text); }, 1500); };
  const ui = (
    <>
      {busy && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60"><JaibLoader /></div>}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-[24px]" onClick={() => setDone("")}>
          <div className="w-full rounded-[16px] bg-card p-[20px] text-center">
            <p className="whitespace-pre-line text-[16px] font-bold">{done}</p>
            <button onClick={() => setDone("")} className={`${red} mt-[16px] h-[46px]`}>موافق</button>
          </div>
        </div>
      )}
    </>
  );
  return { run, ui };
}

function AccSelect({ value, onChange, show }: { value: Cur; onChange: (c: Cur) => void; show: boolean }) {
  const { balances } = useWallet();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex-1">
      <button type="button" onClick={() => setOpen(!open)} className={`${field} flex items-center justify-between text-muted-foreground`}>
        <span>{curName[value]} | {show ? balances[value].toLocaleString("en-US") : "#####"}</span>
        <ChevronDown className="h-5 w-5 fill-foreground text-foreground" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[59px] z-10 overflow-hidden rounded-[12px] border border-border bg-card shadow-lg">
          {curs.map((c) => <button key={c} type="button" onClick={() => { onChange(c); setOpen(false); }} className="block w-full px-[16px] py-[12px] text-start text-[15px] active:bg-muted">{curName[c]}</button>)}
        </div>
      )}
    </div>
  );
}

export function ExchangeForm() {
  const { balances } = useWallet();
  const [from, setFrom] = useState<Cur>("yer");
  const [to, setTo] = useState<Cur>("sar");
  const [show, setShow] = useState({ a: false, b: false });
  const [amt, setAmt] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const { run, ui } = useResult();
  const [rates, setRates] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRates(true), 1500); return () => clearTimeout(t); }, []);
  const n = Number(amt);
  const cost = n > 0 && from !== to ? exchangeCost(from, to, n) : 0;
  const eye = (k: "a" | "b") => (
    <button type="button" aria-label="إظهار الرصيد" onClick={() => setShow({ ...show, [k]: !show[k] })} className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[12px] border border-border active:scale-90">
      {show[k] ? <Eye className="h-6 w-6 text-primary" strokeWidth={2.5} /> : <EyeOff className="h-6 w-6 text-primary" strokeWidth={2.5} />}
    </button>
  );
  const submit = () => {
    if (from === to) return setMsg("اختر حسابين مختلفين");
    if (!(n > 0)) return setMsg("الرجاء إدخال المبلغ");
    const nb = exchange(balances, from, to, n);
    if (!nb) return setMsg("الرصيد غير كافٍ");
    setMsg("");
    run(() => { saveBalances(nb); addOp({ title: "مصارفة", amount: cost, cur: from, sign: -1 }); addOp({ title: "مصارفة", amount: n, cur: to, sign: 1 }); setAmt(""); setNotes(""); }, "تمت عملية المصارفة بنجاح");
  };
  return (
    <Card icon={xch}>
      <div className="relative flex flex-col gap-[16px]">
        <Label t="من حساب"><div className="flex gap-[5px]"><AccSelect value={from} onChange={setFrom} show={show.a} />{eye("a")}</div></Label>
        <button type="button" aria-label="تبديل" onClick={() => { setFrom(to); setTo(from); }} className="absolute left-1/2 top-[45px] z-[2] -translate-x-1/2 active:scale-90"><img src={xswap} alt="" className="h-[36px] w-[36px]" /></button>
        <Label t="إلى حساب"><div className="flex gap-[5px]"><AccSelect value={to} onChange={setTo} show={show.b} />{eye("b")}</div></Label>
        <div className="flex items-center gap-[8px]">
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="المبلغ بالعملة الأجنبية" className={field} />
          <span className="text-[15px]">=</span>
          <input readOnly value={cost ? cost.toLocaleString("en-US") : ""} placeholder="المبلغ المخصوم" className={field} />
        </div>
        <div className="overflow-hidden rounded-[12px] border border-border">
          <div className="grid h-[34px] grid-cols-3 items-center px-[16px] text-[12px] text-muted-foreground"><span>العملة</span><span className="text-center">نبيع بسعر</span><span className="text-center">نشتري بسعر</span></div>
          <div className="flex min-h-[64px] flex-col justify-center bg-foreground/5 py-[6px]">
            {!rates ? <div className="mx-auto h-[14px] w-[14px] animate-spin rounded-full border-b-[2.5px] border-primary" /> : (["sar", "usd"] as Cur[]).map((c) => (
              <div key={c} className="grid h-[28px] grid-cols-3 items-center px-[16px] text-[13px]"><span>{curName[c]}</span><span className="text-center">{RATES[c].sell}</span><span className="text-center">{RATES[c].buy}</span></div>
            ))}
          </div>
        </div>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات" className={field} />
      </div>
      {msg && <p className="mt-[10px] text-[13px] text-primary">{msg}</p>}
      <button onClick={submit} className={`${red} mt-[26px]`}>استمرار</button>
      {ui}
    </Card>
  );
}

export function RemitSearch({ kind }: { kind: "receive" | "status" | "cancel" }) {
  const [no, setNo] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const icon = kind === "receive" ? ln1 : kind === "status" ? ln2 : ln3;
  const search = () => {
    if (!no.trim()) return setMsg("الرجاء إدخال رقم الحوالة");
    setBusy(true); setMsg("");
    setTimeout(() => { setBusy(false); setMsg("لا توجد حوالة بهذا الرقم"); }, 1500);
  };
  return (
    <Card icon={icon}>
      {kind === "receive" && <p className="mb-[20px] text-[15px] font-bold leading-[27px] text-primary">* يجب ان يكون اسم المستلم ورقم الهاتف في الحوالة مطابقاً لبياناتك في المحفظة</p>}
      <input value={no} onChange={(e) => setNo(e.target.value)} placeholder="رقم الحوالة" className={field} />
      {msg && <p className="mt-[10px] text-[13px] text-primary">{msg}</p>}
      <button onClick={search} className={`${red} mt-[26px]`}>بحث عن حوالة</button>
      {kind === "receive" && (
        <>
          <p className="mt-[20px] text-[15px] font-bold text-muted-foreground">يمكنك استلام حوالتك آليا عبر الشبكات التالية</p>
          <img src={nwgrid} alt="الشبكات" className="mt-[16px] w-full" />
        </>
      )}
      {busy && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60"><JaibLoader /></div>}
    </Card>
  );
}

export function RechargeForm({ op, icon }: { op: string; icon: string }) {
  const { balances } = useWallet();
  const pkgs = PACKAGES[op];
  const [pkg, setPkg] = useState(0);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [amt, setAmt] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const { run, ui } = useResult();
  const n = pkgs ? pkgs[pkg]!.price : Number(amt);
  const submit = () => {
    if (!phone.trim()) return setMsg("الرجاء إدخال رقم الموبايل");
    if (!(n > 0)) return setMsg("الرجاء إدخال المبلغ");
    const nb = deduct(balances, "yer", n);
    if (!nb) return setMsg("الرصيد غير كافٍ");
    setMsg("");
    run(() => { saveBalances(nb); addOp({ title: "شحن رصيد", amount: n, cur: "yer", sign: -1 }); setPhone(""); setAmt(""); setNotes(""); }, "تمت عملية الشحن بنجاح");
  };
  return (
    <Card icon={icon}>
      <div className="flex flex-col gap-[13px]">
        {pkgs && (
          <Label t="فئة السداد">
            <button type="button" onClick={() => setOpen(!open)} className={`${field} flex items-center justify-between`}>
              <span>{pkgs[pkg]!.label}</span><ChevronDown className="h-5 w-5 fill-muted-foreground text-muted-foreground" />
            </button>
            {open && (
              <div className="absolute inset-x-0 top-[59px] z-10 overflow-hidden rounded-[12px] border border-border bg-card shadow-lg">
                {pkgs.map((p, i) => <button key={p.label} type="button" onClick={() => { setPkg(i); setOpen(false); }} className="block w-full px-[16px] py-[12px] text-start text-[15px] active:bg-muted">{p.label}</button>)}
              </div>
            )}
          </Label>
        )}
        <div className="flex gap-[5px]">
          <div className="relative flex-1">
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="رقم الموبايل" className={`${field} pl-[56px]`} />
            <img src={ctc} alt="" className="pointer-events-none absolute left-[14px] top-1/2 h-[29px] w-[28px] -translate-y-1/2" />
          </div>
          <button type="button" aria-label="المفضلة" className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[12px] border border-border active:scale-90"><Heart className="h-6 w-6 text-primary" strokeWidth={2.5} /></button>
        </div>
        {pkgs ? (
          <>
            <Label t="المبلغ"><input readOnly value={n} className={field} style={{ color: "var(--muted-foreground)" }} /></Label>
            <p className="-mt-[4px] text-[14px]">{toWords(n)} ريال يمني</p>
          </>
        ) : (
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="المبلغ" className={field} />
        )}
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات" className={field} />
      </div>
      {msg && <p className="mt-[10px] text-[13px] text-primary">{msg}</p>}
      <button onClick={submit} className={`${red} mt-[26px]`}>استمرار</button>
      {ui}
    </Card>
  );
}

export type GenericKind = "pay" | "pay-name" | "pay-code" | "search" | "ops" | "statement" | "find";

function genCode() { return String(Math.floor(1e9 + Math.random() * 9e9)); }

export function GenericForm({ kind, icon, title, numLabel }: { kind: GenericKind; icon: string; title: string; numLabel?: string | undefined }) {
  if (kind === "search") return <RemitSearch kind="status" />;
  if (kind === "ops" || kind === "statement" || kind === "find") return <OpsList kind={kind} />;
  return <PayForm kind={kind} icon={icon} title={title} numLabel={numLabel ?? "رقم المستفيد / الحساب"} />;
}

function PayForm({ kind, icon, title, numLabel }: { kind: GenericKind; icon: string; title: string; numLabel: string }) {
  const { balances } = useWallet();
  const [cur, setCur] = useState<Cur>("yer");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [num, setNum] = useState("");
  const [amt, setAmt] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const { run, ui } = useResult();
  const submit = () => {
    if (kind === "pay-name" && !name.trim()) return setMsg("الرجاء إدخال اسم المستلم");
    if (kind !== "pay-code" && !num.trim()) return setMsg(`الرجاء إدخال ${numLabel}`);
    const n = Number(amt);
    if (!(n > 0)) return setMsg("الرجاء إدخال المبلغ");
    const nb = deduct(balances, cur, n);
    if (!nb) return setMsg("الرصيد غير كافٍ");
    setMsg("");
    const code = kind === "pay-code" ? `\nالرمز: ${genCode()}` : "";
    run(() => { saveBalances(nb); addOp({ title, amount: n, cur, sign: -1 }); setName(""); setNum(""); setAmt(""); setNotes(""); }, `تمت العملية بنجاح${code}`);
  };
  return (
    <Card icon={icon}>
      <div className="flex flex-col gap-[13px]">
        <Label t="حساب المحفظة">
          <div className="flex gap-[5px]">
            <AccSelect value={cur} onChange={setCur} show={show} />
            <button type="button" aria-label="إظهار الرصيد" onClick={() => setShow(!show)} className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[12px] border border-border active:scale-90">
              {show ? <Eye className="h-6 w-6 text-primary" strokeWidth={2.5} /> : <EyeOff className="h-6 w-6 text-primary" strokeWidth={2.5} />}
            </button>
          </div>
        </Label>
        {kind === "pay-name" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المستلم الرباعي" className={field} />}
        {kind !== "pay-code" && (
          <div className="flex gap-[5px]">
            <input value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={numLabel} className={field} />
            <button type="button" aria-label="المفضلة" className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[12px] border border-border active:scale-90"><Heart className="h-6 w-6 text-primary" strokeWidth={2.5} /></button>
          </div>
        )}
        <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="المبلغ" className={field} />
        {Number(amt) > 0 && <p className="-mt-[4px] text-[14px]">{toWords(Number(amt))} {curName[cur]}</p>}
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات" className={field} />
      </div>
      {msg && <p className="mt-[10px] text-[13px] text-primary">{msg}</p>}
      <button onClick={submit} className={`${red} mt-[26px]`}>استمرار</button>
      {ui}
    </Card>
  );
}

function OpsList({ kind }: { kind: "ops" | "statement" | "find" }) {
  const ops = useOps();
  const { balances } = useWallet();
  const [q, setQ] = useState("");
  const list = filterOps(ops, q);
  return (
    <div className="px-[12px] pb-[30px]">
      {kind === "statement" && (
        <div className="mb-[12px] grid grid-cols-3 gap-[6px]">
          {curs.map((c) => <div key={c} className="rounded-[12px] bg-card p-[10px] text-center"><div className="text-[12px] text-muted-foreground">{curName[c]}</div><div className="mt-[4px] text-[14px] font-bold" dir="ltr">{balances[c].toLocaleString("en-US")}</div></div>)}
        </div>
      )}
      {kind === "find" && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو المبلغ أو التاريخ" className={`${field} mb-[12px]`} />}
      {list.length === 0 ? (
        <p className="mt-[40px] text-center text-[14px] text-muted-foreground">لا توجد عمليات</p>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {list.map((o, i) => (
            <div key={i} className="flex items-center justify-between rounded-[12px] bg-card px-[14px] py-[12px]">
              <div><div className="text-[14px] font-bold">{o.title}</div><div className="mt-[4px] text-[12px] text-muted-foreground" dir="ltr">{o.date}</div></div>
              <div className={`text-[14px] font-bold ${o.sign < 0 ? "text-primary" : "text-success"}`} dir="ltr">{o.sign < 0 ? "-" : "+"}{o.amount.toLocaleString("en-US")} <span className="text-[12px] font-normal text-muted-foreground">{curName[o.cur]}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

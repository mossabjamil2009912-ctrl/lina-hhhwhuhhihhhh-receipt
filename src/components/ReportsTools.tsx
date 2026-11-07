import { addOp } from "@/lib/ops";
import { useState } from "react";
import { Trash2, UserPlus, Wallet, UserCog } from "lucide-react";
import { readOwner, saveOwner } from "@/lib/owner";
import { saveBalances, saveCustomers, useWallet } from "@/lib/wallet";
import { deposit } from "@/lib/transfer";

const field = "h-[50px] w-full rounded-[12px] border border-border bg-card px-[14px] text-[15px] outline-none placeholder:text-muted-foreground focus:border-foreground/40";
const red = "h-[48px] w-full rounded-[12px] bg-primary text-[15px] font-bold text-primary-foreground active:scale-[0.98]";

export function ReportsTools() {
  const { balances, customers } = useWallet();
  const [open, setOpen] = useState<"cust" | "amt" | "own" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amt, setAmt] = useState({ yer: "", sar: "", usd: "" });
  const [msg, setMsg] = useState("");
  const [add, setAdd] = useState({ yer: "", sar: "", usd: "" });

  const [own, setOwn] = useState({ name: "", phone: "" });
  const toggle = (k: "cust" | "amt" | "own") => {
    setMsg("");
    if (k === "own") setOwn(readOwner());
    if (k === "amt") setAmt({ yer: String(balances.yer), sar: String(balances.sar), usd: String(balances.usd) });
    setOpen(open === k ? null : k);
  };

  const addCustomer = () => {
    if (!name.trim() || !phone.trim()) return setMsg("الرجاء إدخال الاسم والرقم");
    saveCustomers([...customers, { name: name.trim(), phone: phone.trim() }]);
    setName("");
    setPhone("");
    setMsg("تم حفظ العميل");
  };

  const saveAmt = () => {
    const n = (s: string) => Number(s.replace(/,/g, "")) || 0;
    saveBalances({ yer: n(amt.yer), sar: n(amt.sar), usd: n(amt.usd) });
    setMsg("تم تحديث المبلغ");
  };

  const addAmt = (k: "yer" | "sar" | "usd") => {
    const nb = deposit(balances, k, Number(add[k]));
    if (!nb) return setMsg("الرجاء إدخال مبلغ الإضافة");
    saveBalances(nb);
    addOp({ title: "إيداع مبلغ", amount: Number(add[k]), cur: k, sign: 1 });
    setAmt({ ...amt, [k]: String(nb[k]) });
    setAdd({ ...add, [k]: "" });
    setMsg("تمت إضافة المبلغ");
  };

  const num = (v: string) => v.replace(/[^\d.]/g, "");
  const btn = "flex h-[74px] flex-1 flex-col items-center justify-center gap-[6px] rounded-[12px] bg-card text-[14px] font-bold active:scale-[0.98]";

  return (
    <div className="px-[12px] pt-[16px]">
      <div className="flex gap-[12px]">
        <button onClick={() => toggle("cust")} className={`${btn} ${open === "cust" ? "ring-2 ring-primary" : ""}`}>
          <UserPlus className="h-[24px] w-[24px] text-primary" /> إضافة عميل
        </button>
        <button onClick={() => toggle("amt")} className={`${btn} ${open === "amt" ? "ring-2 ring-primary" : ""}`}>
          <Wallet className="h-[24px] w-[24px] text-primary" /> تحديد المبلغ
        </button>
        <button onClick={() => toggle("own")} className={`${btn} ${open === "own" ? "ring-2 ring-primary" : ""}`}>
          <UserCog className="h-[24px] w-[24px] text-primary" /> بيانات المودع
        </button>
      </div>

      {open === "cust" && (
        <div className="mt-[12px] flex flex-col gap-[10px] rounded-[12px] bg-card p-[12px]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" className={field} />
          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="الرقم" className={field} />
          <button onClick={addCustomer} className={red}>حفظ</button>
          {msg && <p className="text-center text-[13px] text-primary">{msg}</p>}
          {customers.length > 0 && (
            <ul className="flex flex-col gap-[6px]">
              {customers.map((c, i) => (
                <li key={i} className="flex items-center justify-between rounded-[10px] bg-background px-[12px] py-[8px] text-[14px]">
                  <span>{c.name} — <span dir="ltr">{c.phone}</span></span>
                  <button aria-label="حذف" onClick={() => saveCustomers(customers.filter((_, j) => j !== i))} className="p-1 active:scale-90">
                    <Trash2 className="h-[18px] w-[18px] text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {open === "own" && (
        <div className="mt-[12px] flex flex-col gap-[10px] rounded-[12px] bg-card p-[12px]">
          <input value={own.name} onChange={(e) => setOwn({ ...own, name: e.target.value })} placeholder="اسم المودع" className={field} />
          <input value={own.phone} onChange={(e) => setOwn({ ...own, phone: e.target.value.replace(/\D/g, "") })} inputMode="numeric" placeholder="رقم المودع" className={field} />
          <button onClick={() => { if (!own.name.trim() || !own.phone.trim()) return setMsg("الرجاء إدخال الاسم والرقم"); saveOwner(own); setMsg("تم حفظ بيانات المودع"); }} className={red}>حفظ</button>
          {msg && <p className="text-center text-[13px] text-primary">{msg}</p>}
        </div>
      )}

      {open === "amt" && (
        <div className="mt-[12px] flex flex-col gap-[10px] rounded-[12px] bg-card p-[12px]">
          {([["yer", "ريال يمني"], ["sar", "ريال سعودي"], ["usd", "دولار امريكي"]] as const).map(([k, l]) => (
            <label key={k} className="flex flex-col gap-[4px] text-[13px] text-muted-foreground">
              {l}
              <input value={amt[k]} onChange={(e) => setAmt({ ...amt, [k]: num(e.target.value) })} inputMode="decimal" dir="ltr" className={`${field} text-right text-foreground`} />
              <div className="flex gap-[8px]">
                <input value={add[k]} onChange={(e) => setAdd({ ...add, [k]: num(e.target.value) })} inputMode="decimal" dir="ltr" placeholder="مبلغ الإضافة" className={`${field} h-[44px] text-right text-foreground`} />
                <button type="button" onClick={() => addAmt(k)} className="h-[44px] shrink-0 rounded-[12px] bg-primary px-[14px] text-[14px] font-bold text-primary-foreground active:scale-95">إضافة مبلغ</button>
              </div>
            </label>
          ))}
          <button onClick={saveAmt} className={red}>حفظ</button>
          {msg && <p className="text-center text-[13px] text-primary">{msg}</p>}
        </div>
      )}
    </div>
  );
}

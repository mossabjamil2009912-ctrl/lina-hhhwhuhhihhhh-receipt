import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, RefreshCw } from "lucide-react";
import { serviceNames, parentOf } from "@/lib/services";
import { ExchangeForm, RemitSearch, RechargeForm, GenericForm, type GenericKind } from "@/components/MoreScreens";
import eg from "@/assets/jaib/eg.webp";
import ea from "@/assets/jaib/ea.webp";
import ec from "@/assets/jaib/ec.webp";
import ex from "@/assets/jaib/ex.webp";
import n0 from "@/assets/jaib/n0.webp";
import n1 from "@/assets/jaib/n1.webp";
import n2 from "@/assets/jaib/n2.webp";
import n3 from "@/assets/jaib/n3.webp";
const lnImgs = import.meta.glob("@/assets/jaib/ln*.webp", { eager: true, import: "default" }) as Record<string, string>;
const rcImgs = import.meta.glob("@/assets/jaib/rc*.webp", { eager: true, import: "default" }) as Record<string, string>;
const nwImgs = import.meta.glob("@/assets/jaib/nw[0-9]*.webp", { eager: true, import: "default" }) as Record<string, string>;
const img = (m: Record<string, string>, n: string) => Object.entries(m).find(([k]) => k.endsWith(`/${n}.webp`))?.[1] ?? "";
const ops = [["op-ym", ""], ["op-sab", ""], ["op-sabpkg", "sabafon-pkg"], ["op-youbal", ""], ["op-you", "you-pkg"], ["op-youbill", "you-bill"], ["op-wayfast", ""], ["op-waybal", ""]] as const;
import t0 from "@/assets/jaib/t0.webp";
import t1 from "@/assets/jaib/t1.webp";
import t2 from "@/assets/jaib/t2.webp";
import t3 from "@/assets/jaib/t3.webp";
import t4 from "@/assets/jaib/t4.webp";
import t5 from "@/assets/jaib/t5.webp";
import r0 from "@/assets/jaib/r0.webp";
import r1 from "@/assets/jaib/r1.webp";
import r2 from "@/assets/jaib/r2.webp";
import r3 from "@/assets/jaib/r3.webp";
import r4 from "@/assets/jaib/r4.webp";
import tahweel from "@/assets/jaib/tahweel.webp";
import jaib from "@/assets/jaib/jaiblogo.webp";
import o0 from "@/assets/jaib/o0.webp";
import o1 from "@/assets/jaib/o1.webp";
import w0 from "@/assets/jaib/w0.webp";
import w1 from "@/assets/jaib/w1.webp";
import w2 from "@/assets/jaib/w2.webp";
import p0 from "@/assets/jaib/p0.webp";
import p1 from "@/assets/jaib/p1.webp";
import { Map as MapIcon } from "lucide-react";
import { PurchaseForm } from "@/components/PurchaseForm";
import { AllServices, BottomNav, Entertainment, Profile } from "@/components/JaibScreens";
import { ReportsTools } from "@/components/ReportsTools";
import { TransferForm } from "@/components/TransferForm";
import j0 from "@/assets/jaib/j0.webp";
import j1 from "@/assets/jaib/j1.webp";
import j2 from "@/assets/jaib/j2.webp";
import j3 from "@/assets/jaib/j3.webp";
import q0 from "@/assets/jaib/q0.webp";
import q1 from "@/assets/jaib/q1.webp";
import q2 from "@/assets/jaib/q2.webp";
import q3 from "@/assets/jaib/q3.webp";

export const Route = createFileRoute("/service/$id")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined" && sessionStorage.getItem("jaib-auth") !== "1") throw redirect({ to: "/login" });
  },
  head: ({ params }) => {
    const t = `جيب - ${serviceNames[params.id] ?? "خدمة"}`;
    return { meta: [{ title: t }, { name: "description", content: t }, { property: "og:title", content: t }, { property: "og:description", content: t }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: ServicePage,
});

type Item = { label: string; img: string; to?: string };
const menus: Record<string, { items: Item[]; logo?: string; refresh?: boolean; atm?: boolean }> = {
  jaibi: { items: [{ label: "جيب العائلة", img: j0 }, { label: "هدية", img: j1 }, { label: "فرقك", img: j2 }, { label: "ادخار", img: j3 }] },
  reports: { items: [{ label: "آخر العمليات", img: q0 }, { label: "كشف حساب", img: q1 }, { label: "بحث مخصص", img: q2 }, { label: "بحث بالرقم المرجعي", img: q3 }] },
  online: { items: [{ label: "كود شراء", img: o0 }, { label: "البطائق الافتراضية", img: o1 }] },
  withdraw: {
    atm: true,
    items: [
      { label: "طلب سحب نقدي", img: w0 },
      { label: "سحب من الصراف الآلي YKB", img: w1 },
      { label: "سحب من الصراف الآلي كاك بنك", img: w2 },
    ],
  },
  payments: {
    refresh: true,
    items: [
      { label: "تسديد الوطنية للتمويل الأصغر", img: p0 },
      { label: "تبرعات", img: p1 },
      { label: "سداد رسوم حكومية MPS", img: jaib },
      { label: "سداد رسوم حكومية E-Sadad", img: jaib },
      { label: "مدفوعات الزكاة", img: jaib },
    ],
  },
  transfers: {
    items: [
      { label: "تحويل إلى مشترك", img: t0, to: "subscriber" },
      { label: "تحويل بين حساباتي (مصارفة)", img: t1, to: "exchange" },
      { label: "حوالات شبكات محلية", img: t2, to: "localnet" },
      { label: "طلب استلام حوالة", img: t3 },
      { label: "بنوك ومحافظ", img: t4 },
      { label: "تحويل الى محافظ أخرى - واصل", img: t5 },
    ],
  },
  remittances: {
    logo: tahweel,
    items: [
      { label: "إرسال حوالة شبكة تحويل", img: r0 },
      { label: "استلام حوالة", img: r1 },
      { label: "حالة حوالة", img: r2 },
      { label: "الغاء حوالة", img: r3 },
      { label: "طلب استلام حوالة محلية/دولية", img: r4 },
    ],
  },
  topup: {
    refresh: true,
    items: [{ label: "شحن الرصيد", img: jaib, to: "recharge" }, ...["سداد باقات", "الانترنت والهاتف الثابت", "خدمات يمن فورجي 4G", "فواتير الماء والكهرباء", "التعليم العالي والجامعات"].map((label) => ({ label, img: jaib }))],
  },
  ent: { items: [{ label: "العاب", img: eg }, { label: "تطبيقات", img: ea }, { label: "بطائق نت", img: ec }, { label: "تخصيص", img: ex }, { label: "بطاقات شحن كويتي", img: n0 }, { label: "بطاقات إماراتية اتصالات", img: n1 }, { label: "بطاقات شحن إماراتية du", img: n2 }, { label: "زين", img: n3 }] },
  localnet: { refresh: true, items: ["ln-send", "ln-receive", "ln-status", "ln-cancel"].map((to, i) => ({ label: serviceNames[to]!, img: img(lnImgs, `ln${i}`), to })) },
  recharge: { items: ops.map(([to], i) => ({ label: serviceNames[to]!, img: img(rcImgs, `rc${i}`), to })) },
  "ln-send": { items: ["شبكة حزمي تحويل", "حوالات جيب", "شبكة دادية", "شبكة الامتياز", "شبكة النجم", "شبكة الحوشبي (إتش بي)", "شبكة الهتار", "شبكة المميز", "شبكة الاكوع", "الشبكة اليمنية للتحويلات"].map((label, i) => ({ label, img: img(nwImgs, `nw${i}`) })) },
};

/** Generic screen for menu item `f_<menu>_<index>`. */
function generic(id: string) {
  if (!id.startsWith("f_")) return null;
  const i = id.lastIndexOf("_");
  const m = id.slice(2, i), k = Number(id.slice(i + 1));
  const item = menus[m]?.items[k];
  if (!item) return null;
  let kind: GenericKind = "pay";
  let numLabel: string | undefined;
  if (m === "reports") kind = (["ops", "statement", "find", "find"] as const)[k] ?? "ops";
  else if (m === "remittances") kind = k === 0 ? "pay-name" : "search";
  else if (m === "ln-send") kind = "pay-name";
  else if (m === "online" || m === "withdraw" || m === "ent") kind = "pay-code";
  if (m === "topup") numLabel = item.label.includes("التعليم") ? "الرقم الجامعي" : "رقم المشترك";
  return { parent: m, label: item.label, img: item.img, kind, numLabel };
}

function ServicePage() {
  const { id } = Route.useParams();
  const g = generic(id);
  const menu = g ? undefined : menus[id];
  const [spin, setSpin] = useState(0);
  const compact = id === "ln-send";
  const opIdx = ops.findIndex(([o]) => o === id);
  const custom = !!g || ["purchases", "subscriber", "entertainment", "services", "profile", "exchange", "ln-receive", "ln-status", "ln-cancel"].includes(id) || opIdx >= 0;
  if (id === "services" || id === "profile")
    return (
      <div className="min-h-[100dvh] bg-background">
        <div className="relative mx-auto max-w-[430px]">{id === "services" ? <AllServices /> : <Profile />}</div>
      </div>
    );
  return (
    <div style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }} className={`h-[100dvh] overflow-y-auto overflow-x-hidden overscroll-contain ${menu || custom ? "bg-background" : "bg-card"}`}>
      <div className={`relative mx-auto max-w-[430px] ${id === "reports" ? "pb-[110px]" : ""}`}>
        <header className="flex items-center gap-3 px-[14px] pb-[18px] pt-[24px]">
          <Link to={g?.parent === "ent" ? "/service/$id" : g || parentOf[id] ? "/service/$id" : "/"} params={{ id: g ? (g.parent === "ent" ? "entertainment" : g.parent) : parentOf[id] ?? "transfers" }} aria-label="رجوع" className="p-1 active:scale-90"><ChevronRight className="h-[26px] w-[26px]" strokeWidth={2.2} /></Link>
          <h1 className="text-[19.5px] font-bold">{id === "reports" ? "أخرى" : g?.label ?? serviceNames[id] ?? "خدمة"}</h1>
          {menu?.refresh && (
            <button onClick={() => setSpin(spin + 1)} className="ms-auto flex h-[28px] items-center gap-[6px] rounded-[6px] bg-card px-[12px] text-[12px] active:scale-95">
              <RefreshCw className="h-[22px] w-[22px] text-primary transition-transform duration-700" style={{ transform: `rotate(${spin * 360}deg)` }} />
              تحديث
            </button>
          )}
        </header>
        {id === "purchases" && <PurchaseForm />}
        {id === "subscriber" && <TransferForm />}
        {id === "exchange" && <ExchangeForm />}
        {g && <GenericForm key={id} kind={g.kind} icon={g.img} title={g.label} numLabel={g.numLabel} />}
        {id === "ln-receive" && <RemitSearch kind="receive" />}
        {id === "ln-status" && <RemitSearch kind="status" />}
        {id === "ln-cancel" && <RemitSearch kind="cancel" />}
        {opIdx >= 0 && <RechargeForm key={id} op={ops[opIdx]![1]} icon={img(rcImgs, `rc${opIdx}`)} />}
        {id === "entertainment" && <Entertainment />}
        {id === "reports" && <BottomNav active="reports" />}
        {menu?.atm && (
          <div className="flex justify-end px-[12px] pb-[18px]">
            <button className="flex h-[36px] items-center gap-[12px] rounded-[12px] border-[1.5px] border-foreground px-[12px] text-[15px] font-bold active:scale-95">
              مواقع الصرافات <MapIcon className="h-[16px] w-[16px] fill-foreground" />
            </button>
          </div>
        )}
        {menu?.logo && (
          <div className="mb-[24px] flex justify-center">
            <img src={menu.logo} alt="شبكة تحويل" className="h-[50px] w-[67px] rounded-[10px] bg-card object-cover shadow-md" />
          </div>
        )}
        {menu && (
          <div className={`flex flex-col px-[12px] ${compact ? "gap-[9px] [&>*]:!h-[66px]" : "gap-[12px]"} ${id === "recharge" ? "pt-[22px]" : ""} ${menu.refresh || id === "online" || id === "reports" ? "pt-[18px]" : ""}`}>
            {menu.items.map((t) => (
              t.to ? (
                <Link key={t.label} to="/service/$id" params={{ id: t.to }} className="flex h-[74px] items-center gap-[24px] rounded-[12px] bg-card px-[12px] text-start transition active:scale-[0.98]">
                  <img src={t.img} alt="" className={`h-[49px] w-[66px] rounded-[10px] object-cover ${t.to?.startsWith("op-you") ? "scale-[1.12]" : ""}`} />
                  <span className="text-[16px]">{t.label}</span>
                </Link>
              ) : (
              <Link key={t.label} to="/service/$id" params={{ id: `f_${id}_${menu.items.indexOf(t)}` }} className="flex h-[74px] items-center gap-[24px] rounded-[12px] bg-card px-[12px] text-start transition active:scale-[0.98]">
                <img src={t.img} alt="" className="h-[49px] w-[66px] rounded-[10px] object-cover" />
                <span className="text-[16px]">{t.label}</span>
              </Link>
              )
            ))}
          </div>
        )}
        {id === "reports" && <ReportsTools />}
      </div>
    </div>
  );
}

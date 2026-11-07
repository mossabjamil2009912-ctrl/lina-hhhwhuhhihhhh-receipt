import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, RefreshCw, Search, Plus } from "lucide-react";
import navS from "@/assets/jaib/navS.webp";
import navR from "@/assets/jaib/navR.webp";
import navP from "@/assets/jaib/navP.webp";
import bein from "@/assets/jaib/bein.webp";
import eg from "@/assets/jaib/eg.webp";
import ea from "@/assets/jaib/ea.webp";
import ec from "@/assets/jaib/ec.webp";
import ex from "@/assets/jaib/ex.webp";
import n0 from "@/assets/jaib/n0.webp";
import n1 from "@/assets/jaib/n1.webp";
import n2 from "@/assets/jaib/n2.webp";
import n3 from "@/assets/jaib/n3.webp";
import bell2 from "@/assets/jaib/bell2.webp";
import farq from "@/assets/jaib/farq.webp";
import avatar from "@/assets/jaib/avatar.webp";
import qr from "@/assets/jaib/qr.webp";
import { useOwner, firstName } from "@/lib/owner";
import { useOfflineReady } from "@/lib/pwa";
function OwnerFirst() { return <>{firstName(useOwner().name)}</>; }
function OwnerName() { return <>{useOwner().name}</>; }
function OwnerPhone() { return <>{useOwner().phone}</>; }


const sImgs = import.meta.glob("@/assets/jaib/s*.webp", { eager: true, import: "default" }) as Record<string, string>;
const pfImgs = import.meta.glob("@/assets/jaib/pf*.webp", { eager: true, import: "default" }) as Record<string, string>;
const pick = (m: Record<string, string>, name: string) => Object.entries(m).find(([k]) => k.endsWith(`/${name}.webp`))?.[1] ?? "";

const navImg = { services: navS, reports: navR, profile: navP } as const;

export function BottomNav({ active }: { active: keyof typeof navImg }) {
  const links: { id?: string; x: number }[] = [{ x: 691 }, { id: "services", x: 518 }, { id: "quick", x: 346 }, { id: "reports", x: 173 }, { id: "profile", x: 0 }];
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px]">
      <div className="relative">
        <img src={navImg[active]} alt="شريط التنقل" className="block w-full" />
        {links.map(({ id, x }) => {
          const st = { left: `${(x / 864) * 100}%`, width: `${(173 / 864) * 100}%` };
          return id ? (
            <Link key={x} to="/service/$id" params={{ id }} aria-label={id} style={st} className="absolute inset-y-0 active:scale-90" />
          ) : (
            <Link key={x} to="/" aria-label="الرئيسية" style={st} className="absolute inset-y-0 active:scale-90" />
          );
        })}
      </div>
    </div>
  );
}

export function Entertainment() {
  const [spin, setSpin] = useState(0);
  const tiles = [{ l: "العاب", i: eg }, { l: "تطبيقات", i: ea }, { l: "بطائق نت", i: ec }, { l: "تخصيص", i: ex }];
  const recent = [{ l: "بطاقات شحن كويتي", i: n0 }, { l: "بطاقات إماراتية اتصالات", i: n1 }, { l: "بطاقات شحن إماراتية du", i: n2 }, { l: "زين", i: n3 }];
  return (
    <div className="pb-8">
      <div className="absolute left-[16px] top-[62px] flex items-center gap-[12px]">
        <button onClick={() => setSpin(spin + 1)} className="flex h-[28px] items-center gap-[6px] rounded-[6px] bg-card px-[12px] text-[12px] active:scale-95">
          <RefreshCw className="h-[22px] w-[22px] text-primary transition-transform duration-700" style={{ transform: `rotate(${spin * 360}deg)` }} />
          تحديث
        </button>
        <button aria-label="بحث" className="active:scale-90"><Search className="h-[24px] w-[24px]" strokeWidth={2.5} /></button>
      </div>
      <div className="px-[12px]">
        <img src={bein} alt="beIN SPORTS" className="w-full rounded-[14px]" />
        <div className="mt-[12px] grid grid-cols-2 gap-[10px]">
          {tiles.map((t) => (
            <Link key={t.l} to="/service/$id" params={{ id: `f_ent_${tiles.indexOf(t)}` }} className="flex h-[50px] items-center gap-[24px] rounded-[12px] bg-card px-[12px] active:scale-95">
              <img src={t.i} alt="" className="h-[30px] w-[34px]" />
              <span className="flex-1 text-center text-[15px] font-bold">{t.l}</span>
            </Link>
          ))}
        </div>
        <h2 className="mt-[34px] text-[17px] font-bold">المضافة حديثا</h2>
      </div>
      <div className="mt-[18px] flex gap-[8px] overflow-x-auto px-[12px] pb-2 [scrollbar-width:none]">
        {recent.map((r) => (
          <Link key={r.l} to="/service/$id" params={{ id: `f_ent_${4 + recent.indexOf(r)}` }} className="w-[108px] shrink-0 text-center active:scale-95">
            <img src={r.i} alt="" className="h-[108px] w-[108px] rounded-[10px] object-cover" />
            <div className="mt-[8px] truncate text-[13px]">{r.l}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const allServices = [
  "دفع المشتريات", "تحويل إلى مشترك", "طلب سحب نقدي",
  "إرسال حوالة شبكة تحويل", "بنوك ومحافظ", "استلام حوالة عبر شبكات محلية",
  "حالة حوالة", "إرسال حوالة عبر شبكات محلية", "استلام حوالة",
  "الغاء حوالة", "تحويل بين حساباتي (مصارفة)", "الشحن والسداد",
];

export function AllServices() {
  return (
    <div className="px-[12px] pb-[110px] pt-[30px]">
      <div className="flex items-start justify-between px-[1px]">
        <div>
          <h1 className="text-[19.5px] font-extrabold">صباح الخير</h1>
          <p className="mt-[6px] text-[17px]"><OwnerFirst /></p>
        </div>
        <button className="active:scale-90"><img src={bell2} alt="الإشعارات" className="h-[42px] w-[44px]" /></button>
      </div>
      <h2 className="mt-[18px] text-[19px] font-extrabold">تخصيص خدمات</h2>
      <div className="mt-[16px] grid grid-cols-3 gap-[6px]">
        <button className="flex h-[89px] flex-col items-center justify-center gap-[6px] rounded-[14px] bg-card active:scale-95">
          <img src={farq} alt="" className="h-[34px] w-[36px]" />
          <span className="text-[14px]">فرقك</span>
        </button>
        {[0, 1].map((i) => (
          <button key={i} aria-label="إضافة خدمة" className="flex h-[89px] items-center justify-center rounded-[14px] bg-card active:scale-95"><Plus className="h-[22px] w-[22px] text-primary" strokeWidth={2.5} /></button>
        ))}
      </div>
      <h2 className="mt-[20px] text-[19px] font-extrabold">كافة الخدمات</h2>
      <div className="mt-[22px] flex gap-[8px]">
        {[0, 1, 2].map((c) => (
        <div key={c} className="flex flex-1 flex-col gap-[8px]">
        {allServices.map((l, k) => k % 3 !== c ? null : (
          <button key={l} className="flex min-h-[99px] flex-col items-center justify-start gap-[8px] rounded-[14px] bg-card px-[4px] pt-[18px] pb-[10px] active:scale-95">
            <img src={pick(sImgs, `s${k}`)} alt="" className="h-[33px] w-[38px]" />
            <span className="text-center text-[14px] leading-[24px]">{l}</span>
          </button>
        ))}
        </div>
        ))}
      </div>
      <BottomNav active="services" />
    </div>
  );
}

const profileItems: { l: string; more?: boolean }[] = [
  { l: "تحديث بيانات التطبيق" }, { l: "إدارة الأجهزة" }, { l: "ملف العميل", more: true },
  { l: "إدارة المفضلة والاقتراحات", more: true }, { l: "الخصوصية والآمان", more: true },
  { l: "إعدادات إضافية" }, { l: "الدعم والمساعدة", more: true }, { l: "تخصيص التطبيق", more: true },
  { l: "شارك تطبيق جيب" },
];

function ProfileMore({ l }: { l: string }) {
  const o = useOwner();
  const rows: Record<string, string[]> = {
    "ملف العميل": [`الاسم: ${o.name}`, `رقم الحساب: ${o.phone}`, "نوع الحساب: عميل"],
    "إدارة المفضلة والاقتراحات": ["لا توجد عناصر في المفضلة"],
    "الخصوصية والآمان": ["تسجيل الدخول بالبصمة: مفعّل", "كلمة المرور: ••••••"],
    "الدعم والمساعدة": ["الرقم المجاني: 8000000", "خدمة العملاء عبر واتساب"],
    "تخصيص التطبيق": ["اللغة: العربية", "المظهر: فاتح"],
  };
  return <div className="flex flex-col gap-[6px] px-[12px] pb-[14px] text-[13px] text-muted-foreground">{(rows[l] ?? []).map((r) => <div key={r}>{r}</div>)}</div>;
}

export function Profile() {
  const [open, setOpen] = useState<string | null>(null);
  const [updMsg, setUpdMsg] = useState<string | null>(null);
  const offline = useOfflineReady();
  const runUpdate = async () => {
    setUpdMsg("جارٍ التحقق من التحديثات...");
    const { checkForUpdate } = await import("@/lib/pwa");
    const r = await checkForUpdate();
    setUpdMsg(
      r === "offline" ? "لا يوجد اتصال بالإنترنت"
      : r === "updating" ? "جارٍ تحديث التطبيق..."
      : "التطبيق محدث",
    );
  };
  return (
    <div className="px-[12px] pb-[110px] pt-[78px]">
      <div className="relative rounded-[14px] bg-foreground/10 px-[16px] pb-[16px] pt-[82px]">
        <div className="absolute left-1/2 top-[-34px] flex h-[100px] w-[100px] -translate-x-1/2 items-center justify-center rounded-full bg-background">
          <img src={avatar} alt="الصورة الشخصية" className="h-[86px] w-[86px] rounded-full" />
        </div>
        <h1 className="text-center text-[16px] font-bold"><OwnerName /></h1>
        <div className="mt-[22px] flex gap-[9px]">
          <button aria-label="رمز QR" className="active:scale-90"><img src={qr} alt="" className="h-[54px] w-[54px] rounded-[10px]" /></button>
          <div className="flex h-[54px] flex-1 items-center rounded-[10px] bg-primary text-primary-foreground">
            <div className="flex-1 text-center"><div className="text-[13px]">رقم الحساب</div><div className="mt-[6px] text-[14px] font-bold"><OwnerPhone /></div></div>
            <div className="h-[32px] w-px bg-primary-foreground/30" />
            <div className="flex-1 text-center"><div className="text-[13px]">الرقم البديل</div><div className="mt-[6px] text-[14px] font-bold">1475343</div></div>
          </div>
        </div>
      </div>
      <div className="mt-[18px] flex flex-col gap-[8px]">
        {profileItems.map((it, i) => (
          <div key={it.l} className="rounded-[12px] bg-card">
            <button onClick={() => { if (i === 0) runUpdate(); else if (it.more) setOpen(open === it.l ? null : it.l); }} className="flex h-[50px] w-full items-center gap-[14px] px-[12px] text-start active:scale-[0.98]">
              <img src={pick(pfImgs, `pf${i}`)} alt="" className="h-[25px] w-[24px]" />
              <span className="flex-1 text-[14px] font-bold">{it.l}</span>
              {it.more && <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open === it.l ? "rotate-180" : ""}`} />}
            </button>
            {i === 0 && updMsg && <div className="px-[12px] pb-[10px] text-[13px] text-muted-foreground">{updMsg}</div>}
            {i === 0 && offline !== null && <div className="px-[12px] pb-[10px] text-[12px] text-muted-foreground">{offline ? "جاهز للعمل بدون إنترنت" : "جارٍ التجهيز للعمل بدون إنترنت..."}</div>}
            {it.more && open === it.l && <ProfileMore l={it.l} />}
          </div>
        ))}
      </div>
      <BottomNav active="profile" />
    </div>
  );
}

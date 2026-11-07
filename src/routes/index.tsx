import { ChevronsDown, Eye } from "lucide-react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useWallet } from "@/lib/wallet";
import { useOwner, firstName } from "@/lib/owner";
function OwnerFirst() { return <>{firstName(useOwner().name)}</>; }
function OwnerName() { return <>{useOwner().name}</>; }
function OwnerPhone() { return <>{useOwner().phone}</>; }

import { useEffect, useRef, useState, type CSSProperties } from "react";
import bell from "@/assets/jaib/bell.webp";
import bot from "@/assets/jaib/bot.webp";
import card from "@/assets/jaib/card.webp";
import banner from "@/assets/jaib/banner.webp";
import banner1 from "@/assets/jaib/banner1.webp";
import banner2 from "@/assets/jaib/banner2.webp";
import banner3 from "@/assets/jaib/banner3.webp";
import { useOps } from "@/lib/ops";
import { curName } from "@/lib/transfer";
import nav from "@/assets/jaib/nav.webp";
import i0 from "@/assets/jaib/i0.webp";
import i1 from "@/assets/jaib/i1.webp";
import i2 from "@/assets/jaib/i2.webp";
import i3 from "@/assets/jaib/i3.webp";
import i4 from "@/assets/jaib/i4.webp";
import i5 from "@/assets/jaib/i5.webp";
import i6 from "@/assets/jaib/i6.webp";
import i7 from "@/assets/jaib/i7.webp";
import i8 from "@/assets/jaib/i8.webp";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined" && sessionStorage.getItem("jaib-auth") !== "1") throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "جيب - الرئيسية" },
      { name: "description", content: "الشاشة الرئيسية لمحفظة جيب" },
      { property: "og:title", content: "جيب - الرئيسية" },
      { property: "og:description", content: "الشاشة الرئيسية لمحفظة جيب" },
    ],
  }),
  component: Index,
});

// Coordinates are measured on the 864x1920 reference screenshot and scaled to 390px width.
const S = 864 / 390;
const W = 390;
const H = 1920 / S;
const box = (x1: number, y1: number, x2: number, y2: number): CSSProperties => ({
  position: "absolute", left: x1 / S, top: y1 / S, width: (x2 - x1) / S, height: (y2 - y1) / S,
});

// Reference screenshots include the ~58px phone status bar; the app viewport does not.
const TOP = 58;
const OP0 = 1730, OPH = 165, OPG = 28;
const listEnd = OP0 + 5 * (OPH + OPG) + 330;

function Ops() {
  const ops = useOps().slice(0, 5);
  const num = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 2 });
  return (
    <>
      {ops.map((o, i) => (
        <button key={i} style={box(23, OP0 + i * (OPH + OPG), 841, OP0 + i * (OPH + OPG) + OPH)} className="rounded-[14px] bg-card transition-colors duration-150 active:bg-muted">
          <img src={o.sign > 0 ? i0 : i5} alt="" style={{ position: "absolute", right: 22 / S, top: 44 / S, width: 80 / S, height: 80 / S }} />
          <span style={{ position: "absolute", right: 112 / S, top: 40 / S }} className="text-[17px] font-bold leading-none">{o.title}</span>
          <span style={{ position: "absolute", right: 112 / S, top: 98 / S }} className="text-[16px] leading-none text-muted-foreground" dir="ltr">{o.date}</span>
          <span style={{ position: "absolute", left: 28 / S, top: 62 / S }} className="flex items-baseline gap-[4px] leading-none" dir="ltr">
            <span className="text-[14px]">{curName[o.cur]}</span>
            <span className={`text-[19px] font-bold ${o.sign > 0 ? "text-success" : "text-primary"}`}><span className="flex" dir="ltr"><span>{num(o.amount)}</span>{o.sign < 0 && <span>-</span>}</span></span>
          </span>
        </button>
      ))}
      {ops.length > 0 && (
        <button style={{ ...box(0, OP0 + ops.length * (OPH + OPG) + 10, 864, OP0 + ops.length * (OPH + OPG) + 70) }} className="text-center text-[16px] font-bold active:opacity-60">عرض أخر العمليات</button>
      )}
    </>
  );
}

const banners = [
  { src: banner, alt: "ابدأ الادخار مع حصالة جيب" },
  { src: banner1, alt: "وقت الحساب مع اصحابك" },
  { src: banner2, alt: "كروت الشبكات صارت في الجيب" },
  { src: banner3, alt: "شاركهم الفرحة مع هدية" },
];

function Banner() {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState(0);
  const st = useRef<number | null>(null);
  const bw = 864 / S;
  useEffect(() => {
    if (st.current !== null) return;
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 2500);
    return () => clearInterval(t);
  }, [i, drag]);
  const end = () => {
    if (st.current === null) return;
    if (drag > bw / 5) setI((x) => (x + 1) % banners.length);
    else if (drag < -bw / 5) setI((x) => (x - 1 + banners.length) % banners.length);
    st.current = null;
    setDrag(0);
  };
  return (
    <div
      style={{ ...box(0, 770, 864, 940), overflow: "hidden", touchAction: "pan-y" }}
      className="select-none"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); st.current = e.clientX; setDrag(0.001); }}
      onPointerMove={(e) => st.current !== null && setDrag(e.clientX - st.current)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        dir="ltr"
        style={{ display: "flex", height: "100%", transform: `translateX(${i * bw + drag}px)`, transition: st.current !== null ? "none" : "transform .5s cubic-bezier(.4,0,.2,1)", flexDirection: "row-reverse", width: bw * banners.length, marginLeft: -(banners.length - 1) * bw }}
      >
        {banners.map((b) => (
          <img key={b.alt} src={b.src} alt={b.alt} draggable={false} style={{ width: bw, height: "100%", flexShrink: 0 }} className="pointer-events-none" />
        ))}
      </div>
    </div>
  );
}

const services = [
  { label: "تحويلات مالية", img: i0, id: "transfers" },
  { label: "حوالات محلية", img: i1, id: "remittances" },
  { label: "الشحن والسداد", img: i2, id: "topup" },
  { label: "شراء اونلاين", img: i3, id: "online" },
  { label: "دفع المشتريات", img: i4, id: "purchases" },
  { label: "سحب نقدي", img: i5, id: "withdraw" },
  { label: "المدفوعات", img: i6, id: "payments" },
  { label: "خدمات ترفيه", img: i7, id: "entertainment" },
  { label: "جيبي", img: i8, id: "jaibi" },
];
const cols: [number, number][] = [[584, 841], [304, 561], [23, 280]];
const rows: [number, number][] = [[966, 1162], [1191, 1387], [1415, 1611]];

function Index() {
  const [zoom, setZoom] = useState(1);
  const [vh, setVh] = useState(H);
  const now = new Date();
  const greet = now.getDay() === 5 ? "جمعتك مباركة" : now.getHours() < 12 ? "صباح الخير" : "مساء الخير";
  useEffect(() => {
    const f = () => { const z = window.innerWidth / W; setZoom(z); setVh(window.innerHeight / z); };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  return (
    <div className="flex h-[100dvh] w-full justify-center overflow-hidden bg-background">
      <div style={{ zoom, width: W, height: vh }} className="relative shrink-0 overflow-hidden bg-background">
       <div style={{ position: "absolute", left: 0, top: -TOP / S, width: W, height: vh + TOP / S }}>
        <h1 style={{ position: "absolute", right: 29 / S, top: 80 / S }} className="text-[25px] font-bold leading-none">{greet}</h1>
        <p style={{ position: "absolute", right: 29 / S, top: 148 / S }} className="text-[20px] leading-none"><OwnerFirst /></p>
        <button style={box(135, 90, 235, 182)} className="transition-transform active:scale-90"><img src={bot} alt="المساعد" className="h-full w-full" /></button>
        <button style={box(27, 90, 127, 182)} className="transition-transform active:scale-90"><img src={bell} alt="الإشعارات" className="h-full w-full" /></button>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200 / S, bottom: 0, overflowY: "auto", overflowX: "hidden", touchAction: "pan-y", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }} className="no-scrollbar">
          <div style={{ position: "relative", marginTop: -200 / S, height: listEnd / S }}>
            <p style={{ ...box(0, 220, 864, 244), textAlign: "center" }} className="flex items-center justify-center gap-[3px] text-[10.5px] leading-none text-muted-foreground">اسحب للأسفل للتحديث <ChevronsDown className="h-[11px] w-[11px]" strokeWidth={1.5} /></p>

            <Cards />

            <Banner />

            {services.map(({ label, img, id }, i) => {
              const [x1, x2] = cols[i % 3]!;
              const [y1, y2] = rows[Math.floor(i / 3)]!;
              const cx = (x1 + x2) / 2;
              return (
                <Link key={label} to="/service/$id" params={{ id }} style={box(x1, y1, x2, y2)} className="rounded-[14px] bg-card transition-transform duration-150 active:scale-95">
                  <img src={img} alt="" style={{ position: "absolute", left: (cx - 48 - x1) / S, top: 18 / S, width: 96 / S, height: 96 / S }} />
                  <span className="text-center text-[17.5px] leading-none" style={{ position: "absolute", left: 0, right: 0, top: 120 / S, fontFeatureSettings: '"liga" 0, "clig" 0' }}>{label}</span>
                </Link>
              );
            })}

            <h2 style={{ position: "absolute", right: 29 / S, top: 1660 / S }} className="text-[26px] font-bold leading-none">العمليات</h2>
            <Ops />
          </div>
        </div>

       </div>
       <div className="bg-card" style={{ position: "absolute", left: 0, bottom: 0, width: W, height: (1920 - 1686) / S, overflow: "hidden", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <div style={{ position: "absolute", left: 0, top: -1686 / S, width: W, height: H }}>
        <img src={nav} alt="شريط التنقل" style={box(0, 1686, 864, 1890)} />
        <button aria-label="الرئيسية" style={box(691, 1730, 864, 1890)} className="active:scale-90" />
        {[
          { id: "services", x: 518 },
          { id: "quick", x: 346 },
          { id: "reports", x: 173 },
          { id: "profile", x: 0 },
        ].map(({ id, x }) => (
          <Link key={id} to="/service/$id" params={{ id }} aria-label={id} style={box(x, 1730, x + 173, 1890)} className="rounded-xl transition-transform active:scale-90 active:bg-foreground/5" />
        ))}
        </div>
       </div>
      </div>
    </div>
  );
}

function Cards() {
  const { accounts } = useWallet();
  const [active, setActive] = useState(1);
  const [drag, setDrag] = useState(0);
  const [start, setStart] = useState<{ x: number; t: number } | null>(null);
  const [show, setShow] = useState(false);
  const cw = 482 / S;
  const step = 520 / S;

  const end = () => {
    if (start === null) return;
    const v = drag / Math.max(1, Date.now() - start.t); // px per ms
    const far = Math.abs(drag) > cw / 4 || Math.abs(v) > 0.5;
    if (far && drag > 0 && active < accounts.length - 1) setActive(active + 1);
    else if (far && drag < 0 && active > 0) setActive(active - 1);
    setStart(null);
    setDrag(0);
  };

  return (
    <>
      <div
        style={{ ...box(0, 269, 864, 696), touchAction: "pan-y", perspective: 900 }}
        className="select-none"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setStart({ x: e.clientX, t: Date.now() }); }}
        onPointerMove={(e) => start !== null && setDrag(Math.max(-step, Math.min(step, (e.clientX - start.x) * 0.6)))}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
      >
        {accounts.map((a, i) => {
          const d = i - active;
          const p = d + drag / step; // continuous position (positive = left)
          const ad = Math.min(Math.abs(p), 1.5);
          const isCenter = d === 0;
          return (
            <div
              key={a.name}
              style={{
                position: "absolute",
                left: 191 / S,
                top: 0,
                width: cw,
                height: 427 / S,
                transform: `translateX(${-p * step}px) scale(${1 - ad * 0.12}) rotateY(${Math.max(-1, Math.min(1, p)) * 40}deg)`,
                transition: start === null ? "transform .5s cubic-bezier(.22,.61,.36,1), filter .5s cubic-bezier(.22,.61,.36,1)" : "none",
                filter: ad > 0.5 ? "grayscale(1) brightness(0.45)" : "none",
                zIndex: 10 - Math.round(ad * 2),
              }}
            >
              <img src={card} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
              <div style={{ position: "absolute", left: 270 / S, top: 35 / S, width: 205 / S, height: 180 / S, background: "rgb(228,18,45)" }} />
              <div style={{ position: "absolute", right: 37 / S, top: 52 / S }} className="text-right leading-none text-primary-foreground">
                <div className="text-[12px]">حساب</div>
                <div className="mt-[12px] text-[16.5px] font-bold">{a.name}</div>
                {show && isCenter ? (
                  <div className="mt-[12px] text-[23px] font-extrabold tracking-tight" dir="ltr">{a.amount}</div>
                ) : (
                  <div className="mt-[16px] text-[11px] font-bold tracking-wider" dir="ltr">●●●●●</div>
                )}
              </div>
              {isCenter && (
                <button
                  aria-label={show ? "إخفاء الرصيد" : "إظهار الرصيد"}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setShow(!show)}
                  style={box(370, 320, 445, 390)}
                  className="flex items-center justify-center active:scale-90"
                >
                  {show && <span className="flex h-full w-full items-center justify-center rounded-full" style={{ background: "rgb(228,18,45)" }}><Eye className="h-[22px] w-[22px] text-primary-foreground" strokeWidth={3} /></span>}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ ...box(0, 721, 864, 737) }} className="flex items-center justify-center gap-[4px]" dir="ltr">
        {accounts.map((a, i) => (
          <span key={a.name} className={`h-[5px] rounded-full transition-all ${accounts.length - 1 - i === active ? "w-[5px] bg-primary" : "w-[5px] bg-foreground"}`} />
        ))}
      </div>
    </>
  );
}

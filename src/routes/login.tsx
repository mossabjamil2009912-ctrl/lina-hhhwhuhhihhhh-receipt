import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { checkPassword } from "@/lib/gate";
import { readOwner } from "@/lib/owner";
import { JaibLoader } from "@/components/JaibMark";
import logo from "@/assets/jaib/l2_logo.webp";
import mlogo from "@/assets/jaib/l2_mlogo.webp";
import usr from "@/assets/jaib/l2_usr.webp";
import bld from "@/assets/jaib/l2_bld.webp";
import ph from "@/assets/jaib/l2_ph.webp";
import fpBig from "@/assets/jaib/l2_fpbig.webp";
import fp from "@/assets/jaib/lg_fp.webp";
import c0 from "@/assets/jaib/l2_c0.webp";
import c1 from "@/assets/jaib/l2_c1.webp";
import c2 from "@/assets/jaib/l2_c2.webp";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "جيب - تسجيل الدخول" },
      { name: "description", content: "تسجيل الدخول إلى محفظة جيب" },
      { property: "og:title", content: "جيب - تسجيل الدخول" },
      { property: "og:description", content: "تسجيل الدخول إلى محفظة جيب" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

const S = 887 / 390;
const W = 390;
const H = 1774 / S;
const box = (x1: number, y1: number, x2: number, y2: number): CSSProperties => ({
  position: "absolute", left: x1 / S, top: y1 / S, width: (x2 - x1) / S, height: (y2 - y1) / S,
});

function Login() {
  const router = useRouter();
  const [zoom, setZoom] = useState(1);
  const [type, setType] = useState<"client" | "pos">("client");
  const [phone, setPhone] = useState("773590979");
  useEffect(() => setPhone(readOwner().phone), []);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [sheet, setSheet] = useState(true);
  const [bio, setBio] = useState(false);
  useEffect(() => {
    const f = () => setZoom(Math.min(window.innerWidth / W, window.innerHeight / H));
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const enter = async () => {
    sessionStorage.setItem("jaib-auth", "1");
    await router.navigate({ to: "/" });
  };

  function finger() {
    if (bio) return;
    setSheet(false);
    setBio(true);
    setTimeout(enter, 1000);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    let ok = false;
    try { ok = await checkPassword(pw); } catch { ok = false; }
    setBusy(false);
    if (ok) await enter();
    else setErr(true);
  }

  const tab = (on: boolean) => `rounded-[6px] border transition active:scale-95 ${on ? "border-foreground/30 bg-login-tab" : "border-foreground/15 bg-transparent"}`;

  return (
    <div className="flex h-[100dvh] w-full justify-center overflow-hidden bg-card">
      <form onSubmit={submit} style={{ zoom, width: W, height: H }} className="relative shrink-0 overflow-hidden bg-card [&_img]:mix-blend-multiply">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[150px] [mask-image:linear-gradient(to_bottom,black,transparent)]" style={{ backgroundImage: `url(${mlogo})`, backgroundSize: "34px auto", backgroundRepeat: "space", opacity: 0.03 }} />
        <img src={logo} alt="جيب" style={box(318, 112, 556, 216)} />
        <h1 style={{ position: "absolute", right: 60 / S, top: 330 / S }} className="text-[27px] font-bold leading-none">مرحبًا بعودتك</h1>
        <p style={{ position: "absolute", right: 60 / S, top: 400 / S }} className="text-[22px] leading-none text-foreground/80">قم بتسجيل الدخول</p>

        <button type="button" onClick={() => setType("client")} style={box(454, 500, 832, 677)} className={tab(type === "client")}>
          <img src={usr} alt="" style={{ position: "absolute", left: (643 - 454) / S, top: 28 / S, width: 72 / S, height: 72 / S }} />
          <span style={{ position: "absolute", left: 0, right: 0, top: 112 / S }} className="text-center text-[18px] leading-none">عميل</span>
        </button>
        <button type="button" onClick={() => setType("pos")} style={box(41, 500, 425, 677)} className={tab(type === "pos")}>
          <img src={bld} alt="" style={{ position: "absolute", left: (196 - 41) / S, top: 28 / S, width: 74 / S, height: 72 / S }} />
          <span style={{ position: "absolute", left: 0, right: 0, top: 112 / S }} className="text-center text-[18px] leading-none">نقطة مبيعات</span>
        </button>

        <div style={box(41, 730, 175, 864)} className="rounded-[8px] border border-foreground/10 bg-transparent">
          <img src={ph} alt="" style={{ position: "absolute", left: 30 / S, top: 30 / S, width: 72 / S, height: 72 / S, filter: "grayscale(1) contrast(1.6)", mixBlendMode: "multiply" }} />
        </div>
        <div style={box(195, 730, 836, 864)} className="rounded-[8px] border border-foreground/10 bg-transparent">
          <span style={{ position: "absolute", right: 35 / S, top: -44 / S }} className="whitespace-nowrap text-[17px] leading-none text-foreground/55">رقم الموبايل</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" dir="ltr" aria-label="رقم الموبايل" className="h-full w-full bg-transparent px-[14px] text-right text-[19px] outline-none" />
        </div>

        {bio && <div className="fixed inset-0 z-40 bg-foreground/30" />}
        {bio && (
          <div style={{ ...box(37, 893, 840, 1033), zIndex: 50 }} className="pointer-events-none flex items-center justify-center"><div className="scale-[1.8] drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]"><JaibLoader /></div></div>
        )}
        <div style={box(37, 893, 840, 1033)} className={`rounded-[8px] border bg-transparent ${err ? "border-primary" : "border-foreground/25"}`}>
          {bio ? null : (
            <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} inputMode="numeric" autoComplete="current-password" aria-label="كلمة المرور" dir="ltr" className="h-full w-full bg-transparent pl-[48px] pr-[20px] text-right text-[19px] outline-none" />
          )}
          {!pw && <span style={{ position: "absolute", right: 38 / S, top: 0, bottom: 0 }} className="pointer-events-none flex items-center text-[18px] text-muted-foreground">كلمة المرور</span>}
          <button type="button" onClick={finger} aria-label="البصمة" style={{ position: "absolute", left: 28 / S, top: 36 / S, width: 68 / S, height: 68 / S }}><img src={fp} alt="" className="h-full w-full contrast-[1.6]" /></button>
        </div>
        <p style={{ position: "absolute", right: 40 / S, top: 1052 / S }} className={`text-[16px] leading-none ${err ? "text-primary" : "text-foreground/70"}`}>{err ? "كلمة المرور غير صحيحة" : "طول كلمة المرور يجب أن يكون 4 أرقام أو أكثر"}</p>
        <button type="button" style={{ position: "absolute", right: 40 / S, top: 1116 / S }} className="text-[18px] font-bold leading-none">نسيت كلمة المرور؟</button>

        <button type="submit" disabled={busy || bio} style={box(33, 1183, 848, 1302)} className="rounded-[12px] bg-primary text-[19px] brightness-[0.92] font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-90">
          {type === "client" ? "تسجيل الدخول كـ عميل" : "تسجيل الدخول كـ نقطة مبيعات"}
        </button>

        <label style={{ position: "absolute", right: 38 / S, top: 1335 / S }} className="flex items-center gap-[10px] text-[20px] font-bold leading-none">
          <input type="checkbox" checked={offline} onChange={(e) => setOffline(e.target.checked)} className="h-[25px] w-[25px] appearance-none rounded-[6px] border-2 border-foreground/70 checked:bg-primary checked:border-primary" />
          دخول بدون نت
        </label>
        <p style={{ position: "absolute", left: 33 / S, top: 1340 / S }} className="text-[16px] leading-none text-muted-foreground">
          لا تمتلك حساب؟ <button type="button" className="font-bold text-primary">إنشاء حساب</button>
        </p>

        {sheet && (
          <button type="button" onClick={finger} aria-label="الدخول بالبصمة" style={{ ...box(362, 1381, 528, 1530), zIndex: 30 }} className="rounded-full bg-card transition active:scale-90">
            <img src={fpBig} alt="" className="h-full w-full" style={{ clipPath: "circle(47% at 50% 50%)" }} />
          </button>
        )}

        {[{ img: c0, label: "الرقم المجاني", x: 630 }, { img: c1, label: "نقاط الخدمة", x: 437 }, { img: c2, label: "خدمة العملاء", x: 244 }].map((c) => (
          <button key={c.label} type="button" style={box(c.x - 85, 1444, c.x + 85, 1600)} className="transition active:scale-90">
            <img src={c.img} alt="" style={{ position: "absolute", left: 20 / S, top: -6 / S, width: 130 / S, height: 130 / S, filter: "contrast(1.25)" }} />
            <span style={{ position: "absolute", left: 0, right: 0, top: 132 / S }} className="whitespace-nowrap text-center text-[14.5px] leading-none text-foreground/75">{c.label}</span>
          </button>
        ))}

        {sheet && <div onClick={() => setSheet(false)} className="fixed inset-0 z-10 bg-foreground/30" />}
        {sheet && (
          <div style={{ ...box(56, 825, 832, 1289), zIndex: 20 }} className="rounded-[26px] bg-login-sheet shadow-[0_6px_30px_rgba(0,0,0,0.15)]">
            <div style={{ position: "absolute", left: 0, right: 0, top: 68 / S }} className="flex items-center justify-center gap-[6px]">
              <span className="text-[13px] leading-none text-foreground/70">جيب</span>
              <img src={mlogo} alt="" style={{ width: 36 / S, height: 36 / S, objectFit: "cover", objectPosition: "0% 50%" }} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 150 / S }} className="text-center text-[18px] font-bold leading-none">محفظة جيب</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 206 / S }} className="text-center text-[17px] leading-none text-foreground/80" dir="ltr">{phone}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 262 / S }} className="text-center text-[14px] leading-none text-foreground/70">استخدم البصمة للاستمرار</div>
            <button type="button" onClick={() => setSheet(false)} style={{ position: "absolute", left: 0, right: 0, top: 330 / S, height: 100 / S }} className="text-center text-[19px] font-bold">استخدم كلمة المرور</button>
          </div>
        )}
      </form>
    </div>
  );
}

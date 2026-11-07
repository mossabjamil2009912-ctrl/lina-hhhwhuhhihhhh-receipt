import logo from "@/assets/jaib/sub_logo.webp";

const BAG = "M47 106 H14 V134 M14 143 A48 48 0 0 0 110 143 V106 H58";

export function JaibLoader({ gray = false }: { gray?: boolean }) {
  return (
    <svg viewBox="0 0 124 200" className="h-[70px] w-[44px] overflow-visible" fill="none">
      <g transform="translate(0 -40)">
        <path d={BAG} pathLength={100} className={`jaib-ld-path ${gray ? "stroke-muted-foreground" : "stroke-background"}`} strokeWidth={15} />
        <g className="jaib-ld-dot"><circle cx="82" cy="138" r="9" className={gray ? "fill-muted-foreground" : "fill-background"} /></g>
      </g>
    </svg>
  );
}

export function JaibReceiptLogo() {
  return (
    <div className="relative mx-auto h-[88px] w-[117px]">
      <img src={logo} alt="جيب" className="absolute inset-0 h-full w-full" style={{ clipPath: "inset(0 0 0 46.6%)" }} />
      <svg viewBox="0 0 124 200" className="absolute left-0 top-0 h-full" style={{ width: "46.6%" }} fill="none">
        <path d={BAG} className="stroke-primary" strokeWidth={15} />
        <g className="jaib-rc-dot"><circle cx="82" cy="138" r="9" className="fill-primary" /></g>
        <g className="jaib-rc-frame"><path d="M23 95 V13 H100 V95" className="stroke-primary" strokeWidth={15} /></g>
        <rect x="44" y="42" width="36" height="9" className="jaib-rc-bar fill-primary" />
        <rect x="44" y="72" width="36" height="9" className="jaib-rc-bar jaib-rc-bar2 fill-primary" />
        <rect x="57" y="40" width="10" height="42" className="jaib-rc-col fill-primary" />
      </svg>
    </div>
  );
}

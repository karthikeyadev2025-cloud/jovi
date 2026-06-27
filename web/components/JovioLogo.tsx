"use client";

interface Props {
  size?: number;
  showText?: boolean;
  variant?: "horizontal" | "icon" | "stacked";
}

export default function JovioLogo({ size = 48, showText = true, variant = "horizontal" }: Props) {
  const SURYA = "#F59E0B";
  const MERCURY = "#00E676";
  const CHANDRA = "#F8FAFC";

  const JMark = (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="surya-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D"/>
          <stop offset="60%" stopColor={SURYA}/>
          <stop offset="100%" stopColor="#D97706"/>
        </linearGradient>
        <linearGradient id="mercury-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34F39A"/>
          <stop offset="60%" stopColor={MERCURY}/>
          <stop offset="100%" stopColor="#00B358"/>
        </linearGradient>
        <filter id="glow-mark">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <path
        d="M 38 12 L 68 12 L 68 22 L 48 30 L 38 22 Z"
        fill="url(#surya-grad)"
        filter="url(#glow-mark)"
      />

      <path
        d="M 50 30
           L 58 30
           L 58 68
           Q 58 82, 46 86
           Q 32 90, 22 78
           L 28 70
           Q 34 76, 42 74
           Q 50 72, 50 64
           Z"
        fill="url(#mercury-grad)"
        filter="url(#glow-mark)"
      />
    </svg>
  );

  if (variant === "icon") return JMark;

  if (variant === "stacked") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {JMark}
        {showText && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: size * 0.42,
              fontWeight: 900,
              color: CHANDRA,
              letterSpacing: size * 0.04,
              lineHeight: 1,
            }}>
              JOV<span style={{ color: SURYA }}>I</span><span style={{ color: SURYA }}>O</span>
            </div>
            <div style={{
              fontSize: size * 0.13,
              color: MERCURY,
              letterSpacing: size * 0.05,
              fontWeight: 600,
              marginTop: size * 0.08,
              textTransform: "uppercase",
            }}>
              Global Technologies
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.25 }}>
      {JMark}
      {showText && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{
            fontSize: size * 0.55,
            fontWeight: 900,
            color: CHANDRA,
            letterSpacing: size * 0.02,
          }}>
            JOV<span style={{ color: SURYA }}>IO</span>
          </div>
          <div style={{
            fontSize: size * 0.14,
            color: MERCURY,
            letterSpacing: size * 0.06,
            fontWeight: 600,
            marginTop: size * 0.06,
            textTransform: "uppercase",
          }}>
            Global Technologies
          </div>
        </div>
      )}
    </div>
  );
}

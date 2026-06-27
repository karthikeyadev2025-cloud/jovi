import Image from "next/image";

interface Props {
  size?: number;        // logo image size in px
  showText?: boolean;   // show "Jovio Global Technologies" text
  variant?: "full" | "icon" | "horizontal";
}

export default function JovioLogo({ size = 40, showText = true, variant = "horizontal" }: Props) {
  if (variant === "icon") {
    return (
      <Image
        src="/jovio-logo.jpeg"
        alt="Jovio"
        width={size}
        height={size}
        priority
        style={{ borderRadius: size * 0.18, objectFit: "cover" }}
      />
    );
  }

  if (variant === "full") {
    // Just the logo image (which already contains text)
    return (
      <Image
        src="/jovio-logo.jpeg"
        alt="Jovio Global Technologies"
        width={size * 4}
        height={size * 4}
        priority
        style={{ width: "auto", height: size, objectFit: "contain" }}
      />
    );
  }

  // Default: horizontal — image icon + text aside
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Image
        src="/jovio-logo.jpeg"
        alt="Jovio"
        width={size}
        height={size}
        priority
        style={{ borderRadius: size * 0.18, objectFit: "cover", flexShrink: 0 }}
      />
      {showText && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{
            fontSize: size * 0.5,
            fontWeight: 900,
            background: "linear-gradient(135deg, #F59E0B 0%, #00E676 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -0.5,
          }}>Jovio</div>
          <div style={{
            fontSize: size * 0.18,
            color: "#9CA3AF",
            letterSpacing: 1.5,
            fontWeight: 600,
            marginTop: 2,
          }}>GLOBAL TECHNOLOGIES</div>
        </div>
      )}
    </div>
  );
}

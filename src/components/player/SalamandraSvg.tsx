/**
 * Waka Salamandra — pure SVG brand mark.
 * Ultra-light, no external images. Used as aura wallpaper backdrop.
 */
export function SalamandraSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body — sinuous S-curve */}
      <path
        d="M200 60 C160 80, 120 130, 140 180 C160 230, 220 240, 200 290 C180 340, 140 360, 160 380"
        stroke="currentColor"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
        opacity="0.12"
      />
      {/* Head */}
      <ellipse cx="200" cy="55" rx="28" ry="20" fill="currentColor" opacity="0.10" />
      {/* Eyes */}
      <circle cx="189" cy="50" r="4" fill="currentColor" opacity="0.18" />
      <circle cx="211" cy="50" r="4" fill="currentColor" opacity="0.18" />
      {/* Front left leg */}
      <path
        d="M155 140 C120 125, 95 140, 80 130"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.08"
      />
      {/* Front right leg */}
      <path
        d="M165 155 C200 135, 240 140, 260 125"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.08"
      />
      {/* Rear left leg */}
      <path
        d="M190 270 C155 285, 130 275, 110 290"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.08"
      />
      {/* Rear right leg */}
      <path
        d="M210 260 C245 275, 270 265, 290 280"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.08"
      />
      {/* Toes — front left */}
      <path d="M80 130 C72 122, 68 128, 65 120" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.06" />
      <path d="M80 130 C75 135, 68 132, 62 138" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.06" />
      {/* Toes — front right */}
      <path d="M260 125 C268 117, 272 123, 278 115" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.06" />
      <path d="M260 125 C265 130, 272 127, 278 133" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.06" />
      {/* Tail continuation */}
      <path
        d="M160 380 C180 395, 200 385, 220 395"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity="0.06"
      />
      {/* Dorsal spots */}
      <circle cx="170" cy="160" r="6" fill="currentColor" opacity="0.05" />
      <circle cx="195" cy="200" r="5" fill="currentColor" opacity="0.05" />
      <circle cx="185" cy="250" r="7" fill="currentColor" opacity="0.05" />
      <circle cx="200" cy="310" r="5" fill="currentColor" opacity="0.05" />
    </svg>
  );
}

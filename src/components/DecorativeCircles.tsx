export function DecorativeCircles() {
  return (
    <>
      {/* Top right cluster */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#E8533A] opacity-90" />

      {/* Smaller accent circles */}
      <div className="absolute top-32 right-12 w-16 h-16 rounded-full border-2 border-[#1C1C1C]" />

      {/* Hatched circle */}
      <div className="absolute top-24 right-32 w-20 h-20 rounded-full overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 80 80">
          <defs>
            <pattern
              id="hatch-pattern"
              patternUnits="userSpaceOnUse"
              width="3"
              height="3"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="3"
                stroke="#1C1C1C"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#hatch-pattern)" />
        </svg>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-20 left-8 w-32 h-32 rounded-full border-2 border-[#E8533A] opacity-40" />
    </>
  );
}

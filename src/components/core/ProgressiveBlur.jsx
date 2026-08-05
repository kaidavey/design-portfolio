export default function ProgressiveBlur({ borderRadius = '60px' }) {
  const layers = [
    { blur: 0.25, from: 0,  to: 17 },
    { blur: 0.5,   from: 17, to: 33 },
    { blur: 1,   from: 33, to: 50 },
    { blur: 2,   from: 50, to: 67 },
    { blur: 4,   from: 67, to: 83 },
    { blur: 8,  from: 83, to: 100 },
  ]

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-20 overflow-hidden"
      style={{
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
      }}
    >
      {layers.map((layer, i) => {
        const mask = `linear-gradient(to top, transparent ${layer.from}%, black ${layer.to}%)`
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}

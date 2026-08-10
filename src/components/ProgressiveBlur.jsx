export default function ProgressiveBlur() {
  const layers = [
    { blur: 0.25, from: 0,  to: 17 },
    { blur: 0.5,  from: 17, to: 33 },
    { blur: 1,    from: 33, to: 50 },
    { blur: 2,    from: 50, to: 67 },
    { blur: 4,    from: 67, to: 83 },
    { blur: 8,    from: 83, to: 100 },
  ]

  // Top corners track the container; bottom corners are pinned to 0.
  // `border-radius: inherit` would pull all four, and with a strip this
  // short the two left/right radii sum past the 80px height — CSS then
  // scales EVERY radius down uniformly, shrinking the top corners so they
  // no longer match the container. The bottom corners never paint anyway
  // (every mask is transparent down there), so zeroing them is free.
  const corners = {
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-20"
      style={corners}
    >
      {layers.map((layer, i) => {
        const mask = `linear-gradient(to top, transparent ${layer.from}%, black ${layer.to}%)`
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              ...corners,
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
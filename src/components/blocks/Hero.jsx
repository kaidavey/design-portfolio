import ThemedIcon from '../ThemedIcon'

export default function Hero({ block }) {
  return (
    <div className="flex items-center gap-4 w-full antialiased">
      <ThemedIcon
        source={block.icon}
        darkSource={block.iconDark}
        invert={block.iconDarkInvert}
        size={50}
        className="w-12.5 h-12.5 shrink-0"
      />
      <div className="tracking-[-0.02em] w-fit shrink-0 font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-secondary)] text-fluid-heading">
        {block.title}
      </div>
    </div>
  )
}

export default function Icon({ id, className, size = 20, style = {}, ...props }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      style={{ overflow: 'visible', ...style }}
      {...props}
    >
      <use href={`/icons.svg#${id}`} />
    </svg>
  )
}

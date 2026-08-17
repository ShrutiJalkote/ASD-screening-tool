import { motion } from 'framer-motion'

// Renders answers as a live bio-signal trace: agree-scored answers spike up,
// disagree-scored answers dip down, unanswered stays flat on the baseline.
// This is the app's signature element — it shows up on the landing hero
// (idle, gently animated), on the questionnaire (filling in live), and
// frozen as the final trace on the result screen.
export default function PulseTrace({ values, width = 640, height = 120, color = 'var(--indigo)', idle = false }) {
  const n = values.length
  const midY = height / 2
  const amp = height * 0.34
  const padX = 24
  const usableW = width - padX * 2

  const points = values.map((v, i) => {
    const x = padX + (usableW * i) / (n - 1)
    let y = midY
    if (v === 1) y = midY - amp
    else if (v === 0) y = midY + amp * 0.62
    return { x, y, v, i }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className={`pulse-trace ${idle ? 'idle' : ''}`}>
      <line x1={padX} y1={midY} x2={width - padX} y2={midY} className="pulse-baseline" />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ d: pathD }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      />
      {points.map((p) => p.v !== null && (
        <motion.circle
          key={p.i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        />
      ))}
    </svg>
  )
}

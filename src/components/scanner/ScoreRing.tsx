'use client'

interface Props { score: number }

export function ScoreRing({ score }: Props) {
  const r = 24
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444'
  const label = score >= 80 ? 'Safe' : score >= 60 ? 'Moderate' : score >= 40 ? 'At Risk' : 'Critical'

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle
            cx="32" cy="32" r={r}
            fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="score-ring transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white leading-none">{score}</span>
        </div>
      </div>
      <span className="text-xs mt-1" style={{ color }}>{label}</span>
    </div>
  )
}

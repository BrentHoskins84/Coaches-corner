import LoadingDots from './loading-dots'

interface LoadingProps {
  message?: string
  dotSize?: number
  dotGap?: number
  className?: string
}

export default function Loading({
  message,
  dotSize = 12,
  dotGap = 4,
  className = ''
}: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <LoadingDots size={dotSize} gap={dotGap} />
      {message && (
        <p className="text-sm font-medium text-gray-600">{message}</p>
      )}
    </div>
  )
}

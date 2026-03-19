export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div className="w-8 h-8 rounded-full border-2 border-food-border border-t-food-accent animate-spin" />
    </div>
  )
}

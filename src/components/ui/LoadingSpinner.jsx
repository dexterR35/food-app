export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div className="w-8 h-8 border-2 border-food-border border-t-food-accent rounded-full animate-spin" />
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'

const labelForPath = (pathname) => {
  if (pathname === '/') return 'Dashboard'
  if (pathname === '/board') return "Today's Board"
  if (pathname === '/my-orders') return 'My Orders'
  if (pathname === '/orders') return 'All Orders'
  if (pathname === '/food') return 'Food Catalog'
  if (pathname === '/users') return 'Users'
  if (pathname === '/profile') return 'Profile'
  return pathname
}

export default function Breadcrumbs() {
  const location = useLocation()
  const current = labelForPath(location.pathname)

  const items = [
    { to: '/', label: 'Dashboard' },
  ]

  if (location.pathname !== '/') {
    items.push({ to: location.pathname, label: current })
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((item, idx) => (
        <span key={item.to ?? idx} className="flex items-center gap-2">
          {idx === 0 ? (
            <Link
              to={item.to}
              className="text-food-text-m hover:text-food-text"
              aria-current={idx === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-food-text font-medium">{item.label}</span>
          )}
          {idx < items.length - 1 && <span className="text-food-text-m">/</span>}
        </span>
      ))}
    </nav>
  )
}


import { orderItemDisplayName } from './orderDisplay'

export function buildCsvRows(orders, date) {
  const rows = []
  for (const order of orders) {
    for (const item of order.order_items) {
      rows.push({
        date,
        username: order.users.username,
        department: order.users.department,
        food_item: orderItemDisplayName(item),
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_calories: item.unit_calories,
        line_total_price: +(item.unit_price * item.quantity).toFixed(2),
        line_total_calories: item.unit_calories * item.quantity,
        order_total_price: order.total_price,
        order_total_calories: order.total_calories,
        note: item.note || '',
        submitted_at: order.submitted_at,
      })
    }
  }
  return rows
}

export function downloadCsv(orders, date) {
  const rows = buildCsvRows(orders, date)
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

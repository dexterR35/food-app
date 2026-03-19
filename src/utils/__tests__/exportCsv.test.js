import { buildCsvRows } from '../exportCsv'

const mockOrders = [{
  submitted_at: '2026-03-18T10:00:00Z',
  total_price: 50,
  total_calories: 640,
  users: { username: 'john', department: 'IT' },
  order_items: [{
    food_items: { name: 'Grilled Chicken' },
    quantity: 2, unit_price: 28, unit_calories: 320, note: ''
  }]
}]

describe('buildCsvRows', () => {
  it('produces one row per order item', () => {
    const rows = buildCsvRows(mockOrders, '2026-03-18')
    expect(rows).toHaveLength(1)
  })
  it('calculates line totals correctly', () => {
    const [row] = buildCsvRows(mockOrders, '2026-03-18')
    expect(row.line_total_price).toBe(56)
    expect(row.line_total_calories).toBe(640)
  })
  it('includes username and department', () => {
    const [row] = buildCsvRows(mockOrders, '2026-03-18')
    expect(row.username).toBe('john')
    expect(row.department).toBe('IT')
  })
})

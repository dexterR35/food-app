/** Line item label when food row may be deleted (food_item_id null). */
export function orderItemDisplayName(item) {
  return item?.food_items?.name ?? item?.item_name ?? 'Removed item'
}

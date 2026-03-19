import { useState } from 'react'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { useAllFoodItems, useSaveFoodItem, useToggleFoodItem } from './hooks/useFoodItems'
import FoodForm from './components/FoodForm'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const columns = (onEdit, onToggle) => [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Category', accessorKey: 'category', cell: ({ getValue }) => <Badge variant="user">{getValue()}</Badge> },
  { header: 'Price', accessorKey: 'price', cell: ({ getValue }) => `${Number(getValue()).toFixed(2)} RON` },
  { header: 'Calories', accessorKey: 'calories', cell: ({ getValue }) => `${getValue()} kcal` },
  { header: 'Protein', accessorKey: 'protein_g', cell: ({ getValue }) => `${getValue()}g` },
  { header: 'Status', accessorKey: 'is_active', cell: ({ getValue }) => <Badge variant={getValue() ? 'approved' : 'cancelled'}>{getValue() ? 'Active' : 'Inactive'}</Badge> },
  {
    header: 'Actions', id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button onClick={() => onEdit(row.original)} className="text-food-text-s hover:text-food-accent transition-colors"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => onToggle({ id: row.original.id, is_active: !row.original.is_active })} className="text-food-text-s hover:text-food-accent transition-colors">
          {row.original.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    )
  },
]

export default function FoodCatalogPage() {
  const [editing, setEditing] = useState(null) // null=closed, {}=new, item=edit
  const { data = [], isLoading } = useAllFoodItems()
  const save = useSaveFoodItem()
  const toggle = useToggleFoodItem()

  async function handleSave(values) {
    await save.mutateAsync(editing?.id ? { ...values, id: editing.id } : values)
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-food-text">Food Catalog</h1>
        <Button onClick={() => setEditing({})}><Plus className="w-4 h-4 mr-1 inline" />Add Item</Button>
      </div>
      <DataTable columns={columns(setEditing, toggle.mutate)} data={data} loading={isLoading} emptyTitle="No food items" emptyDescription="Add your first item." />
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Item' : 'New Item'} size="lg">
        <FoodForm item={editing?.id ? editing : null} onSave={handleSave} onCancel={() => setEditing(null)} saving={save.isPending} />
      </Modal>
    </div>
  )
}

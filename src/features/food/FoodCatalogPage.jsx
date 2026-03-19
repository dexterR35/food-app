import { useState } from 'react'
import { Plus, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useAllFoodItems, useSaveFoodItem, useToggleFoodItem, useDeleteFoodItem } from './hooks/useFoodItems'
import FoodForm from './components/FoodForm'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const columns = (onEdit, onToggle, onRequestDelete) => [
  { header: 'Name', accessorKey: 'name' },
  {
    header: 'Type',
    accessorKey: 'item_type',
    cell: ({ getValue }) => (
      <Badge variant={getValue() === 'menu' ? 'info' : 'neutral'}>
        {getValue() === 'menu' ? 'Menu' : 'Main'}
      </Badge>
    ),
  },
  {
    header: 'Menu',
    id: 'menu_parts',
    cell: ({ row }) => (
      <span className="text-food-text-m text-xs">
        {Array.isArray(row.original.menu_parts) && row.original.menu_parts.length
          ? row.original.menu_parts.join(' + ')
          : '—'}
      </span>
    ),
  },
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
        <button onClick={() => onRequestDelete(row.original)} className="text-food-text-s hover:text-food-crimson transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )
  },
]

export default function FoodCatalogPage() {
  const [editing, setEditing] = useState(null) // null=closed, {}=new, item=edit
  const [toggleCandidate, setToggleCandidate] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const { data = [], isLoading } = useAllFoodItems()
  const save = useSaveFoodItem()
  const toggle = useToggleFoodItem()
  const del = useDeleteFoodItem()

  async function handleSave(values) {
    await save.mutateAsync(editing?.id ? { ...values, id: editing.id } : values)
    setEditing(null)
  }

  async function handleConfirmToggle() {
    if (!toggleCandidate?.id || toggle.isPending) return
    await toggle.mutateAsync({ id: toggleCandidate.id, is_active: toggleCandidate.nextActive })
    setToggleCandidate(null)
  }

  async function handleConfirmDelete() {
    if (!deleteCandidate?.id || del.isPending) return
    await del.mutateAsync(deleteCandidate.id)
    setDeleteCandidate(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-food-text">Food Catalog</h1>
        <Button onClick={() => setEditing({})}><Plus className="w-4 h-4 mr-1 inline" />Add Item</Button>
      </div>
      <DataTable
        columns={columns(
          setEditing,
          ({ id, is_active }) => {
            const item = data.find((d) => d.id === id)
            setToggleCandidate({
              id,
              name: item?.name ?? 'this item',
              nextActive: is_active,
            })
          },
          (item) => setDeleteCandidate(item)
        )}
        data={data}
        loading={isLoading}
        emptyTitle="No food items"
        emptyDescription="Add your first item."
      />
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Item' : 'New Item'} size="lg">
        <FoodForm item={editing?.id ? editing : null} onSave={handleSave} onCancel={() => setEditing(null)} saving={save.isPending} />
      </Modal>

      <Modal
        open={!!toggleCandidate}
        onClose={() => !toggle.isPending && setToggleCandidate(null)}
        title={toggleCandidate?.nextActive ? 'Activate item?' : 'Deactivate item?'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-food-border bg-food-elevated p-3">
            <p className="text-food-text text-sm font-semibold">
              {toggleCandidate?.nextActive ? 'Confirmation' : 'Warning'}
            </p>
            <p className="mt-1 text-food-text-m text-xs">
              {toggleCandidate?.nextActive
                ? <>This will make <span className="font-semibold text-food-text">{toggleCandidate?.name}</span> available on the board.</>
                : <>This will hide <span className="font-semibold text-food-text">{toggleCandidate?.name}</span> from new orders.</>}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setToggleCandidate(null)} disabled={toggle.isPending}>
              Cancel
            </Button>
            <Button
              variant={toggleCandidate?.nextActive ? 'primary' : 'danger'}
              onClick={handleConfirmToggle}
              disabled={toggle.isPending}
            >
              {toggle.isPending
                ? 'Saving…'
                : toggleCandidate?.nextActive ? 'Yes, activate' : 'Yes, deactivate'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteCandidate}
        onClose={() => !del.isPending && setDeleteCandidate(null)}
        title="Delete food item?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-food-border bg-food-elevated p-3">
            <p className="text-food-text text-sm font-semibold">Warning</p>
            <p className="mt-1 text-food-text-m text-xs">
              Permanently remove <span className="font-semibold text-food-text">{deleteCandidate?.name}</span> from the catalog.
              Past orders keep the saved item name and prices.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteCandidate(null)} disabled={del.isPending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={del.isPending}>
              {del.isPending ? 'Deleting…' : 'Yes, delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

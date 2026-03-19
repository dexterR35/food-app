import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/ui/Button'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  calories: z.coerce.number().int().min(0),
  protein_g: z.coerce.number().min(0).default(0),
  carbs_g: z.coerce.number().min(0).default(0),
  fat_g: z.coerce.number().min(0).default(0),
  category: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
})

const categories = ['Main', 'Salad', 'Soup', 'Side', 'Drink', 'Dessert']
const inputCls = "w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"

export default function FoodForm({ item, onSave, onCancel, saving }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: item ?? { is_active: true },
  })
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><input {...register('name')} placeholder="Name *" className={inputCls} /></div>
        <div className="col-span-2"><input {...register('description')} placeholder="Description" className={inputCls} /></div>
        <div>
          <label className="text-food-text-m text-xs mb-1 block">Category *</label>
          <select {...register('category')} className={inputCls}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><input {...register('image_url')} placeholder="Image URL" className={inputCls} /></div>
        <div><input {...register('price')} type="number" step="0.01" placeholder="Price (RON) *" className={inputCls} /></div>
        <div><input {...register('calories')} type="number" placeholder="Calories *" className={inputCls} /></div>
        <div><input {...register('protein_g')} type="number" step="0.1" placeholder="Protein (g)" className={inputCls} /></div>
        <div><input {...register('carbs_g')} type="number" step="0.1" placeholder="Carbs (g)" className={inputCls} /></div>
        <div><input {...register('fat_g')} type="number" step="0.1" placeholder="Fat (g)" className={inputCls} /></div>
        <div className="flex items-center gap-2 pt-6">
          <input {...register('is_active')} type="checkbox" id="is_active" className="accent-food-accent" />
          <label htmlFor="is_active" className="text-food-text-s text-sm">Active</label>
        </div>
      </div>
      {Object.keys(errors).length > 0 && <p className="text-red-400 text-xs">Please fix form errors</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}

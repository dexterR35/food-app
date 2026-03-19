import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/ui/Button'
import { sanitizeText, clampNumber } from '../../../utils/security'

const schema = z.object({
  name: z.preprocess(
    (value) => sanitizeText(value, { maxLength: 120 }),
    z.string().min(1, 'Name is required.').max(120)
  ),
  description: z.preprocess(
    (value) => sanitizeText(value ?? '', { maxLength: 500 }),
    z.string().max(500).optional()
  ),
  price: z.preprocess(
    (value) => clampNumber(value, { min: 0, max: 10000, fallback: 0 }),
    z.number().min(0).max(10000)
  ),
  calories: z.preprocess(
    (value) => Math.round(clampNumber(value, { min: 0, max: 10000, fallback: 0 })),
    z.number().int().min(0).max(10000)
  ),
  protein_g: z.preprocess(
    (value) => clampNumber(value, { min: 0, max: 1000, fallback: 0 }),
    z.number().min(0).max(1000).default(0)
  ),
  carbs_g: z.preprocess(
    (value) => clampNumber(value, { min: 0, max: 1000, fallback: 0 }),
    z.number().min(0).max(1000).default(0)
  ),
  fat_g: z.preprocess(
    (value) => clampNumber(value, { min: 0, max: 1000, fallback: 0 }),
    z.number().min(0).max(1000).default(0)
  ),
  category: z.preprocess(
    (value) => sanitizeText(value, { maxLength: 40 }),
    z.string().min(1, 'Category is required.').max(40)
  ),
  image_url: z.string().trim().url().optional().or(z.literal('')),
  item_type: z.enum(['main', 'menu']).default('main'),
  menu_parts: z.array(
    z.preprocess(
      (value) => sanitizeText(value ?? '', { maxLength: 80 }),
      z.string().max(80)
    )
  ).max(3).optional(),
  is_active: z.boolean().default(true),
}).superRefine((values, ctx) => {
  if (values.item_type === 'menu') {
    const count = (values.menu_parts ?? []).filter(Boolean).length
    if (count !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['menu_parts'],
        message: 'Menu type must have exactly 3 pieces.',
      })
    }
  }
})

const categories = ['Main', 'Salad', 'Soup', 'Side', 'Drink', 'Dessert']
const inputCls = "w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"

export default function FoodForm({ item, onSave, onCancel, saving }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...(item ?? { is_active: true }),
      item_type: item?.item_type ?? 'main',
      menu_parts: item?.menu_parts?.length ? item.menu_parts : ['', '', ''],
    },
  })
  const itemType = useWatch({ name: 'item_type', control }) ?? 'main'
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
        <div>
          <label className="text-food-text-m text-xs mb-1 block">Type *</label>
          <select {...register('item_type')} className={inputCls}>
            <option value="main">Main (individual pick)</option>
            <option value="menu">Menu (3 pieces)</option>
          </select>
        </div>
        <div><input {...register('image_url')} placeholder="Image URL" className={inputCls} /></div>
        <div className="col-span-2">
          <label className="text-food-text-m text-xs mb-1 block">Menu option pieces</label>
          <div className="grid grid-cols-3 gap-2">
            <input {...register('menu_parts.0')} placeholder="Piece 1 (e.g. potatoes)" className={inputCls} />
            <input {...register('menu_parts.1')} placeholder="Piece 2 (e.g. beef)" className={inputCls} />
            <input {...register('menu_parts.2')} placeholder="Piece 3 (e.g. salad)" className={inputCls} />
          </div>
          {itemType === 'menu' && (
            <p className="text-food-text-m text-[11px] mt-1">Menu items require exactly 3 pieces.</p>
          )}
        </div>
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

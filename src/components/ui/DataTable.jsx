import { flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

export default function DataTable({ columns, data, loading, emptyTitle = 'No data', emptyDescription, globalFilter, onGlobalFilterChange }) {
  const [sorting, setSorting] = useState([])

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="overflow-x-auto rounded-xl border border-food-border">
      <table className="w-full">
        <thead className="bg-food-elevated">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id} className="border-b border-food-border">
              {hg.headers.map(h => (
                <th
                  key={h.id}
                  className="text-left text-xs font-medium text-food-text-m py-3 px-4 uppercase tracking-wide cursor-pointer select-none"
                  onClick={h.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === 'asc' && <ChevronUp className="w-3 h-3" />}
                    {h.column.getIsSorted() === 'desc' && <ChevronDown className="w-3 h-3" />}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr><td colSpan={columns.length}><EmptyState title={emptyTitle} description={emptyDescription} /></td></tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-food-border hover:bg-food-elevated transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-3 px-4 text-sm text-food-text">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

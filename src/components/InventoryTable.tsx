'use client'

import { useState } from 'react'
import { type ShelfSlot, parseSlotId, TIER_LABELS } from '@/lib/types'

interface Props {
  slots: Record<string, ShelfSlot>
  onSlotClick: (slotId: string) => void
}

export default function InventoryTable({ slots, onSlotClick }: Props) {
  const [search, setSearch] = useState('')

  const occupied = Object.values(slots)
    .filter((s) => s.pallet !== null)
    .filter((s) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        s.pallet!.productName.toLowerCase().includes(q) ||
        s.pallet!.productCode.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier
      if (a.compartment !== b.compartment) return a.compartment - b.compartment
      return a.slot.localeCompare(b.slot)
    })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-base font-semibold text-gray-700 shrink-0">Anlık Stok</h2>
        <input
          className="flex-1 max-w-xs rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {occupied.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          {search ? 'Arama sonucu bulunamadı' : 'Depoda stok yok'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Konum</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Ürün Adı</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Kod</th>
                <th className="text-right text-xs font-semibold text-gray-500 pb-2 pr-3">Miktar</th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-2">Giriş</th>
              </tr>
            </thead>
            <tbody>
              {occupied.map((s) => {
                const { tier, compartment, slot } = parseSlotId(s.id)
                const tierShort = tier === 1 ? 'Alt' : tier === 2 ? 'Orta' : 'Üst'
                return (
                  <tr
                    key={s.id}
                    onClick={() => onSlotClick(s.id)}
                    className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition"
                  >
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {tierShort}
                        </span>
                        <span className="text-gray-600">
                          {compartment}. Bölme / {slot}
                        </span>
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-medium text-gray-800">{s.pallet!.productName}</td>
                    <td className="py-2 pr-3 text-gray-500">{s.pallet!.productCode || '—'}</td>
                    <td className="py-2 pr-3 text-right font-semibold text-gray-800">
                      {s.pallet!.quantity}
                      <span className="text-gray-400 font-normal ml-1 text-xs">{s.pallet!.unit}</span>
                    </td>
                    <td className="py-2 text-gray-400 text-xs">
                      {new Date(s.pallet!.entryDate).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

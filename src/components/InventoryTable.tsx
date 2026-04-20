'use client'

import { useState } from 'react'
import { type ShelfSlot, parseSlotId } from '@/lib/types'

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

  const tierColor = { 1: '#10b981', 2: '#3b82f6', 3: '#a855f7' }
  const tierLabel = { 1: 'ALT', 2: 'ORTA', 3: 'ÜST' }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(160deg, #0d1b2e, #0a1520)',
        border: '1px solid #1a2f45',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between mb-5 gap-3">
        <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase shrink-0">Anlık Stok</h2>
        <div className="flex-1 max-w-xs relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">🔍</span>
          <input
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1a3050',
              color: '#c8d8e8',
            }}
            placeholder="Ürün veya kod ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {occupied.length === 0 ? (
        <p className="text-sm text-center py-10 tracking-wide" style={{ color: '#2a4a6a' }}>
          {search ? 'Sonuç bulunamadı' : 'Depoda stok yok'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #1a3050' }}>
                {['Konum', 'Ürün Adı', 'Kod', 'Miktar', 'Giriş'].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: '#3a5a7a' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {occupied.map((s) => {
                const { tier, compartment, slot } = parseSlotId(s.id)
                const tc = tierColor[tier as 1 | 2 | 3]
                const tl = tierLabel[tier as 1 | 2 | 3]
                return (
                  <tr
                    key={s.id}
                    onClick={() => onSlotClick(s.id)}
                    className="cursor-pointer transition-all"
                    style={{ borderBottom: '1px solid #0f2030' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
                  >
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider"
                          style={{ background: `${tc}22`, color: tc }}
                        >
                          {tl}
                        </span>
                        <span className="text-xs" style={{ color: '#5a8aaa' }}>
                          {compartment}. Bölme / {slot}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-semibold" style={{ color: '#c8d8e8' }}>
                      {s.pallet!.productName}
                    </td>
                    <td className="py-2.5 pr-4 text-xs" style={{ color: '#4a6a8a' }}>
                      {s.pallet!.productCode || '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-bold tabular-nums" style={{ color: '#10b981' }}>
                      {s.pallet!.quantity}
                      <span className="font-normal text-xs ml-1" style={{ color: '#3a6a5a' }}>
                        {s.pallet!.unit}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs tabular-nums" style={{ color: '#2a4a6a' }}>
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

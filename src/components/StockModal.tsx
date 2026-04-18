'use client'

import { useState, useEffect } from 'react'
import { type ShelfSlot, type Pallet, parseSlotId, TIER_LABELS } from '@/lib/types'

interface Props {
  slot: ShelfSlot | null
  allSlots: Record<string, ShelfSlot>
  onClose: () => void
  onAdd: (slotId: string, pallet: Omit<Pallet, 'id'>) => void
  onRemove: (slotId: string, quantity: number, notes?: string) => void
  onMove: (fromSlotId: string, toSlotId: string) => void
}

type Mode = 'view' | 'add' | 'remove' | 'move'

export default function StockModal({ slot, allSlots, onClose, onAdd, onRemove, onMove }: Props) {
  const [mode, setMode] = useState<Mode>('view')
  const [form, setForm] = useState({
    productName: '',
    productCode: '',
    quantity: '',
    unit: 'adet',
    notes: '',
  })
  const [moveTarget, setMoveTarget] = useState('')
  const [removeNotes, setRemoveNotes] = useState('')
  const [removeQty, setRemoveQty] = useState('')

  useEffect(() => {
    setMode('view')
    setForm({ productName: '', productCode: '', quantity: '', unit: 'adet', notes: '' })
    setMoveTarget('')
    setRemoveNotes('')
    setRemoveQty('')
  }, [slot])

  if (!slot) return null

  const { tier, compartment, slot: slotLetter } = parseSlotId(slot.id)
  const locationLabel = `${TIER_LABELS[tier]} – ${compartment}. Bölme – ${slotLetter} Paleti`
  const occupied = slot.pallet !== null

  const emptySlots = Object.values(allSlots).filter(
    (s) => s.pallet === null && s.id !== slot.id
  )

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.productName || !form.quantity) return
    onAdd(slot!.id, {
      productName: form.productName,
      productCode: form.productCode,
      quantity: Number(form.quantity),
      unit: form.unit,
      entryDate: new Date().toISOString(),
      notes: form.notes || undefined,
    })
    onClose()
  }

  function handleRemove() {
    const qty = Number(removeQty)
    if (!qty || qty <= 0) return
    onRemove(slot!.id, qty, removeNotes || undefined)
    onClose()
  }

  function handleMove() {
    if (!moveTarget) return
    onMove(slot!.id, moveTarget)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 ${occupied ? 'bg-emerald-600' : 'bg-blue-600'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/70 uppercase tracking-wider">
                {occupied ? 'Dolu Palet' : 'Boş Palet'}
              </p>
              <h3 className="text-white font-bold text-base mt-0.5">{locationLabel}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none mt-0.5"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* View mode */}
          {mode === 'view' && (
            <>
              {occupied ? (
                <div className="space-y-2 mb-5">
                  <Row label="Ürün Adı" value={slot.pallet!.productName} />
                  <Row label="Ürün Kodu" value={slot.pallet!.productCode || '—'} />
                  <Row label="Miktar" value={`${slot.pallet!.quantity} ${slot.pallet!.unit}`} />
                  <Row
                    label="Giriş Tarihi"
                    value={new Date(slot.pallet!.entryDate).toLocaleDateString('tr-TR')}
                  />
                  {slot.pallet!.notes && <Row label="Not" value={slot.pallet!.notes} />}
                </div>
              ) : (
                <p className="text-gray-400 text-sm mb-5 text-center py-4">Bu palet boş</p>
              )}

              <div className="flex flex-col gap-2">
                {!occupied && (
                  <button
                    onClick={() => setMode('add')}
                    className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Ürün Ekle (Stok Girişi)
                  </button>
                )}
                {occupied && (
                  <>
                    <button
                      onClick={() => setMode('remove')}
                      className="w-full py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                    >
                      Ürün Çıkart (Stok Çıkışı)
                    </button>
                    <button
                      onClick={() => setMode('move')}
                      className="w-full py-2.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                    >
                      Taşı (Başka Bölmeye)
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition"
                >
                  Kapat
                </button>
              </div>
            </>
          )}

          {/* Add mode */}
          {mode === 'add' && (
            <form onSubmit={handleAdd} className="space-y-3">
              <h4 className="font-semibold text-gray-700 mb-1">Stok Girişi</h4>
              <Field
                label="Ürün Adı *"
                value={form.productName}
                onChange={(v) => setForm((p) => ({ ...p, productName: v }))}
                placeholder="Örn: A4 Kağıt"
                required
              />
              <Field
                label="Ürün Kodu"
                value={form.productCode}
                onChange={(v) => setForm((p) => ({ ...p, productCode: v }))}
                placeholder="Örn: KGT-001"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field
                    label="Miktar *"
                    type="number"
                    value={form.quantity}
                    onChange={(v) => setForm((p) => ({ ...p, quantity: v }))}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Birim</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {['adet', 'kg', 'lt', 'paket', 'koli', 'palet'].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Field
                label="Not"
                value={form.notes}
                onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
                placeholder="İsteğe bağlı not..."
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition"
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          {/* Remove mode */}
          {mode === 'remove' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Stok Çıkışı</h4>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <strong>{slot.pallet!.productName}</strong> — Mevcut:{' '}
                <strong>{slot.pallet!.quantity} {slot.pallet!.unit}</strong>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Çıkarılacak Miktar * (max {slot.pallet!.quantity})
                </label>
                <input
                  type="number"
                  min={1}
                  max={slot.pallet!.quantity}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder={`1 – ${slot.pallet!.quantity}`}
                  value={removeQty}
                  onChange={(e) => setRemoveQty(e.target.value)}
                />
                {removeQty && Number(removeQty) < slot.pallet!.quantity && (
                  <p className="text-xs text-amber-600 mt-1">
                    Çıkıştan sonra kalan: {slot.pallet!.quantity - Number(removeQty)} {slot.pallet!.unit}
                  </p>
                )}
                {removeQty && Number(removeQty) >= slot.pallet!.quantity && (
                  <p className="text-xs text-red-500 mt-1">Tüm stok çıkarılacak, palet boşalacak.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Not (isteğe bağlı)</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Çıkış nedeni..."
                  value={removeNotes}
                  onChange={(e) => setRemoveNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleRemove}
                  disabled={!removeQty || Number(removeQty) <= 0}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-40"
                >
                  Çıkart
                </button>
                <button
                  onClick={() => setMode('view')}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Move mode */}
          {mode === 'move' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Palet Taşı</h4>
              <p className="text-sm text-gray-500">
                <strong>{slot.pallet!.productName}</strong> hangi bölmeye taşınacak?
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hedef Bölme</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={moveTarget}
                  onChange={(e) => setMoveTarget(e.target.value)}
                >
                  <option value="">Seçiniz...</option>
                  {emptySlots.map((s) => {
                    const p = parseSlotId(s.id)
                    return (
                      <option key={s.id} value={s.id}>
                        {TIER_LABELS[p.tier]} – {p.compartment}. Bölme – {p.slot} Paleti
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleMove}
                  disabled={!moveTarget}
                  className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition disabled:opacity-40"
                >
                  Taşı
                </button>
                <button
                  onClick={() => setMode('view')}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? 1 : undefined}
      />
    </div>
  )
}

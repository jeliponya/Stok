'use client'

import { useState, useEffect } from 'react'
import { type ShelfSlot, type Pallet, parseSlotId, TIER_LABELS } from '@/lib/types'

interface Props {
  slot: ShelfSlot | null
  allSlots: Record<string, ShelfSlot>
  onClose: () => void
  onAdd: (slotId: string, pallet: Omit<Pallet, 'id'>) => void
  onAddMore: (slotId: string, quantity: number, notes?: string) => void
  onRemove: (slotId: string, quantity: number, notes?: string) => void
  onMove: (fromSlotId: string, toSlotId: string) => void
}

type Mode = 'view' | 'add' | 'addmore' | 'remove' | 'move'

const inputCls = `
  w-full rounded-lg px-3 py-2 text-sm outline-none transition
  bg-slate-800/60 border border-slate-600/50 text-slate-200
  placeholder-slate-600 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30
`

export default function StockModal({ slot, allSlots, onClose, onAdd, onAddMore, onRemove, onMove }: Props) {
  const [mode, setMode] = useState<Mode>('view')
  const [form, setForm] = useState({ productName: '', productCode: '', quantity: '', unit: 'adet', notes: '' })
  const [moveTarget, setMoveTarget] = useState('')
  const [removeNotes, setRemoveNotes] = useState('')
  const [removeQty, setRemoveQty] = useState('')
  const [moreQty, setMoreQty] = useState('')
  const [moreNotes, setMoreNotes] = useState('')

  useEffect(() => {
    setMode('view')
    setForm({ productName: '', productCode: '', quantity: '', unit: 'adet', notes: '' })
    setMoveTarget('')
    setRemoveNotes('')
    setRemoveQty('')
    setMoreQty('')
    setMoreNotes('')
  }, [slot])

  if (!slot) return null

  const { tier, compartment, slot: slotLetter } = parseSlotId(slot.id)
  const tierShort = tier === 1 ? 'ALT KAT' : tier === 2 ? 'ORTA KAT' : 'ÜST KAT'
  const locationLabel = `${compartment}. Bölme · ${slotLetter} Paleti`
  const occupied = slot.pallet !== null

  const emptySlots = Object.values(allSlots).filter((s) => s.pallet === null && s.id !== slot.id)

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

  function handleAddMore() {
    const qty = Number(moreQty)
    if (!qty || qty <= 0) return
    onAddMore(slot!.id, qty, moreNotes || undefined)
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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0e1e32 0%, #0a1625 100%)',
          border: '1px solid #1a3050',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 relative overflow-hidden"
          style={{
            background: occupied
              ? 'linear-gradient(90deg, #064e3b, #065f46)'
              : 'linear-gradient(90deg, #1e3a5f, #1e4a7a)',
            borderBottom: `1px solid ${occupied ? '#047857' : '#1e4a7a'}`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span
                className="inline-block text-[9px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full mb-1.5"
                style={{
                  background: occupied ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                  color: occupied ? '#6ee7b7' : '#93c5fd',
                }}
              >
                {tierShort}
              </span>
              <h3 className="font-bold text-base" style={{ color: '#e2eaf4' }}>
                {locationLabel}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: occupied ? '#6ee7b7' : '#93c5fd' }}>
                {occupied ? `${slot.pallet!.productName}` : 'Boş palet slotu'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition"
              style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.5)' }}
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
                  <InfoRow label="Ürün Adı" value={slot.pallet!.productName} />
                  <InfoRow label="Ürün Kodu" value={slot.pallet!.productCode || '—'} />
                  <InfoRow
                    label="Mevcut Stok"
                    value={`${slot.pallet!.quantity} ${slot.pallet!.unit}`}
                    highlight
                  />
                  <InfoRow
                    label="Giriş Tarihi"
                    value={new Date(slot.pallet!.entryDate).toLocaleDateString('tr-TR')}
                  />
                  {slot.pallet!.notes && <InfoRow label="Not" value={slot.pallet!.notes} />}
                </div>
              ) : (
                <p className="text-sm text-center py-6 tracking-wide" style={{ color: '#2a4a6a' }}>
                  Bu palet slotu boş
                </p>
              )}

              <div className="flex flex-col gap-2">
                {!occupied && (
                  <ActionButton color="blue" onClick={() => setMode('add')}>
                    + Ürün Ekle (Stok Girişi)
                  </ActionButton>
                )}
                {occupied && (
                  <>
                    <ActionButton color="green" onClick={() => setMode('addmore')}>
                      + Miktar Ekle (İlave Giriş)
                    </ActionButton>
                    <ActionButton color="red" onClick={() => setMode('remove')}>
                      − Ürün Çıkart (Stok Çıkışı)
                    </ActionButton>
                    <ActionButton color="amber" onClick={() => setMode('move')}>
                      ↗ Taşı (Başka Bölmeye)
                    </ActionButton>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#4a6a8a', border: '1px solid #1a3050' }}
                >
                  Kapat
                </button>
              </div>
            </>
          )}

          {/* Add mode */}
          {mode === 'add' && (
            <form onSubmit={handleAdd} className="space-y-3">
              <SectionTitle>Stok Girişi</SectionTitle>
              <Field label="Ürün Adı *" value={form.productName}
                onChange={(v) => setForm((p) => ({ ...p, productName: v }))}
                placeholder="Örn: A4 Kağıt" required />
              <Field label="Ürün Kodu" value={form.productCode}
                onChange={(v) => setForm((p) => ({ ...p, productCode: v }))}
                placeholder="Örn: KGT-001" />
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field label="Miktar *" type="number" value={form.quantity}
                    onChange={(v) => setForm((p) => ({ ...p, quantity: v }))}
                    placeholder="0" required />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium mb-1" style={{ color: '#4a6a8a' }}>Birim</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                    className={inputCls}
                  >
                    {['adet', 'kg', 'lt', 'paket', 'koli', 'palet'].map((u) => (
                      <option key={u} style={{ background: '#0e1e32' }}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Field label="Not" value={form.notes}
                onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
                placeholder="İsteğe bağlı not..." />
              <div className="flex gap-2 pt-1">
                <ActionButton color="blue" type="submit">Kaydet</ActionButton>
                <button type="button" onClick={() => setMode('view')}
                  className="px-4 rounded-lg text-sm font-medium transition"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#4a6a8a', border: '1px solid #1a3050' }}>
                  İptal
                </button>
              </div>
            </form>
          )}

          {/* Add More mode */}
          {mode === 'addmore' && (
            <div className="space-y-3">
              <SectionTitle>İlave Stok Girişi</SectionTitle>
              <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ color: '#6ee7b7' }}>{slot.pallet!.productName}</span>
                <span style={{ color: '#2a5a4a' }}> — Mevcut: </span>
                <span className="font-bold" style={{ color: '#10b981' }}>{slot.pallet!.quantity} {slot.pallet!.unit}</span>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#4a6a8a' }}>
                  Eklenecek Miktar *
                </label>
                <input
                  type="number" min={1}
                  className={inputCls}
                  placeholder="Kaç adet eklenecek?"
                  value={moreQty}
                  onChange={(e) => setMoreQty(e.target.value)}
                />
                {moreQty && Number(moreQty) > 0 && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#10b981' }}>
                    Eklemeden sonra toplam: <strong>{slot.pallet!.quantity + Number(moreQty)} {slot.pallet!.unit}</strong>
                  </p>
                )}
              </div>
              <Field label="Not (isteğe bağlı)" value={moreNotes}
                onChange={setMoreNotes} placeholder="İlave giriş notu..." />
              <div className="flex gap-2 pt-1">
                <ActionButton color="green" onClick={handleAddMore}
                  disabled={!moreQty || Number(moreQty) <= 0}>
                  + Ekle
                </ActionButton>
                <button onClick={() => setMode('view')}
                  className="px-4 rounded-lg text-sm font-medium transition"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#4a6a8a', border: '1px solid #1a3050' }}>
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Remove mode */}
          {mode === 'remove' && (
            <div className="space-y-3">
              <SectionTitle>Stok Çıkışı</SectionTitle>
              <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <span style={{ color: '#fca5a5' }}>{slot.pallet!.productName}</span>
                <span style={{ color: '#6a3a3a' }}> — Mevcut: </span>
                <span className="font-bold" style={{ color: '#f87171' }}>{slot.pallet!.quantity} {slot.pallet!.unit}</span>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#4a6a8a' }}>
                  Çıkarılacak Miktar * (maks. {slot.pallet!.quantity})
                </label>
                <input
                  type="number" min={1} max={slot.pallet!.quantity}
                  className={inputCls}
                  style={{ borderColor: removeQty && Number(removeQty) >= slot.pallet!.quantity ? 'rgba(239,68,68,0.5)' : undefined }}
                  placeholder={`1 – ${slot.pallet!.quantity}`}
                  value={removeQty}
                  onChange={(e) => setRemoveQty(e.target.value)}
                />
                {removeQty && Number(removeQty) > 0 && Number(removeQty) < slot.pallet!.quantity && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#f59e0b' }}>
                    Çıkıştan sonra kalan: <strong>{slot.pallet!.quantity - Number(removeQty)} {slot.pallet!.unit}</strong>
                  </p>
                )}
                {removeQty && Number(removeQty) >= slot.pallet!.quantity && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#ef4444' }}>
                    Tüm stok çıkarılacak, palet boşalacak.
                  </p>
                )}
              </div>
              <Field label="Not (isteğe bağlı)" value={removeNotes}
                onChange={setRemoveNotes} placeholder="Çıkış nedeni..." />
              <div className="flex gap-2 pt-1">
                <ActionButton color="red" onClick={handleRemove}
                  disabled={!removeQty || Number(removeQty) <= 0}>
                  Çıkart
                </ActionButton>
                <button onClick={() => setMode('view')}
                  className="px-4 rounded-lg text-sm font-medium transition"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#4a6a8a', border: '1px solid #1a3050' }}>
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Move mode */}
          {mode === 'move' && (
            <div className="space-y-3">
              <SectionTitle>Palet Taşı</SectionTitle>
              <p className="text-sm" style={{ color: '#4a7aaa' }}>
                <strong style={{ color: '#c8d8e8' }}>{slot.pallet!.productName}</strong> hangi slota taşınacak?
              </p>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#4a6a8a' }}>Hedef Slot</label>
                <select
                  className={inputCls}
                  value={moveTarget}
                  onChange={(e) => setMoveTarget(e.target.value)}
                >
                  <option value="" style={{ background: '#0e1e32' }}>Seçiniz...</option>
                  {emptySlots.map((s) => {
                    const p = parseSlotId(s.id)
                    const t = p.tier === 1 ? 'Alt Kat' : p.tier === 2 ? 'Orta Kat' : 'Üst Kat'
                    return (
                      <option key={s.id} value={s.id} style={{ background: '#0e1e32' }}>
                        {t} – {p.compartment}. Bölme – {p.slot} Paleti
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <ActionButton color="amber" onClick={handleMove} disabled={!moveTarget}>
                  ↗ Taşı
                </ActionButton>
                <button onClick={() => setMode('view')}
                  className="px-4 rounded-lg text-sm font-medium transition"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#4a6a8a', border: '1px solid #1a3050' }}>
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

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid #0f2030' }}>
      <span className="text-xs" style={{ color: '#3a5a7a' }}>{label}</span>
      <span
        className="text-sm font-medium text-right max-w-[60%]"
        style={{ color: highlight ? '#10b981' : '#c8d8e8' }}
      >
        {value}
      </span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#4a6a8a' }}>
      {children}
    </h4>
  )
}

function ActionButton({
  children, color, onClick, type = 'button', disabled,
}: {
  children: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'amber'
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const styles = {
    blue:  { bg: 'linear-gradient(135deg, #1d4ed8, #2563eb)', border: '#3b82f6', shadow: 'rgba(59,130,246,0.3)' },
    green: { bg: 'linear-gradient(135deg, #047857, #059669)', border: '#10b981', shadow: 'rgba(16,185,129,0.35)' },
    red:   { bg: 'linear-gradient(135deg, #b91c1c, #dc2626)', border: '#ef4444', shadow: 'rgba(239,68,68,0.3)'  },
    amber: { bg: 'linear-gradient(135deg, #b45309, #d97706)', border: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
  }
  const s = styles[color]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        boxShadow: `0 4px 12px ${s.shadow}`,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text', required,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#4a6a8a' }}>{label}</label>
      <input
        type={type}
        className={`
          w-full rounded-lg px-3 py-2 text-sm outline-none transition
          bg-slate-800/60 border border-slate-600/50 text-slate-200
          placeholder-slate-600 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30
        `}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? 1 : undefined}
      />
    </div>
  )
}

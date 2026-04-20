'use client'

import { type Transaction, parseSlotId, TIER_LABELS } from '@/lib/types'

interface Props {
  transactions: Transaction[]
}

const TYPE_CONFIG = {
  IN:   { label: 'GİRİŞ',   bg: 'rgba(16,185,129,0.15)', color: '#10b981', dot: '#10b981' },
  OUT:  { label: 'ÇIKIŞ',   bg: 'rgba(239,68,68,0.15)',  color: '#f87171', dot: '#ef4444' },
  MOVE: { label: 'TAŞIMA',  bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', dot: '#f59e0b' },
}

function slotLabel(id: string) {
  try {
    const { tier, compartment, slot } = parseSlotId(id)
    const t = tier === 1 ? 'Alt' : tier === 2 ? 'Orta' : 'Üst'
    return `${t} · ${compartment}. Bölme / ${slot}`
  } catch {
    return id
  }
}

export default function TransactionLog({ transactions }: Props) {
  const recent = transactions.slice(0, 50)

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(160deg, #0d1b2e, #0a1520)',
        border: '1px solid #1a2f45',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase">İşlem Geçmişi</h2>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-full"
          style={{ background: 'rgba(100,150,210,0.12)', color: '#6496c8' }}
        >
          {transactions.length} işlem
        </span>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-slate-600 text-center py-10 tracking-wide">Henüz işlem yok</p>
      ) : (
        <div className="space-y-1">
          {recent.map((tx) => {
            const cfg = TYPE_CONFIG[tx.type]
            return (
              <div
                key={tx.id}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{ borderLeft: `2px solid ${cfg.dot}22` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '' }}
              >
                {/* Type badge */}
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap mt-0.5 tracking-wider"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#c8d8e8' }}>
                    {tx.productName}
                    {tx.productCode && (
                      <span className="font-normal ml-1.5 text-xs" style={{ color: '#4a6a8a' }}>
                        {tx.productCode}
                      </span>
                    )}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#3a5a7a' }}>
                    <span style={{ color: '#5a8aaa' }}>{tx.quantity} {tx.unit}</span>
                    {' · '}
                    {tx.type === 'MOVE' ? (
                      <>{slotLabel(tx.slotId)} <span style={{ color: '#4a7aaa' }}>→</span> {slotLabel(tx.toSlotId!)}</>
                    ) : (
                      slotLabel(tx.slotId)
                    )}
                  </p>
                  {tx.notes && (
                    <p className="text-xs mt-0.5 italic truncate" style={{ color: '#2a4a6a' }}>{tx.notes}</p>
                  )}
                </div>

                <span className="text-[10px] whitespace-nowrap tabular-nums" style={{ color: '#2a4a6a' }}>
                  {new Date(tx.date).toLocaleString('tr-TR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

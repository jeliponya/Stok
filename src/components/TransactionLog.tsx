'use client'

import { type Transaction, parseSlotId, TIER_LABELS } from '@/lib/types'

interface Props {
  transactions: Transaction[]
}

const TYPE_CONFIG = {
  IN: { label: 'GİRİŞ', bg: 'bg-emerald-100 text-emerald-700' },
  OUT: { label: 'ÇIKIŞ', bg: 'bg-red-100 text-red-700' },
  MOVE: { label: 'TAŞIMA', bg: 'bg-amber-100 text-amber-700' },
}

function slotLabel(id: string) {
  try {
    const { tier, compartment, slot } = parseSlotId(id)
    return `${TIER_LABELS[tier].split('(')[1].replace(')', '')} – ${compartment}. Bölme / ${slot}`
  } catch {
    return id
  }
}

export default function TransactionLog({ transactions }: Props) {
  const recent = transactions.slice(0, 50)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-700">İşlem Geçmişi</h2>
        <span className="text-xs text-gray-400">{transactions.length} işlem</span>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Henüz işlem yok</p>
      ) : (
        <div className="space-y-2">
          {recent.map((tx) => {
            const cfg = TYPE_CONFIG[tx.type]
            return (
              <div
                key={tx.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap mt-0.5 ${cfg.bg}`}
                >
                  {cfg.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {tx.productName}
                    {tx.productCode ? (
                      <span className="text-gray-400 font-normal ml-1">({tx.productCode})</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tx.quantity} {tx.unit}
                    {' · '}
                    {tx.type === 'MOVE' ? (
                      <>
                        {slotLabel(tx.slotId)} → {slotLabel(tx.toSlotId!)}
                      </>
                    ) : (
                      slotLabel(tx.slotId)
                    )}
                  </p>
                  {tx.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 italic truncate">{tx.notes}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {new Date(tx.date).toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
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

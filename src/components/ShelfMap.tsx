'use client'

import { type ShelfSlot, type Tier, type Compartment, type SlotLetter, makeSlotId } from '@/lib/types'

interface Props {
  slots: Record<string, ShelfSlot>
  onSlotClick: (slotId: string) => void
}

const TIER_LABELS = ['3. KAT (ÜST)', '2. KAT (ORTA)', '1. KAT (ALT)']
const TIERS: Tier[] = [3, 2, 1]

function SlotCell({
  slot,
  onClick,
}: {
  slot: ShelfSlot
  onClick: () => void
}) {
  const occupied = slot.pallet !== null
  return (
    <button
      onClick={onClick}
      title={
        occupied
          ? `${slot.pallet!.productCode} – ${slot.pallet!.productName}\n${slot.pallet!.quantity} ${slot.pallet!.unit}`
          : 'Boş – tıkla ekle'
      }
      className={`
        relative flex flex-col items-center justify-center rounded border-2 transition-all
        w-full aspect-square text-xs font-semibold select-none cursor-pointer
        ${
          occupied
            ? 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200'
            : 'bg-gray-50 border-dashed border-gray-300 text-gray-400 hover:bg-blue-50 hover:border-blue-300'
        }
      `}
    >
      <span className="text-[10px] font-bold opacity-60 absolute top-0.5 left-1">
        {slot.slot}
      </span>
      {occupied ? (
        <>
          <span className="text-[9px] leading-tight text-center px-0.5 mt-2 break-all line-clamp-2">
            {slot.pallet!.productCode}
          </span>
          <span className="text-[8px] leading-tight text-center px-0.5 opacity-70 break-all line-clamp-1">
            {slot.pallet!.quantity} {slot.pallet!.unit}
          </span>
        </>
      ) : (
        <span className="text-lg mt-1">+</span>
      )}
    </button>
  )
}

export default function ShelfMap({ slots, onSlotClick }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Raf Haritası</h2>

      {/* Column headers */}
      <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
        <div />
        {([1, 2, 3, 4, 5, 6] as Compartment[]).map((c) => (
          <div key={c} className="text-center text-xs font-bold text-gray-500">
            {c}. Bölme
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {TIERS.map((tier, ti) => (
          <div key={tier} className="flex flex-col gap-1">
            {/* Tier label */}
            <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 items-center">
              <div className="text-[10px] font-bold text-gray-500 text-right pr-2 leading-tight">
                {TIER_LABELS[ti]}
              </div>
              {([1, 2, 3, 4, 5, 6] as Compartment[]).map((compartment) => (
                <div key={compartment} className="grid grid-cols-2 gap-0.5">
                  {(['A', 'B'] as SlotLetter[]).map((s) => {
                    const id = makeSlotId(tier, compartment, s)
                    return (
                      <SlotCell
                        key={id}
                        slot={slots[id]}
                        onClick={() => onSlotClick(id)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-4 h-4 rounded bg-emerald-100 border-2 border-emerald-400" />
          Dolu
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-4 h-4 rounded bg-gray-50 border-2 border-dashed border-gray-300" />
          Boş
        </div>
        <div className="ml-auto text-xs text-gray-400">
          Her bölmede 2 palet (A/B)
        </div>
      </div>
    </div>
  )
}

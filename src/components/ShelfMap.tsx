'use client'

import { type ShelfSlot, type Tier, type Compartment, type SlotLetter, makeSlotId } from '@/lib/types'

interface Props {
  slots: Record<string, ShelfSlot>
  onSlotClick: (slotId: string) => void
}

const TIERS: Tier[] = [3, 2, 1]
const TIER_LABEL: Record<Tier, string> = { 3: 'ÜST KAT', 2: 'ORTA KAT', 1: 'ALT KAT' }

function PalletBox({ slot, onClick }: { slot: ShelfSlot; onClick: () => void }) {
  const occ = slot.pallet !== null

  return (
    <button
      onClick={onClick}
      title={
        occ
          ? `${slot.pallet!.productName}${slot.pallet!.productCode ? ' (' + slot.pallet!.productCode + ')' : ''}\n${slot.pallet!.quantity} ${slot.pallet!.unit}`
          : 'Boş – tıkla ekle'
      }
      style={{
        /* 3-D box illusion via layered box-shadow */
        boxShadow: occ
          ? '2px 2px 0 0 #065f46, 4px 4px 0 0 #047857, 0 6px 16px rgba(0,0,0,0.45)'
          : '1px 1px 0 0 #1e3550, 2px 2px 0 0 #162030, 0 2px 6px rgba(0,0,0,0.3)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        if (occ) {
          el.style.transform = 'translate(-2px,-4px)'
          el.style.boxShadow = '4px 6px 0 0 #065f46, 6px 8px 0 0 #047857, 0 12px 24px rgba(0,0,0,0.55)'
        } else {
          el.style.transform = 'translate(-1px,-2px)'
          el.style.boxShadow = '2px 3px 0 0 #1e3a5c, 3px 4px 0 0 #0d2035, 0 6px 12px rgba(0,0,0,0.4)'
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = occ
          ? '2px 2px 0 0 #065f46, 4px 4px 0 0 #047857, 0 6px 16px rgba(0,0,0,0.45)'
          : '1px 1px 0 0 #1e3550, 2px 2px 0 0 #162030, 0 2px 6px rgba(0,0,0,0.3)'
      }}
      className={`
        relative w-full aspect-square rounded-sm overflow-hidden
        flex flex-col items-center justify-center cursor-pointer select-none
        ${occ
          ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 border border-emerald-300/40'
          : 'bg-gradient-to-b from-slate-700 to-slate-800 border border-dashed border-slate-500/60'
        }
      `}
    >
      {/* Pallet wood slat lines */}
      {occ && (
        <>
          <div className="absolute inset-x-0 top-[33%] h-px bg-white/10 pointer-events-none" />
          <div className="absolute inset-x-0 top-[66%] h-px bg-white/10 pointer-events-none" />
          <div className="absolute inset-y-0 left-[33%] w-px bg-white/10 pointer-events-none" />
          <div className="absolute inset-y-0 left-[66%] w-px bg-white/10 pointer-events-none" />
          {/* top highlight */}
          <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        </>
      )}

      {/* Slot letter */}
      <span className={`absolute top-0.5 left-1 text-[8px] font-bold ${occ ? 'text-white/60' : 'text-slate-500'}`}>
        {slot.slot}
      </span>

      {occ ? (
        <>
          <span className="text-[8px] font-bold text-white leading-tight text-center px-0.5 mt-1 line-clamp-2 z-10">
            {slot.pallet!.productCode || slot.pallet!.productName.slice(0, 8)}
          </span>
          <span className="text-[7px] text-emerald-100/90 mt-0.5 z-10 font-semibold">
            {slot.pallet!.quantity} {slot.pallet!.unit.slice(0, 3)}
          </span>
        </>
      ) : (
        <span className="text-slate-500 text-lg leading-none mt-1">+</span>
      )}
    </button>
  )
}

export default function ShelfMap({ slots, onSlotClick }: Props) {
  const totalOcc = Object.values(slots).filter((s) => s.pallet).length

  return (
    <div
      className="rounded-2xl p-5 md:p-7"
      style={{
        background: 'linear-gradient(160deg, #0d1b2e 0%, #0a1520 100%)',
        border: '1px solid #1a2f45',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1">Depo Raf Haritası</h2>
          <p className="text-slate-400 text-sm">
            <span className="text-emerald-400 font-bold">{totalOcc}</span>
            <span className="text-slate-600"> / 36 palet dolu</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-b from-emerald-400 to-emerald-600 inline-block" />
            Dolu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-700 border border-dashed border-slate-500 inline-block" />
            Boş
          </span>
        </div>
      </div>

      {/* 3-D perspective wrapper */}
      <div style={{ perspective: '1600px' }}>
        <div
          style={{
            transform: 'rotateX(14deg)',
            transformOrigin: '50% 100%',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Shelf cabinet */}
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #111e2e 0%, #0c1622 100%)',
              border: '2px solid #1a3050',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 30px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Left structural beam */}
            <div
              className="absolute left-0 inset-y-0 w-7 z-10"
              style={{
                background: 'linear-gradient(90deg, #060e18 0%, #152238 60%, #0c1926 100%)',
                borderRight: '1px solid #0a1826',
              }}
            >
              {/* Bolt holes */}
              {[15, 35, 55, 75].map((pct) => (
                <div
                  key={pct}
                  className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ top: `${pct}%`, background: '#0a1420', border: '1px solid #1e3450', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}
                />
              ))}
            </div>

            {/* Right structural beam */}
            <div
              className="absolute right-0 inset-y-0 w-7 z-10"
              style={{
                background: 'linear-gradient(270deg, #060e18 0%, #152238 60%, #0c1926 100%)',
                borderLeft: '1px solid #0a1826',
              }}
            >
              {[15, 35, 55, 75].map((pct) => (
                <div
                  key={pct}
                  className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ top: `${pct}%`, background: '#0a1420', border: '1px solid #1e3450', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}
                />
              ))}
            </div>

            <div className="px-9">
              {/* Compartment number header */}
              <div className="grid grid-cols-6 gap-2 pt-3 pb-1">
                {([1, 2, 3, 4, 5, 6] as Compartment[]).map((c) => (
                  <div key={c} className="text-center text-[9px] font-bold text-slate-600 tracking-wider">
                    {c}. BÖLME
                  </div>
                ))}
              </div>

              {TIERS.map((tier) => (
                <div key={tier}>
                  {/* Shelf board */}
                  <div
                    className="mx-[-36px] relative"
                    style={{
                      height: '22px',
                      background: 'linear-gradient(180deg, #4a7aaa 0%, #2a567e 25%, #1a3a5a 60%, #0e2035 100%)',
                      borderTop: '1px solid #5a8ab8',
                      borderBottom: '3px solid #08131e',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 10px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Tier label */}
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tracking-[0.2em] uppercase"
                      style={{ color: 'rgba(180,210,240,0.5)' }}
                    >
                      {TIER_LABEL[tier]}
                    </span>
                    {/* Rivet bolts on board */}
                    {[8, 22, 36, 50, 64, 78, 92].map((pct) => (
                      <div
                        key={pct}
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                        style={{ left: `${pct}%`, background: '#1e4060', border: '1px solid #3a6080', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)' }}
                      />
                    ))}
                  </div>

                  {/* Pallet row */}
                  <div className="grid grid-cols-6 gap-2 py-2.5">
                    {([1, 2, 3, 4, 5, 6] as Compartment[]).map((compartment) => (
                      <div key={compartment} className="grid grid-cols-2 gap-0.5">
                        {(['A', 'B'] as SlotLetter[]).map((s) => {
                          const id = makeSlotId(tier, compartment, s)
                          return (
                            <PalletBox
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

              {/* Floor plate */}
              <div
                className="mx-[-36px]"
                style={{
                  height: '14px',
                  background: 'linear-gradient(180deg, #1a3050 0%, #0a1828 100%)',
                  borderTop: '2px solid #3a6080',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              />
            </div>
          </div>

          {/* Cabinet shadow / base depth */}
          <div
            style={{
              height: '18px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
              marginTop: '-2px',
              transform: 'scaleY(0.4) translateY(100%)',
              filter: 'blur(6px)',
            }}
          />
        </div>
      </div>

      {/* Footer hint */}
      <p className="text-center text-[10px] text-slate-700 mt-5 tracking-wider">
        Herhangi bir paleti tıklayarak stok ekle / çıkar / taşı
      </p>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import ShelfMap from '@/components/ShelfMap'
import StockModal from '@/components/StockModal'
import TransactionLog from '@/components/TransactionLog'
import InventoryTable from '@/components/InventoryTable'

type Tab = 'shelf' | 'inventory' | 'log'

export default function Home() {
  const { slots, transactions, hydrated, addStock, addMoreStock, removeStock, moveStock, stats } = useInventory()
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('shelf')

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-500 text-sm tracking-widest animate-pulse">YÜKLENİYOR...</div>
      </div>
    )
  }

  const selectedSlot = selectedSlotId ? slots[selectedSlotId] : null
  const fillPct = Math.round((stats.occupiedSlots / stats.totalSlots) * 100)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #070e18 0%, #0b1525 100%)' }}>
      {/* Header */}
      <header
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #0d1f38 0%, #0f2040 50%, #0d1f38 100%)',
          borderBottom: '1px solid #1a3050',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(100,180,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(100,180,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: 'linear-gradient(135deg, #1e4a80, #0d2a50)', border: '1px solid #2a5a90', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                >
                  📦
                </div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: '#e2eaf4' }}>
                  Depo Stok Takip
                </h1>
              </div>
              <p className="text-[11px] tracking-widest font-medium" style={{ color: '#4a7aaa' }}>
                3 KAT · 6 BÖLME · 2 PALET/BÖLME · 36 TOPLAM SLOT
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <StatPill label="Toplam" value={stats.totalSlots} color="#4a7aaa" />
              <StatPill label="Dolu" value={stats.occupiedSlots} color="#10b981" />
              <StatPill label="Boş" value={stats.emptySlots} color="#6b7280" />
              {/* Fill bar */}
              <div className="hidden sm:flex flex-col gap-1 ml-2">
                <div className="text-[9px] text-slate-500 text-right font-bold tracking-wider">
                  DOLULUK %{fillPct}
                </div>
                <div className="w-28 h-2 rounded-full overflow-hidden" style={{ background: '#0a1525' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${fillPct}%`,
                      background: fillPct > 80
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : fillPct > 50
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(10,18,30,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1a2f45',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            <TabButton active={activeTab === 'shelf'} onClick={() => setActiveTab('shelf')}>
              🏗 Raf Haritası
            </TabButton>
            <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
              📋 Anlık Stok
              {stats.occupiedSlots > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                  {stats.occupiedSlots}
                </span>
              )}
            </TabButton>
            <TabButton active={activeTab === 'log'} onClick={() => setActiveTab('log')}>
              📜 İşlem Geçmişi
              {transactions.length > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(100,130,180,0.2)', color: '#6496c8' }}>
                  {transactions.length}
                </span>
              )}
            </TabButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'shelf' && <ShelfMap slots={slots} onSlotClick={setSelectedSlotId} />}
        {activeTab === 'inventory' && <InventoryTable slots={slots} onSlotClick={setSelectedSlotId} />}
        {activeTab === 'log' && <TransactionLog transactions={transactions} />}
      </main>

      {/* Modal */}
      {selectedSlot && (
        <StockModal
          slot={selectedSlot}
          allSlots={slots}
          onClose={() => setSelectedSlotId(null)}
          onAdd={addStock}
          onAddMore={addMoreStock}
          onRemove={removeStock}
          onMove={moveStock}
        />
      )}
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="flex flex-col items-center px-3 py-1.5 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span className="text-xl font-bold leading-none" style={{ color }}>{value}</span>
      <span className="text-[9px] mt-0.5 font-semibold tracking-wider" style={{ color: '#4a6a8a' }}>{label.toUpperCase()}</span>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium transition-all border-b-2"
      style={{
        color: active ? '#60a5fa' : '#4a6a8a',
        borderBottomColor: active ? '#3b82f6' : 'transparent',
        background: active ? 'rgba(59,130,246,0.06)' : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

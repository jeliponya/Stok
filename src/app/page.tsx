'use client'

import { useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import ShelfMap from '@/components/ShelfMap'
import StockModal from '@/components/StockModal'
import TransactionLog from '@/components/TransactionLog'
import InventoryTable from '@/components/InventoryTable'

type Tab = 'shelf' | 'inventory' | 'log'

export default function Home() {
  const { slots, transactions, hydrated, addStock, removeStock, moveStock, stats } = useInventory()
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('shelf')

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Yükleniyor...</div>
      </div>
    )
  }

  const selectedSlot = selectedSlotId ? slots[selectedSlotId] : null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Depo Stok Takip</h1>
              <p className="text-blue-200 text-xs mt-0.5">3 Katlı Raf · 6 Bölme · 2 Palet/Bölme</p>
            </div>
            <div className="flex gap-3">
              <StatCard label="Toplam" value={stats.totalSlots} color="blue" />
              <StatCard label="Dolu" value={stats.occupiedSlots} color="green" />
              <StatCard label="Boş" value={stats.emptySlots} color="gray" />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            <TabButton active={activeTab === 'shelf'} onClick={() => setActiveTab('shelf')}>
              Raf Haritası
            </TabButton>
            <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
              Anlık Stok
              {stats.occupiedSlots > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                  {stats.occupiedSlots}
                </span>
              )}
            </TabButton>
            <TabButton active={activeTab === 'log'} onClick={() => setActiveTab('log')}>
              İşlem Geçmişi
              {transactions.length > 0 && (
                <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                  {transactions.length}
                </span>
              )}
            </TabButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'shelf' && (
          <ShelfMap slots={slots} onSlotClick={setSelectedSlotId} />
        )}
        {activeTab === 'inventory' && (
          <InventoryTable slots={slots} onSlotClick={setSelectedSlotId} />
        )}
        {activeTab === 'log' && (
          <TransactionLog transactions={transactions} />
        )}
      </main>

      {/* Modal */}
      {selectedSlot && (
        <StockModal
          slot={selectedSlot}
          allSlots={slots}
          onClose={() => setSelectedSlotId(null)}
          onAdd={addStock}
          onRemove={removeStock}
          onMove={moveStock}
        />
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'blue' | 'green' | 'gray'
}) {
  const colors = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-emerald-500 text-white',
    gray: 'bg-blue-800 text-blue-200',
  }
  return (
    <div className={`rounded-lg px-3 py-1.5 text-center ${colors[color]}`}>
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

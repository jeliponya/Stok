'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  type Tier,
  type Compartment,
  type SlotLetter,
  type ShelfSlot,
  type Pallet,
  type Transaction,
  makeSlotId,
} from '@/lib/types'

const SLOTS_KEY = 'stok_slots'
const TX_KEY = 'stok_transactions'

function buildInitialSlots(): Record<string, ShelfSlot> {
  const slots: Record<string, ShelfSlot> = {}
  for (let t = 1; t <= 3; t++) {
    for (let c = 1; c <= 6; c++) {
      for (const s of ['A', 'B'] as SlotLetter[]) {
        const id = makeSlotId(t as Tier, c as Compartment, s)
        slots[id] = { id, tier: t as Tier, compartment: c as Compartment, slot: s, pallet: null }
      }
    }
  }
  return slots
}

export function useInventory() {
  const [slots, setSlots] = useState<Record<string, ShelfSlot>>(buildInitialSlots)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const rawSlots = localStorage.getItem(SLOTS_KEY)
    const rawTx = localStorage.getItem(TX_KEY)
    if (rawSlots) setSlots(JSON.parse(rawSlots))
    if (rawTx) setTransactions(JSON.parse(rawTx))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
  }, [slots, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(TX_KEY, JSON.stringify(transactions))
  }, [transactions, hydrated])

  const addStock = useCallback(
    (slotId: string, palletData: Omit<Pallet, 'id'>) => {
      const pallet: Pallet = { ...palletData, id: crypto.randomUUID() }
      setSlots((prev) => ({
        ...prev,
        [slotId]: { ...prev[slotId], pallet },
      }))
      const tx: Transaction = {
        id: crypto.randomUUID(),
        type: 'IN',
        productName: pallet.productName,
        productCode: pallet.productCode,
        quantity: pallet.quantity,
        unit: pallet.unit,
        slotId,
        date: new Date().toISOString(),
        notes: pallet.notes,
      }
      setTransactions((prev) => [tx, ...prev])
    },
    []
  )

  const addMoreStock = useCallback(
    (slotId: string, quantity: number, notes?: string) => {
      const pallet = slots[slotId]?.pallet
      if (!pallet) return
      setSlots((prev) => ({
        ...prev,
        [slotId]: { ...prev[slotId], pallet: { ...pallet, quantity: pallet.quantity + quantity } },
      }))
      const tx: Transaction = {
        id: crypto.randomUUID(),
        type: 'IN',
        productName: pallet.productName,
        productCode: pallet.productCode,
        quantity,
        unit: pallet.unit,
        slotId,
        date: new Date().toISOString(),
        notes,
      }
      setTransactions((prev) => [tx, ...prev])
    },
    [slots]
  )

  const removeStock = useCallback(
    (slotId: string, quantity: number, notes?: string) => {
      const pallet = slots[slotId]?.pallet
      if (!pallet) return
      const remaining = pallet.quantity - quantity
      setSlots((prev) => ({
        ...prev,
        [slotId]: {
          ...prev[slotId],
          pallet: remaining > 0 ? { ...pallet, quantity: remaining } : null,
        },
      }))
      const tx: Transaction = {
        id: crypto.randomUUID(),
        type: 'OUT',
        productName: pallet.productName,
        productCode: pallet.productCode,
        quantity,
        unit: pallet.unit,
        slotId,
        date: new Date().toISOString(),
        notes,
      }
      setTransactions((prev) => [tx, ...prev])
    },
    [slots]
  )

  const moveStock = useCallback(
    (fromSlotId: string, toSlotId: string) => {
      const pallet = slots[fromSlotId]?.pallet
      if (!pallet) return
      if (slots[toSlotId]?.pallet) return
      setSlots((prev) => ({
        ...prev,
        [fromSlotId]: { ...prev[fromSlotId], pallet: null },
        [toSlotId]: { ...prev[toSlotId], pallet },
      }))
      const tx: Transaction = {
        id: crypto.randomUUID(),
        type: 'MOVE',
        productName: pallet.productName,
        productCode: pallet.productCode,
        quantity: pallet.quantity,
        unit: pallet.unit,
        slotId: fromSlotId,
        toSlotId,
        date: new Date().toISOString(),
      }
      setTransactions((prev) => [tx, ...prev])
    },
    [slots]
  )

  const totalSlots = 36
  const occupiedSlots = Object.values(slots).filter((s) => s.pallet !== null).length
  const emptySlots = totalSlots - occupiedSlots

  return {
    slots,
    transactions,
    hydrated,
    addStock,
    addMoreStock,
    removeStock,
    moveStock,
    stats: { totalSlots, occupiedSlots, emptySlots },
  }
}

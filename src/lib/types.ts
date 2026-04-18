export type Tier = 1 | 2 | 3
export type Compartment = 1 | 2 | 3 | 4 | 5 | 6
export type SlotLetter = 'A' | 'B'

export interface Pallet {
  id: string
  productName: string
  productCode: string
  quantity: number
  unit: string
  entryDate: string
  notes?: string
}

export interface ShelfSlot {
  id: string // "T1-C3-A"
  tier: Tier
  compartment: Compartment
  slot: SlotLetter
  pallet: Pallet | null
}

export type TransactionType = 'IN' | 'OUT' | 'MOVE'

export interface Transaction {
  id: string
  type: TransactionType
  productName: string
  productCode: string
  quantity: number
  unit: string
  slotId: string
  toSlotId?: string
  date: string
  notes?: string
}

export function makeSlotId(tier: Tier, compartment: Compartment, slot: SlotLetter): string {
  return `T${tier}-C${compartment}-${slot}`
}

export function parseSlotId(id: string): { tier: Tier; compartment: Compartment; slot: SlotLetter } {
  const m = id.match(/^T(\d)-C(\d)-([AB])$/)
  if (!m) throw new Error(`Invalid slot id: ${id}`)
  return {
    tier: Number(m[1]) as Tier,
    compartment: Number(m[2]) as Compartment,
    slot: m[3] as SlotLetter,
  }
}

export const TIER_LABELS: Record<Tier, string> = {
  1: 'Alt Raf (1. Kat)',
  2: 'Orta Raf (2. Kat)',
  3: 'Üst Raf (3. Kat)',
}

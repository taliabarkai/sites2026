'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export interface SelectedOption {
  label: string
  value: string
}

export interface GiftPackaging {
  type: 'classic' | 'personalized'
  giftNote?: string
  selectedDesign?: string
  recipientName?: string
  price: number
  originalPrice?: number
}

export interface CanvasConfig {
  productId: number
  photo: string      // original uploaded photo as a data URL (survives navigation)
  photoName: string
  frameKey: string
  sizeKey: string
  persOn: boolean
  line1: string
  line2: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  isPersonalized: boolean
  selectedOptions?: SelectedOption[]
  giftPackaging?: GiftPackaging
  canvasConfig?: CanvasConfig   // LAL custom canvas — lets the PDP restore the preview
  isCompanion?: boolean         // added as a nested/companion product (not a standalone main item)
  warranty?: boolean            // 5-year protection plan selected for this item
}

/** Flat price of the optional 5-year protection plan (cents). */
export const WARRANTY_CENTS = 1500

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  /** True when the cart was opened by adding an item (shows the "Successfully added" line). */
  justAdded: boolean
  subtotal: number
  openCart: (added?: boolean) => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateGiftPackaging: (id: string, gift: GiftPackaging | undefined) => void
  /** Toggle the 5-year protection plan for a cart item. */
  toggleWarranty: (id: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'tg_cart_items'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const saved = loadCart()
    if (saved.length > 0) setItems(saved)
  }, [])

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch { /* ignore quota errors */ }
  }, [items])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => [...prev, item])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateGiftPackaging = useCallback((id: string, gift: GiftPackaging | undefined) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, giftPackaging: gift } : item))
  }, [])

  const toggleWarranty = useCallback((id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, warranty: !item.warranty } : item))
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.price + (item.warranty ? WARRANTY_CENTS : 0), 0)

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      justAdded,
      subtotal,
      openCart: (added = false) => { setIsOpen(true); setJustAdded(added) },
      closeCart: () => { setIsOpen(false); setJustAdded(false) },
      addItem,
      removeItem,
      updateGiftPackaging,
      toggleWarranty,
    }}>
      {children}
    </CartContext.Provider>
  )
}

const CART_NOOP: CartContextValue = {
  items: [],
  isOpen: false,
  justAdded: false,
  subtotal: 0,
  openCart: () => {},
  closeCart: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateGiftPackaging: () => {},
  toggleWarranty: () => {},
}

export function useCart() {
  return useContext(CartContext) ?? CART_NOOP
}

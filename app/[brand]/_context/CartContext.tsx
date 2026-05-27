'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

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

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  isPersonalized: boolean
  selectedOptions?: SelectedOption[]
  giftPackaging?: GiftPackaging
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  subtotal: number
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateGiftPackaging: (id: string, gift: GiftPackaging | undefined) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const DEFAULT_ITEMS: CartItem[] = [
  {
    id: 'interlace-earrings-gold-vermeil',
    name: 'Interlace Earrings - Gold Vermeil',
    price: 17400,
    originalPrice: 20500,
    image: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-12.jpg',
    isPersonalized: false,
  },
  {
    id: 'classic-scalloped-hoop-gold-vermeil',
    name: 'Classic Scalloped Hoop - Gold Vermeil',
    price: 13500,
    image: 'https://cdn.oakandluna.com/digital-asset/product/engraved-comprass-necklace-gold-vermeil-1.jpg',
    isPersonalized: true,
    selectedOptions: [
      { label: 'Material', value: 'Gold Vermeil' },
      { label: 'Choose your style', value: 'Classic' },
    ],
  },
]

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(DEFAULT_ITEMS)
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => [...prev, item])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateGiftPackaging = useCallback((id: string, gift: GiftPackaging | undefined) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, giftPackaging: gift } : item))
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      subtotal,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      updateGiftPackaging,
    }}>
      {children}
    </CartContext.Provider>
  )
}

const CART_NOOP: CartContextValue = {
  items: [],
  isOpen: false,
  subtotal: 0,
  openCart: () => {},
  closeCart: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateGiftPackaging: () => {},
}

export function useCart() {
  return useContext(CartContext) ?? CART_NOOP
}

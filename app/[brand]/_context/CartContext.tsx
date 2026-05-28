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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
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

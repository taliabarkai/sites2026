'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

export interface SelectedOption {
  label: string
  value: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  isPersonalized: boolean
  selectedOptions?: SelectedOption[]
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  subtotal: number
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const DEFAULT_ITEMS: CartItem[] = [
  {
    id: 'statement-one-carat-diamond-necklace-gold',
    name: 'The Statement One Carat Diamond Necklace - Gold Vermeil',
    price: 55000,
    image: 'https://cdn.oakandluna.com/digital-asset/product/the-statement-one-carat-diamond-necklace-gold-1.jpg',
    isPersonalized: false,
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
}

export function useCart() {
  return useContext(CartContext) ?? CART_NOOP
}

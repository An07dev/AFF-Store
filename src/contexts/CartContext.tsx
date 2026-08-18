'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface CartItem {
  _id?: string;
  productId: string;
  name: string;
  slug?: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    name?: string;
    color?: string;
    size?: string;
    price?: number;
  };
  selected?: boolean;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  checkoutItems: CartItem[];
  setCheckoutItems: (items: CartItem[]) => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (product: any, quantity?: number, variant?: any) => void;
  buyNow: (product: any, quantity?: number, variant?: any) => CartItem;
  updateQuantity: (indexOrId: string | number, quantity: number) => void;
  removeFromCart: (indexOrId: string | number) => void;
  clearCart: () => void;
  removeCheckedOutItems: (checkedOutItems: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItemsState] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load cart and checkout items from storage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shoptik_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCheckout = sessionStorage.getItem('shoptik_checkout_items');
      if (savedCheckout) {
        setCheckoutItemsState(JSON.parse(savedCheckout));
      }
    } catch (e) {
      console.error('Error loading cart from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Persist cart purely to localStorage on every change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('shoptik_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [items, isLoaded]);

  const setCheckoutItems = (list: CartItem[]) => {
    setCheckoutItemsState(list);
    try {
      if (list && list.length > 0) {
        sessionStorage.setItem('shoptik_checkout_items', JSON.stringify(list));
      } else {
        sessionStorage.removeItem('shoptik_checkout_items');
      }
    } catch (e) {
      console.error('Error saving checkout items:', e);
    }
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const itemPrice = item.variant?.price || item.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const totalAmount = subtotal + shippingFee;

  // 3. Add to Cart (Local Only - No API call)
  const addToCart = (product: any, quantity = 1, variant?: any) => {
    const prodId = product._id || product.id;
    const variantName = variant?.name || (variant?.color && variant?.size ? `${variant.color} - ${variant.size}` : '');

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === prodId && (!variantName || item.variant?.name === variantName)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          _id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          productId: prodId,
          name: product.name,
          slug: product.slug,
          price: product.salePrice || product.price,
          quantity,
          image: (product.images && product.images[0]) || product.image || '/file.svg',
          variant: variant ? { ...variant, name: variantName } : undefined,
          selected: true,
        };
        return [...prevItems, newItem];
      }
    });

    toast.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  // 4. Buy Now (Isolates only this product for checkout, does not pollute or force other cart items)
  const buyNow = (product: any, quantity = 1, variant?: any): CartItem => {
    const prodId = product._id || product.id;
    const variantName = variant?.name || (variant?.color && variant?.size ? `${variant.color} - ${variant.size}` : '');

    const singleCheckoutItem: CartItem = {
      _id: `buynow_${Date.now()}`,
      productId: prodId,
      name: product.name,
      slug: product.slug,
      price: product.salePrice || product.price,
      quantity,
      image: (product.images && product.images[0]) || product.image || '/file.svg',
      variant: variant ? { ...variant, name: variantName } : undefined,
      selected: true,
    };

    setCheckoutItems([singleCheckoutItem]);
    return singleCheckoutItem;
  };

  // 5. Update Quantity (Local Only - No API call)
  const updateQuantity = (identifier: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(identifier);
      return;
    }

    setItems((prevItems) => {
      return prevItems.map((item, idx) => {
        if (item._id === identifier || idx === identifier) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  // 6. Remove Item (Local Only - No API call)
  const removeFromCart = (identifier: string | number) => {
    setItems((prevItems) => {
      return prevItems.filter((item, idx) => item._id !== identifier && idx !== identifier);
    });
    toast.success('Đã xóa sản phẩm khỏi giỏ');
  };

  // 7. Clear Cart
  const clearCart = () => {
    setItems([]);
  };

  // 8. Remove Checked Out Items (removes only items that were purchased)
  const removeCheckedOutItems = (checkedOutList: CartItem[]) => {
    if (!checkedOutList || checkedOutList.length === 0) return;
    setItems((prevItems) => {
      return prevItems.filter((item) => {
        const wasBought = checkedOutList.some(
          (c) => c._id === item._id || (c.productId === item.productId && c.variant?.name === item.variant?.name)
        );
        return !wasBought;
      });
    });
    setCheckoutItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        shippingFee,
        totalAmount,
        checkoutItems,
        setCheckoutItems,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        buyNow,
        updateQuantity,
        removeFromCart,
        clearCart,
        removeCheckedOutItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
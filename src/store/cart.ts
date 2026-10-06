import type { Product } from '../data/products';
import { getProductById } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export interface CartState {
  items: CartItem[];
  deliveryZone: DeliveryZone;
  deliveryFee: number;
  subtotal: number;
  total: number;
}

const STORAGE_KEY = 'falaqfood_cart_v1';
const COUPON_CODE = 'AR10';
const COUPON_PERCENT = 10;

class CartStore {
  private items: CartItem[] = [];
  private deliveryZone: DeliveryZone = 'inside_dhaka';
  private couponCode = '';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items)) {
          this.items = parsed.items
            .map((item: { productId: number; quantity: number }) => {
              const product = getProductById(Number(item.productId));
              const quantity = Math.floor(Number(item.quantity));
              return product && Number.isFinite(quantity) && quantity > 0 ? { product, quantity } : null;
            })
            .filter((i: CartItem | null): i is CartItem => i !== null);
        }
        if (parsed.deliveryZone === 'inside_dhaka' || parsed.deliveryZone === 'outside_dhaka') {
          this.deliveryZone = parsed.deliveryZone;
        }
        if (typeof parsed.couponCode === 'string' && parsed.couponCode.toUpperCase() === COUPON_CODE) {
          this.couponCode = COUPON_CODE;
        }
      }
    } catch {
      this.items = [];
    }
  }

  private save() {
    try {
      const toSave = {
        items: this.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryZone: this.deliveryZone,
        couponCode: this.couponCode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }

  private notify() {
    this.save();
    this.listeners.forEach(fn => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public getItems(): CartItem[] {
    return [...this.items];
  }

  public getItemCount(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  public getDeliveryZone(): DeliveryZone {
    return this.deliveryZone;
  }

  public getCouponCode(): string {
    return this.couponCode;
  }

  public applyCoupon(code: string): boolean {
    if (code.trim().toUpperCase() !== COUPON_CODE || this.items.length === 0) return false;
    this.couponCode = COUPON_CODE;
    this.notify();
    return true;
  }

  public removeCoupon(): void {
    if (!this.couponCode) return;
    this.couponCode = '';
    this.notify();
  }

  public setDeliveryZone(zone: DeliveryZone) {
    this.deliveryZone = zone;
    this.notify();
  }

  public getDeliveryFee(): number {
    return this.deliveryZone === 'inside_dhaka' ? 70 : 130;
  }

  public getSubtotal(): number {
    return this.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  public getCouponDiscountTotal(): number {
    if (this.couponCode !== COUPON_CODE) return 0;
    return Math.min(this.getSubtotal(), Math.round(this.getSubtotal() * COUPON_PERCENT / 100));
  }

  public getTotal(): number {
    const sub = this.getSubtotal();
    if (sub === 0) return 0;
    return Math.max(0, sub + this.getDeliveryFee() - this.getCouponDiscountTotal());
  }

  public addItem(product: Product, quantity = 1) {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += safeQuantity;
    } else {
      this.items.push({ product, quantity: safeQuantity });
    }
    this.notify();
  }

  public updateQuantity(productId: number, quantity: number) {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const safeQuantity = Math.floor(quantity);
    if (safeQuantity < 1) {
      this.removeItem(productId);
      return;
    }
    const item = this.items.find(i => i.product.id === productId);
    if (item) {
      item.quantity = safeQuantity;
      this.notify();
    }
  }

  public removeItem(productId: number) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.notify();
  }

  public clear() {
    this.items = [];
    this.couponCode = '';
    this.notify();
  }
}

export const cartStore = new CartStore();

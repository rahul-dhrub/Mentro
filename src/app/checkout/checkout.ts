export interface BillingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface SavedAddress extends BillingAddress {
  id: string;
  label: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isValid: boolean;
  message: string;
}

export interface CheckoutData {
  billingAddress: BillingAddress;
  coupon?: Coupon;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  couponDiscount: number;
  total: number;
} 
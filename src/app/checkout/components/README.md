# Checkout Components

This directory contains the modular components for the checkout page, breaking down the large monolithic checkout page into smaller, maintainable components.

## Components

### CheckoutHeader
- **File**: `CheckoutHeader.tsx`
- **Purpose**: Reusable header with back navigation and branding
- **Props**: `title`, `backButtonText`

### SavedAddresses
- **File**: `SavedAddresses.tsx`
- **Purpose**: Display and manage saved addresses
- **Props**: `savedAddresses`, `selectedAddressId`, `onSelectAddress`, `onAddNewAddress`, `onDeleteAddress`, `onSetDefault`

### BillingAddressForm
- **File**: `BillingAddressForm.tsx`
- **Purpose**: Form for entering billing address information
- **Props**: `billingAddress`, `errors`, `selectedAddressId`, `savedAddresses`, `saveCurrentAddress`, `newAddressLabel`, various handlers

### CouponCode
- **File**: `CouponCode.tsx`
- **Purpose**: Handle coupon code input and validation
- **Props**: `couponCode`, `appliedCoupon`, `couponLoading`, various handlers

### OrderSummary
- **File**: `OrderSummary.tsx`
- **Purpose**: Display order details, pricing breakdown, and checkout button
- **Props**: `cart`, `orderSummary`, `isProcessing`, `onSubmit`

## Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Testing**: Easier to write unit tests for individual components
4. **Code Organization**: Logical separation of concerns
5. **Performance**: Potential for better optimization and memoization

## Usage

```tsx
import {
  CheckoutHeader,
  SavedAddresses,
  BillingAddressForm,
  CouponCode,
  OrderSummary
} from './components';
``` 
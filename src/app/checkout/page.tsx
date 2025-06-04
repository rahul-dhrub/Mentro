'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import { BillingAddress, SavedAddress, Coupon, OrderSummary } from './checkout';

// Import our new components
import {
  CheckoutHeader,
  SavedAddresses,
  BillingAddressForm,
  CouponCode,
  OrderSummary as OrderSummaryComponent
} from './components';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveCurrentAddress, setSaveCurrentAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BillingAddress>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Load saved addresses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mentro_saved_addresses');
    if (saved) {
      try {
        const addresses = JSON.parse(saved);
        setSavedAddresses(addresses);
        
        // For returning users with saved addresses, still show the form but don't auto-hide it
        if (addresses.length > 0) {
          const defaultAddress = addresses.find((addr: SavedAddress) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setBillingAddress({
              firstName: defaultAddress.firstName,
              lastName: defaultAddress.lastName,
              email: defaultAddress.email,
              phone: defaultAddress.phone,
              address: defaultAddress.address,
              city: defaultAddress.city,
              state: defaultAddress.state,
              zipCode: defaultAddress.zipCode,
              country: defaultAddress.country,
            });
          }
        } else {
          // No saved addresses, show form and save option
          setSaveCurrentAddress(true);
        }
      } catch (error) {
        console.error('Error loading saved addresses:', error);
        setSaveCurrentAddress(true);
      }
    } else {
      // No saved addresses, show form and save option for first-time users
      setSaveCurrentAddress(true);
    }
  }, []);

  // Save addresses to localStorage
  const saveAddressesToStorage = (addresses: SavedAddress[]) => {
    localStorage.setItem('mentro_saved_addresses', JSON.stringify(addresses));
    setSavedAddresses(addresses);
  };

  // Mock coupons for demonstration
  const mockCoupons: Record<string, Coupon> = {
    'SAVE10': {
      code: 'SAVE10',
      discountType: 'percentage',
      discountValue: 10,
      isValid: true,
      message: '10% off your entire order'
    },
    'WELCOME20': {
      code: 'WELCOME20',
      discountType: 'fixed',
      discountValue: 20,
      isValid: true,
      message: '$20 off your first order'
    },
    'STUDENT15': {
      code: 'STUDENT15',
      discountType: 'percentage',
      discountValue: 15,
      isValid: true,
      message: '15% student discount'
    }
  };

  // Calculate order summary
  const calculateOrderSummary = (): OrderSummary => {
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.originalPrice || item.price), 0
    );
    
    const discount = cart.items.reduce((sum, item) => 
      sum + (item.originalPrice ? item.originalPrice - item.price : 0), 0
    );

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        couponDiscount = (cart.totalAmount * appliedCoupon.discountValue) / 100;
      } else {
        couponDiscount = Math.min(appliedCoupon.discountValue, cart.totalAmount);
      }
    }

    const total = Math.max(0, cart.totalAmount - couponDiscount);

    return { subtotal, discount, couponDiscount, total };
  };

  const orderSummary = calculateOrderSummary();

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart.items.length, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof BillingAddress]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectSavedAddress = (addressId: string) => {
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setBillingAddress({
        firstName: address.firstName,
        lastName: address.lastName,
        email: address.email,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      });
      setErrors({});
    }
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setBillingAddress({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    });
    setSaveCurrentAddress(true);
    setNewAddressLabel('');
    setErrors({});
  };

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
      
      // If deleted address was default and there are other addresses, make the first one default
      if (updatedAddresses.length > 0) {
        const wasDefault = savedAddresses.find(addr => addr.id === addressId)?.isDefault;
        if (wasDefault && !updatedAddresses.find(addr => addr.isDefault)) {
          updatedAddresses[0].isDefault = true;
        }
      }
      
      saveAddressesToStorage(updatedAddresses);
      
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        handleAddNewAddress();
      }
    }
  };

  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = savedAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    saveAddressesToStorage(updatedAddresses);
  };

  const saveNewAddress = () => {
    if (!validateForm()) return false;

    const newAddress: SavedAddress = {
      id: `addr_${Date.now()}`,
      label: newAddressLabel || 'Home',
      isDefault: savedAddresses.length === 0, // First address becomes default
      createdAt: new Date(),
      ...billingAddress
    };

    const updatedAddresses = [...savedAddresses, newAddress];
    saveAddressesToStorage(updatedAddresses);
    setSelectedAddressId(newAddress.id);
    setNewAddressLabel('');
    return true;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const coupon = mockCoupons[couponCode.toUpperCase()];
      
      if (coupon && coupon.isValid) {
        setAppliedCoupon(coupon);
        setCouponCode('');
      } else {
        setAppliedCoupon({
          code: couponCode,
          discountType: 'fixed',
          discountValue: 0,
          isValid: false,
          message: 'Invalid coupon code'
        });
      }
      setCouponLoading(false);
    }, 1000);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BillingAddress> = {};

    if (!billingAddress.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!billingAddress.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!billingAddress.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(billingAddress.email)) newErrors.email = 'Email is invalid';
    if (!billingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!billingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!billingAddress.city.trim()) newErrors.city = 'City is required';
    if (!billingAddress.state.trim()) newErrors.state = 'State is required';
    if (!billingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Save address if requested and form is being used
    if (saveCurrentAddress && !selectedAddressId) {
      if (!saveNewAddress()) return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      alert('Order placed successfully! (This is a demo)');
      clearCart();
      router.push('/courses');
      setIsProcessing(false);
    }, 2000);
  };

  if (cart.items.length === 0) {
    return null; // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CheckoutHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Checkout Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Saved Addresses */}
              <SavedAddresses
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={handleSelectSavedAddress}
                onAddNewAddress={handleAddNewAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefault={handleSetDefault}
              />

              {/* Billing Address Form */}
              <BillingAddressForm
                billingAddress={billingAddress}
                errors={errors}
                selectedAddressId={selectedAddressId}
                savedAddresses={savedAddresses}
                saveCurrentAddress={saveCurrentAddress}
                newAddressLabel={newAddressLabel}
                onInputChange={handleInputChange}
                onSaveCurrentAddressChange={setSaveCurrentAddress}
                onNewAddressLabelChange={setNewAddressLabel}
                onAddNewAddress={handleAddNewAddress}
              />

              {/* Coupon Code */}
              <CouponCode
                couponCode={couponCode}
                appliedCoupon={appliedCoupon}
                couponLoading={couponLoading}
                onCouponCodeChange={setCouponCode}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
              />
            </form>
          </div>

          {/* Order Summary */}
          <OrderSummaryComponent
            cart={cart}
            orderSummary={orderSummary}
            isProcessing={isProcessing}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
} 
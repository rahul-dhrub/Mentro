'use client';

import React from 'react';
import { BillingAddress, SavedAddress } from '../checkout';
import { FiMapPin } from 'react-icons/fi';

interface BillingAddressFormProps {
  billingAddress: BillingAddress;
  errors: Partial<BillingAddress>;
  selectedAddressId: string | null;
  savedAddresses: SavedAddress[];
  saveCurrentAddress: boolean;
  newAddressLabel: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSaveCurrentAddressChange: (checked: boolean) => void;
  onNewAddressLabelChange: (label: string) => void;
  onAddNewAddress: () => void;
}

export default function BillingAddressForm({
  billingAddress,
  errors,
  selectedAddressId,
  savedAddresses,
  saveCurrentAddress,
  newAddressLabel,
  onInputChange,
  onSaveCurrentAddressChange,
  onNewAddressLabelChange,
  onAddNewAddress,
}: BillingAddressFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiMapPin className="w-5 h-5 text-blue-600 mr-2" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Billing Address</h2>
            {selectedAddressId && (
              <p className="text-sm text-green-600">
                ✓ Using saved address: {savedAddresses.find(addr => addr.id === selectedAddressId)?.label}
              </p>
            )}
          </div>
        </div>
        {selectedAddressId && savedAddresses.length > 0 && (
          <button
            type="button"
            onClick={onAddNewAddress}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            Use Different Address
          </button>
        )}
      </div>

      {/* Save Address Option - Show when not using saved address */}
      {!selectedAddressId && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="saveAddress"
              checked={saveCurrentAddress}
              onChange={(e) => onSaveCurrentAddressChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="saveAddress" className="ml-2 text-sm font-medium text-gray-900 cursor-pointer">
              Save this address for future orders
            </label>
          </div>
          {savedAddresses.length === 0 && (
            <p className="text-xs text-blue-700 mb-3">
              💡 Save your address to make future checkouts faster and easier!
            </p>
          )}
          {saveCurrentAddress && (
            <input
              type="text"
              value={newAddressLabel}
              onChange={(e) => onNewAddressLabelChange(e.target.value)}
              placeholder="Address label (e.g., Home, Work, etc.)"
              className="w-full px-3 py-2 bg-white border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={billingAddress.firstName}
            onChange={onInputChange}
            className={`w-full px-3 py-2 bg-white border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={billingAddress.lastName}
            onChange={onInputChange}
            className={`w-full px-3 py-2 bg-white border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={billingAddress.email}
            onChange={onInputChange}
            className={`w-full px-3 py-2 bg-white border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.email ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={billingAddress.phone}
            onChange={onInputChange}
            className={`w-full px-3 py-2 bg-white border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={billingAddress.address}
            onChange={onInputChange}
            className={`w-full px-3 py-2 bg-white border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.address ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="123 Main Street"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={billingAddress.city}
            onChange={onInputChange}
            className={`w-full px-3 py-2 bg-white border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.city ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="New York"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={billingAddress.state}
            onChange={onInputChange}
            className={`w-full px-3 py-2 bg-white border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.state ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="NY"
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code *
          </label>
          <input
            type="text"
            name="zipCode"
            value={billingAddress.zipCode}
            onChange={onInputChange}
            className={`w-full px-3 py-2 bg-white border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.zipCode ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="10001"
          />
          {errors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            name="country"
            value={billingAddress.country}
            onChange={onInputChange}
            className="w-full px-3 py-2 bg-white border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React from 'react';
import { SavedAddress } from '../checkout';
import { FiHome, FiPlus, FiCheck, FiEdit3, FiTrash2 } from 'react-icons/fi';

interface SavedAddressesProps {
  savedAddresses: SavedAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
  onDeleteAddress: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

export default function SavedAddresses({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onDeleteAddress,
  onSetDefault,
}: SavedAddressesProps) {
  if (savedAddresses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiHome className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
        </div>
        <button
          type="button"
          onClick={onAddNewAddress}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedAddresses.map((address) => (
          <div
            key={address.id}
            className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedAddressId === address.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectAddress(address.id)}
          >
            {selectedAddressId === address.id && (
              <div className="absolute top-2 right-2">
                <FiCheck className="w-5 h-5 text-blue-600" />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{address.label}</h3>
                {address.isDefault && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(address.id);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                  title="Set as default"
                >
                  <FiEdit3 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAddress(address.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                  title="Delete address"
                >
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>{address.firstName} {address.lastName}</p>
              <p>{address.address}</p>
              <p>{address.city}, {address.state} {address.zipCode}</p>
              <p>{address.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
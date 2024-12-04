'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutForm() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Contact & Shipping Information */}
        <div className="space-y-8">
          {/* Contact Information */}
          <section>
            <h2 className="text-lg font-medium">Contact information</h2>
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                placeholder="Enter your email"
              />
            </div>
          </section>

          {/* Shipping Information */}
          <section>
            <h2 className="text-lg font-medium">Shipping information</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium">
                    First name
                  </label>
                  <input
                    id="firstName"
                    className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium">
                  Address
                </label>
                <input
                  id="address"
                  className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium">
                    City
                  </label>
                  <input
                    id="city"
                    className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium">
                    Country
                  </label>
                  <select
                    id="country"
                    className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                  >
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="mx">Mexico</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Method */}
          <section>
            <h2 className="text-lg font-medium">Delivery method</h2>
            <div className="mt-4 space-y-4">
              {[
                { id: 'standard', label: 'Standard', time: '4-10 business days', price: '$5.00' },
                { id: 'express', label: 'Express', time: '2-5 business days', price: '$16.00' },
              ].map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <label htmlFor={method.id} className="text-sm font-medium">
                      {method.label}
                    </label>
                    <p className="text-sm text-gray-500">{method.time}</p>
                  </div>
                  <div className="font-medium">{method.price}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-medium">Carrito de Compras</h2>

            <div className="mt-6 space-y-4">
              {[
                { id: 1, name: 'Basic Tee', color: 'Black', size: 'Large', price: '$32.00' },
                { id: 2, name: 'Basic Tee', color: 'Sienna', size: 'Large', price: '$32.00' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Image
                      src="/placeholder.svg"
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md"
                    />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.color}</p>
                      <p className="text-sm text-gray-500">{item.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 text-right">{item.price}</div>
                    <button className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$64.00</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$5.00</span>
              </div>
              <div className="flex justify-between border-t pt-4 font-medium">
                <span>Total</span>
                <span>$75.52</span>
              </div>
            </div>

            <button className="mt-6 w-full bg-blue-600 text-white rounded-lg py-2">
              Confirm order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
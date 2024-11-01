'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const DEFAULT_SIZES = [
  { name: 'XS', inStock: true },
  { name: 'S', inStock: true },
  { name: 'M', inStock: true },
  { name: 'L', inStock: true },
  { name: 'XL', inStock: true },
]

export default function ProductListWithCartAndSearch() {
  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      const productsWithSizes = (data.results || []).map(product => ({
        ...product,
        sizes: product.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES,
        imageSrc: product.imageSrc || '/placeholder.svg',
        imageAlt: product.imageAlt || `${product.name} - ${product.description || 'Product image'}`
      }))
      setProducts(productsWithSizes)
      console.log("Productos cargados:", productsWithSizes)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  const filteredProducts = products.filter(product =>
    query === '' || product.name.toLowerCase().includes(query.toLowerCase())
  )

  const openModal = (product) => {
    setSelectedProduct(product)
    setSelectedSize(null)
    setOpen(true)
  }

  const addToCart = (product, size) => {
    if (!product || !size) return
    
    setCart(currentCart => {
      const existingItemIndex = currentCart.findIndex(
        item => item.id === product.id && item.size === size.name
      )

      if (existingItemIndex >= 0) {
        const newCart = [...currentCart]
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        }
        return newCart
      } else {
        return [...currentCart, {
          ...product,
          size: size.name,
          quantity: 1,
        }]
      }
    })
    
    setOpen(false)
    setCartOpen(true)
  }

  const removeFromCart = (productId, size) => {
    setCart(cart.filter(item => !(item.id === productId && item.size === size)))
  }

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size)
      return
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const subtotal = cart.reduce((total, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''))
    return total + price * item.quantity
  }, 0)

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Products</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <label htmlFor="search" className="sr-only">Search products</label>
              <input
                type="search"
                id="search"
                name="search"
                className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <MagnifyingGlassIcon 
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-400 hover:text-gray-500"
              aria-label={`Open shopping cart with ${cart.reduce((total, item) => total + item.quantity, 0)} items`}
            >
              <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
              {cart.length > 0 && (
                <span 
                  className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
                  aria-hidden="true"
                >
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer" 
              onClick={() => openModal(product)}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${product.name}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  openModal(product)
                }
              }}
            >
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                <Image
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                  unoptimized={product.imageSrc.startsWith('http')}
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
              <div className="mt-2 flex gap-2 flex-wrap" role="list" aria-label="Available sizes">
                {product.sizes.map((size) => (
                  <span
                    key={size.name}
                    className={classNames(
                      'px-2 py-1 text-xs rounded-md',
                      size.inStock
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-50 text-gray-400'
                    )}
                    role="listitem"
                    aria-label={`Size ${size.name}${size.inStock ? ' available' : ' not available'}`}
                  >
                    {size.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Transition.Root show={open} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 hidden bg-gray-500 bg-opacity-75 transition-opacity md:block" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
                enterTo="opacity-100 translate-y-0 md:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 md:scale-100"
                leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              >
                <Dialog.Panel className="flex w-full transform text-left text-base transition md:my-8 md:max-w-2xl md:px-4 lg:max-w-4xl">
                  {selectedProduct && (
                    <div className="relative flex w-full items-center overflow-hidden bg-white px-4 pb-8 pt-14 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                      <button
                        type="button"
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                        <div className="aspect-h-3 aspect-w-2 overflow-hidden rounded-lg bg-gray-100 sm:col-span-4 lg:col-span-5">
                          <Image
                            src={selectedProduct.imageSrc}
                            alt={selectedProduct.imageAlt}
                            width={500}
                            height={500}
                            className="object-cover object-center"
                          />
                        </div>
                        <div className="sm:col-span-8 lg:col-span-7">
                          <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">{selectedProduct.name}</h2>

                          <section aria-labelledby="information-heading" className="mt-2">
                            <h3 id="information-heading" className="sr-only">
                              Product information
                            </h3>

                            <p className="text-2xl text-gray-900">{selectedProduct.price}</p>
                          </section>

                          <section aria-labelledby="options-heading" className="mt-10">
                            <h3 id="options-heading" className="text-sm font-medium text-gray-900">
                              Available sizes
                            </h3>

                            <div className="mt-4">
                              <div className="grid grid-cols-4 gap-4">
                                {selectedProduct.sizes.map((size) => (
                                  <button
                                    key={size.name}
                                    type="button"
                                    className={classNames(
                                      size.inStock
                                        ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                                        : 'cursor-not-allowed bg-gray-50 text-gray-200',
                                      selectedSize === size ? 'ring-2 ring-indigo-500' : '',
                                      'group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1'
                                    )}
                                    onClick={() => setSelectedSize(size)}
                                    disabled={!size.inStock}
                                    aria-label={`Size ${size.name}${size.inStock ? '' : ' (Out of Stock)'}`}
                                  >
                                    <span>{size.name}</span>
                                    {!size.inStock && (
                                      <span
                                        className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                                        aria-hidden="true"
                                      >
                                        <svg
                                          className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                                          viewBox="0 0 100 100"
                                          preserveAspectRatio="none"
                                          stroke="currentColor"
                                        >
                                          <line x1={0} y1={100} x2={100} y2={0} vectorEffect="non-scaling-stroke" />
                                        </svg>
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              className={classNames(
                                'mt-6 flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium',
                                selectedSize
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              )}
                              onClick={() => addToCart(selectedProduct, selectedSize)}
                              disabled={!selectedSize}
                              aria-label={selectedSize ? `Add ${selectedProduct.name} to bag` : 'Select a size to add to bag'}
                            >
                              {selectedSize ? 'Add to bag' : 'Select a size'}
                            
                            </button>
                          </section>
                        </div>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={cartOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setCartOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={React.Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">Shopping cart</Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                              onClick={() => setCartOpen(false)}
                            >
                              <span className="absolute -inset-0.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-8">
                          <div className="flow-root">
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {cart.map((item) => (
                                <li key={`${item.id}-${item.size}`} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={item.imageSrc}
                                      alt={item.imageAlt}
                                      width={96}
                                      height={96}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>{item.name}</h3>
                                        <p className="ml-4">{item.price}</p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center">
                                        <button
                                          type="button"
                                          className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                          aria-label={`Decrease quantity of ${item.name}`}
                                        >
                                          -
                                        </button>
                                        <span className="mx-2 text-gray-500">Qty {item.quantity}</span>
                                        <button
                                          type="button"
                                          className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                          aria-label={`Increase quantity of ${item.name}`}
                                        >
                                          +
                                        </button>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          className="font-medium text-indigo-600 hover:text-indigo-500"
                                          onClick={() => removeFromCart(item.id, item.size)}
                                          aria-label={`Remove ${item.name} from cart`}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p>${subtotal.toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                        <div className="mt-6">
                          <a
                            href="#"
                            className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                          >
                            Checkout
                          </a>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                              onClick={() => setCartOpen(false)}
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
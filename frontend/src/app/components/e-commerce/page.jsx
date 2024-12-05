'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon, ShoppingCartIcon, SearchIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import { fetchProductos, supabase } from '@/app/comandos';
import { WebpayCheckout } from '../payment/page';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function EcommerceWithCheckout() {
  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState({
    id: 0,
    nombre: '',
    precio: 0,
    tipe: '',
    categoria: '',
    tamaño: { tallas: [], disponibilidad: false },
    codigo: '',
    imagen: null
  })
  const [selectedSize, setSelectedSize] = useState(null)
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [arrayProductos, setArrayProductos] = useState([])
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('standard')

  useEffect(() => {
    const obtenerProductos = async () => {
      setArrayProductos(await fetchProductos());
    };
    obtenerProductos();
  }, [])

  const openModal = (product) => {
    setSelectedProduct(product)
    setSelectedSize(product.tamaño.tallas)
    setOpen(true)
  }

  const addToCart = (product, size) => {
    const newItem = {
      ...product,
      size: product.nombre,
      quantity: 1,
    }
    setCart([...cart, newItem])
    setOpen(false)
    setCartOpen(true)
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const nuevo_subtotal = cart.reduce((total, item) => {
    if (isNaN(item.precio)) {
      console.error('Precio inválido:', item.precio);
      return total;
    }
    return total + item.precio * 1
  }, 0);

  const handleContinueToPayment = () => {
    setShowCheckoutForm(true)
    setCartOpen(false)
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Compras</h2>
          <div className="flex items-center">
            <div className="relative mt-1">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <input
                  type="text"
                  className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                  placeholder="Buscar Productos..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="ml-4 p-2 text-gray-400 hover:text-gray-500"
            >
              <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">Abrir carrito</span>
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {arrayProductos.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => openModal(product)}>
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                <Image
                  src={product.imagen}
                  alt={product.nombre}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                  width={300}
                  height={300}
                  unoptimized
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product.nombre}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.precio}</p>
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
                  <div className="relative flex w-full items-center overflow-hidden bg-white px-4 pb-8 pt-14 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                    <button
                      type="button"
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                      <div className="aspect-h-3 aspect-w-2 overflow-hidden rounded-lg bg-gray-100 sm:col-span-4 lg:col-span-5">
                        <Image 
                          src={selectedProduct?.imagen} 
                          alt={selectedProduct?.nombre} 
                          className="object-cover object-center" 
                          width={500} 
                          height={500}
                          unoptimized
                        />
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7">
                        <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">{selectedProduct?.nombre}</h2>

                        <section aria-labelledby="information-heading" className="mt-2">
                          <h3 id="information-heading" className="sr-only">
                            Product information
                          </h3>

                          <p className="text-2xl text-gray-900">{selectedProduct?.precio}</p>
                        </section>

                        <section aria-labelledby="options-heading" className="mt-10">
                          <h3 id="options-heading" className="sr-only">
                            Product options
                          </h3>

                          <form>
                            <div className="mt-10">
                              <fieldset className="mt-4">
                                <legend className="sr-only">Choose a size</legend>
                                <div className="grid grid-cols-4 gap-4">
                                  {selectedProduct?.tamaño?.tallas?.map((size) => (
                                    <label
                                      key={size.talla}
                                      className={classNames(
                                        size.disponibilidad
                                          ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                                          : 'cursor-not-allowed bg-gray-50 text-gray-200',
                                        'group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1'
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        name="size-choice"
                                        value={size.talla}
                                        disabled={!size.disponibilidad}
                                        className="sr-only"
                                        onChange={() => setSelectedSize(size.talla)}
                                      />
                                      <span>{size.talla}</span>
                                      {size.disponibilidad ? (
                                        <span
                                          className="pointer-events-none absolute -inset-px rounded-md"
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <span
                                          aria-hidden="true"
                                          className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
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
                                    </label>
                                  ))}
                                </div>
                              </fieldset>
                            </div>

                            <button
                              type="button"
                              className="mt-6 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => addToCart(selectedProduct, selectedSize)}
                            >
                              Add to bag
                            </button>
                          </form>
                        </section>
                      </div>
                    </div>
                  </div>
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
                              <XIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-8">
                          <div className="flow-root">
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {cart.map((product) => (
                                <li key={product.id} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={product.imagen}
                                      alt={product.nombre}
                                      className="h-full w-full object-cover object-center"
                                      width={96}
                                      height={96}
                                      unoptimized
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                          <a href={product.href}>{product.nombre}</a>
                                        </h3>
                                        <p className="ml-4">{product.precio}</p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">{product.size}</p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <p className="text-gray-500">Cantidad {product.quantity}</p>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          className="font-medium text-indigo-600 hover:text-indigo-500"
                                          onClick={() => removeFromCart(product.id)}
                                        >
                                          Remover
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
                          <p>${nuevo_subtotal.toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">Envío e impuestos calculados al finalizar la compra.</p>
                        <div className="mt-6">
                          <button
                            onClick={handleContinueToPayment}
                            className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 w-full"
                          >
                            Continuar con el pago
                          </button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            o{' '}
                            <button
                              type="button"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                              onClick={() => setCartOpen(false)}
                            >
                              Seguir comprando
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

      {showCheckoutForm && (
        <div className="fixed inset-0 overflow-y-auto z-50 bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left Column - Contact & Shipping Information */}
              <div className="space-y-8">
                {/* Contact Information */}
                <section>
                  <h2 className="text-lg font-medium">Información de Pedido</h2>
                  <div className="mt-4">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
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
                        <label htmlFor="nombre" className="block text-sm font-medium">
                          Nombre
                        </label>
                        <input
                          id="nombre"
                          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                          placeholder="Nombre"
                        />
                      </div>
                      <div>
                        <label htmlFor="apellido" className="block text-sm font-medium">
                          Apellido
                        </label>
                        <input
                          id="lastName"
                          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                          placeholder="Apellido"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="direccion" className="block text-sm font-medium">
                        Dirección
                      </label>
                      <input
                        id="direccion"
                        className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                        placeholder="Dirección"
                      />
                    </div>

                    <div>
                      <label htmlFor="contacto" className="block text-sm font-medium">
                        Contacto
                      </label>
                      <input
                        id="contacto"
                        className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                        placeholder="Número de Teléfono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="Comuna" className="block text-sm font-medium">
                          Comuna
                        </label>
                        <input
                          id="comuna"
                          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                          placeholder="Comuna"
                        />
                      </div>
                      <div>
                        <label htmlFor="region" className="block text-sm font-medium">
                          Region
                        </label>
                        <select
                          id="region"
                          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                        >
                          <option value="us">XV Región de Arica y Parinacota</option>
                          <option value="ca">I Región de Tarapacá</option>
                          <option value="mx">II Región de Antofagasta</option>
                          <option value="mx">III Región de Atacama</option>
                          <option value="mx">IV Región de Coquimbo</option>
                          <option value="mx">V Región de Valparaíso</option>
                          <option value="mx">Región Metropolitana RM</option>
                          <option value="mx">VI Región de O’Higgins</option>
                          <option value="mx">VII Región del Maule</option>
                          <option value="mx">XVI Región de Ñuble</option>
                          <option value="mx">VIII Región del Biobío</option>
                          <option value="mx">IX Región de La Araucanía</option>
                          <option value="mx">XIV Región de Los Ríos</option>
                          <option value="mx">X Región de Los Lagos</option>
                          <option value="mx">XI Región de Aysén</option>
                          <option value="mx">XII Región de Magallanes y de la Antártica Chilena</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Delivery Method */}
                <section>
                  <h2 className="text-lg font-medium">Metodos de Envio</h2>
                  <div className="mt-4 space-y-4">
                    {[
                      { id: 'retiro', label: 'Retiro en Tienda', time: 'Instantaneo', price: 'Gratis' },
                      { id: 'chilexpress', label: 'Chilexpress ', time: '2-5 Días', price: '$4.000' },
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
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Image
                            src={item.imagen || "/placeholder.svg"}
                            alt={item.nombre}
                            width={64}
                            height={64}
                            className="rounded-md"
                            unoptimized
                          />
                          <div>
                            <h3 className="font-medium">{item.nombre}</h3>
                            <p className="text-sm text-gray-500">{item.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-20 text-right">${item.precio}</div>
                          <button className="text-red-500" onClick={() => removeFromCart(item.id)}>
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${nuevo_subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex justify-between border-t pt-4 font-medium">
                      <span>Total</span>
                      <span>${(nuevo_subtotal + 5).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment method selection */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Método de pago</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="standard"
                          checked={paymentMethod === 'standard'}
                          onChange={() => setPaymentMethod('standard')}
                          className="mr-2"
                        />
                        Transferencia
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="webpay"
                          checked={paymentMethod === 'webpay'}
                          onChange={() => setPaymentMethod('webpay')}
                          className="mr-2"
                        />
                        Webpay Plus
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'standard' ? (
                    <button className="mt-6 w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors">
                      Confirmar orden
                    </button>
                  ) : (
                    <WebpayCheckout amount={nuevo_subtotal + 5} items={cart} />
                  )}

                  <button
                    onClick={() => {
                      setShowCheckoutForm(false)
                      setCartOpen(true)
                    }}
                    className="mt-4 w-full bg-gray-200 text-gray-800 rounded-lg py-2 hover:bg-gray-300 transition-colors"
                  >
                    Volver al Carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
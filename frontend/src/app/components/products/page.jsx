import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, Squares2X2Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const filters = [
  {
    id: 'type',
    name: 'Type',
    options: [
      { value: 'accessories', label: 'Accessories', checked: false },
      { value: 'apparel', label: 'Apparel', checked: false },
      { value: 'footwear', label: 'Footwear', checked: false },
    ],
  },
  {
    id: 'category',
    name: 'Category',
    options: [
      { value: 'sportstyle', label: 'Sportstyle', checked: false },
      { value: 'running-training', label: 'Running/Training', checked: false },
      { value: 'teamsport', label: 'Teamsport', checked: false },
      { value: 'motorsport', label: 'Motorsport', checked: false },
    ],
  },
  {
    id: 'size',
    name: 'Size',
    options: [
      { value: 'xxs', label: 'XXS', checked: false },
      { value: 'xs', label: 'XS', checked: false },
      { value: 's', label: 'S', checked: false },
      { value: 'm', label: 'M', checked: false },
      { value: 'l', label: 'L', checked: false },
      { value: 'xl', label: 'XL', checked: false },
      { value: 'xxl', label: 'XXL', checked: false },
      ...Array.from({ length: 57 }, (_, i) => ({
        value: (20 + i * 0.5).toFixed(1),
        label: (20 + i * 0.5).toFixed(1),
        checked: false
      })),
      { value: 'adult', label: 'Adult', checked: false },
      { value: '4', label: '4', checked: false },
      { value: '5', label: '5', checked: false },
    ],
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ProductPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    type: '',
    category: '',
    sizes: [],
    code: '',
    image: null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const handleAddProductOpen = () => {
    setAddProductOpen(true);
  };

  const handleAddProductClose = () => {
    setAddProductOpen(false);
    setNewProduct({
      name: '',
      price: '',
      type: '',
      category: '',
      sizes: [],
      code: '',
      image: null,
    });
  };

  const handleNewProductChange = (e) => {
    const { name, value, files, options } = e.target;
    if (name === 'image') {
      setNewProduct(prev => ({ ...prev, [name]: files[0] }));
    } else if (name === 'price') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setNewProduct(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'code') {
      let formattedValue = value.replace(/[^0-9]/g, '').slice(0, 8);
      if (formattedValue.length > 6) {
        formattedValue = formattedValue.slice(0, 6) + '-' + formattedValue.slice(6);
      }
      setNewProduct(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'sizes') {
      const selectedSizes = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setNewProduct(prev => ({ ...prev, [name]: selectedSizes }));
    } else {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Evita múltiples envíos

    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(newProduct).forEach(key => {
      if (key === 'sizes') {
        formData.append(key, JSON.stringify(newProduct[key]));
      } else {
        formData.append(key, newProduct[key]);
      }
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      const addedProduct = await response.json();
      setProducts(prevProducts => [...prevProducts, addedProduct]);
      handleAddProductClose();
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      type: product.type,
      category: product.category,
      sizes: product.sizes,
      code: product.code,
      image: null,
    });
    setEditProductOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Evita múltiples envíos

    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(newProduct).forEach(key => {
      if (key === 'sizes') {
        formData.append(key, JSON.stringify(newProduct[key]));
      } else if (key === 'image' && newProduct[key]) {
        formData.append(key, newProduct[key]);
      } else {
        formData.append(key, newProduct[key]);
      }
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${selectedProduct.id}/`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      const updatedProduct = await response.json();
      setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setEditProductOpen(false);
      setQuickViewOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (isSubmitting) return; // Evita múltiples envíos

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${selectedProduct.id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      setProducts(prevProducts => prevProducts.filter(p => p.id !== selectedProduct.id));
      setEditProductOpen(false);
      setQuickViewOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (filterId, optionValue, isChecked) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: {
        ...prev[filterId],
        [optionValue]: isChecked
      }
    }));
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      return [];
    }

    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilters = Object.entries(activeFilters).every(([filterId, filterValues]) => {
        if (Object.values(filterValues).some(v => v)) {
          return Object.entries(filterValues).some(([value, isChecked]) => 
            isChecked && (
              (filterId === 'type' && product.type.toLowerCase() === value.toLowerCase()) ||
              (filterId === 'category' && product.category.toLowerCase() === value.toLowerCase()) ||
              (filterId === 'size' && product.sizes.some(size => size.toLowerCase() === value.toLowerCase()))
            )
          );
        }
        return true;
      });
      return matchesSearch && matchesFilters;
    });
  }, [products, searchQuery, activeFilters]);

  return (
    <div className="bg-white">
      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={React.Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4 border-t border-gray-200">
                  {filters.map((section) => (
                    <Disclosure as="div" key={section.id} className="border-t border-gray-200 px-4 py-6">
                      {({ open }) => (
                        <>
                          <h3 className="-mx-2 -my-3 flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                              <span className="font-medium text-gray-900">{section.name}</span>
                              <span className="ml-6 flex items-center">
                                {open ? (
                                  <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-6">
                            <div className="space-y-6">
                              {section.options.map((option, optionIdx) => (
                                <div key={option.value} className="flex items-center">
                                  <input
                                    id={`filter-mobile-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    defaultValue={option.value}
                                    type="checkbox"
                                    defaultChecked={option.checked}
                                    onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label
                                    htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                    className="ml-3 min-w-0 flex-1 text-gray-500"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">New Arrivals</h1>

          

          <div className="flex items-center">
            <button
              type="button"
              className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="sr-only">Filters</span>
              <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <section aria-labelledby="products-heading" className="pb-24 pt-6">
          <h2 id="products-heading" className="sr-only">
            Products
          </h2>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            {/* Filters */}
            <form className="hidden lg:block">
              <h3 className="sr-only">Categories</h3>
              <ul role="list" className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
                {filters.map((section) => (
                  <li key={section.name}>
                    <a href={section.href}>{section.name}</a>
                  </li>
                ))}
              </ul>

              {filters.map((section) => (
                <Disclosure as="div" key={section.id} className="border-b border-gray-200 py-6">
                  {({ open }) => (
                    <>
                      <h3 className="-my-3 flow-root">
                        <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                          <span className="font-medium text-gray-900">{section.name}</span>
                          <span className="ml-6 flex items-center">
                            {open ? (
                              <MinusIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <PlusIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                          </span>
                        </Disclosure.Button>
                      </h3>
                      <Disclosure.Panel className="pt-6">
                        <div className="space-y-4">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex items-center">
                              <input
                                id={`filter-${section.id}-${optionIdx}`}
                                name={`${section.id}[]`}
                                defaultValue={option.value}
                                type="checkbox"
                                defaultChecked={option.checked}
                                onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor={`filter-${section.id}-${optionIdx}`}
                                className="ml-3 text-sm text-gray-600"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
            </form>

            {/* Product grid */}
            <div className="lg:col-span-3">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <div className="bg-white">
                <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                  <h2 className="sr-only">Products</h2>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="group relative">
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                          />
                        </div>
                        <div className="mt-4 flex justify-between">
                          <div>
                            <h3 className="text-sm text-gray-700">
                              <a href="#" onClick={() => handleQuickView(product)}>
                                <span aria-hidden="true" className="absolute inset-0" />
                                {product.name}
                              </a>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">${product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quick view modal */}
      <Transition.Root show={quickViewOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setQuickViewOpen}>
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

          <div className="fixed inset-0 z-10 overflow-y-auto">
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
                      onClick={() => setQuickViewOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                      <div className="aspect-h-3 aspect-w-2 overflow-hidden rounded-lg bg-gray-100 sm:col-span-4 lg:col-span-5">
                        <img src={selectedProduct?.image} alt={selectedProduct?.name} className="object-cover object-center" />
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7">
                        <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">{selectedProduct?.name}</h2>

                        <section aria-labelledby="information-heading" className="mt-2">
                          <h3 id="information-heading" className="sr-only">
                            Product information
                          </h3>

                          <p className="text-2xl text-gray-900">${selectedProduct?.price}</p>

                          <div className="mt-6">
                            <h4 className="sr-only">Type</h4>
                            <p className="text-sm text-gray-700">Type: {selectedProduct?.type}</p>
                          </div>

                          <div className="mt-6">
                            <h4 className="sr-only">Category</h4>
                            <p className="text-sm text-gray-700">Category: {selectedProduct?.category}</p>
                          </div>

                          <div className="mt-6">
                            <h4 className="sr-only">Code</h4>
                            <p className="text-sm text-gray-700">Code: {selectedProduct?.code}</p>
                          </div>
                        </section>

                        <section aria-labelledby="options-heading" className="mt-10">
                          <h3 id="options-heading" className="sr-only">
                            Product options
                          </h3>

                          <form>
                            {/* Sizes */}
                            <div className="mt-10">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">Size</h4>
                              </div>

                              <fieldset className="mt-4">
                                <legend className="sr-only">Choose a size</legend>
                                <div className="grid grid-cols-4 gap-4">
                                  {selectedProduct?.sizes.map((size) => (
                                    <label
                                      key={size}
                                      className="group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1"
                                    >
                                      <input type="radio" name="size-choice" value={size} className="sr-only" aria-labelledby={`size-choice-${size}-label`} />
                                      <span id={`size-choice-${size}-label`}>{size}</span>
                                    </label>
                                  ))}
                                </div>
                              </fieldset>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleEditProduct(selectedProduct)}
                              className="mt-6 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Edit Product
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

      {/* Add Product Button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleAddProductOpen}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Product
        </button>
      </div>

      {/* Add Product Form Modal */}
      <Transition.Root show={addProductOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setAddProductOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Add New Product
                      </Dialog.Title>
                      <form onSubmit={handleAddProduct} className="mt-2">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Product Name
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={newProduct.name}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                              Price
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input
                                type="text"
                                name="price"
                                id="price"
                                value={newProduct.price}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                              Type
                            </label>
                            <div className="mt-1">
                              <select
                                name="type"
                                id="type"
                                value={newProduct.type}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Select a type</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Apparel">Apparel</option>
                                <option value="Footwear">Footwear</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                              Category
                            </label>
                            <div className="mt-1">
                              <select
                                name="category"
                                id="category"
                                value={newProduct.category}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Select a category</option>
                                <option value="Sportstyle">Sportstyle</option>
                                <option value="Running/Training">Running/Training</option>
                                <option value="Teamsport">Teamsport</option>
                                <option value="Motorsport">Motorsport</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">
                              Sizes
                            </label>
                            <div className="mt-1">
                              <select
                                name="sizes"
                                id="sizes"
                                multiple
                                value={newProduct.sizes}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                {filters.find(f => f.id === 'size').options.map((size) => (
                                  <option key={size.value} value={size.value}>{size.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                              Code
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="code"
                                id="code"
                                value={newProduct.code}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="000000-00"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                              Product Image
                            </label>
                            <div className="mt-1">
                              <input
                                type="file"
                                name="image"
                                id="image"
                                accept="image/*"
                                onChange={handleNewProductChange}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-indigo-50 file:text-indigo-700
                                  hover:file:bg-indigo-100"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Adding...' : 'Add Product'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                            onClick={handleAddProductClose}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Edit Product Form Modal */}
      <Transition.Root show={editProductOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setEditProductOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Edit Product
                      </Dialog.Title>
                      <form onSubmit={handleUpdateProduct} className="mt-2">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Product Name
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={newProduct.name}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                              Price
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input
                                type="text"
                                name="price"
                                id="price"
                                value={newProduct.price}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                              Type
                            </label>
                            <div className="mt-1">
                              <select
                                name="type"
                                id="type"
                                value={newProduct.type}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Select a type</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Apparel">Apparel</option>
                                <option value="Footwear">Footwear</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                              Category
                            </label>
                            <div className="mt-1">
                              <select
                                name="category"
                                id="category"
                                value={newProduct.category}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Select a category</option>
                                <option value="Sportstyle">Sportstyle</option>
                                <option value="Running/Training">Running/Training</option>
                                <option value="Teamsport">Teamsport</option>
                                <option value="Motorsport">Motorsport</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">
                              Sizes
                            </label>
                            <div className="mt-1">
                              <select
                                name="sizes"
                                id="sizes"
                                multiple
                                value={newProduct.sizes}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                {filters.find(f => f.id === 'size').options.map((size) => (
                                  <option key={size.value} value={size.value}>{size.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                              Code
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="code"
                                id="code"
                                value={newProduct.code}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="000000-00"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                              Product Image
                            </label>
                            <div className="mt-1">
                              <input
                                type="file"
                                name="image"
                                id="image"
                                accept="image/*"
                                onChange={handleNewProductChange}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-indigo-50 file:text-indigo-700
                                  hover:file:bg-indigo-100"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Updating...' : 'Update Product'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                            onClick={() => setEditProductOpen(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2 sm:mt-0"
                            onClick={handleDeleteProduct}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Deleting...' : 'Delete Product'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

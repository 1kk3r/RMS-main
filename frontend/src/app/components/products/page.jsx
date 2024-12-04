import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { fetchProductos } from "@/app/comandos";
import { supabase } from "@/app/comandos";
import { subirProducto } from "@/app/comandos";
import { v4 } from "uuid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({
    id: 0,
    nombre: "",
    precio: 0,
    tipe: "",
    categoria: "",
    tamaño: { tallas: [], disponibilidad: false },
    codigo: "",
    imagen: null,
  });
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: 0,
    name: "",
    price: 0,
    type: "",
    category: "",
    sizes: { tallas: [], disponibilidad: false },
    code: "",
    image: null,
  });
  const [arrayProductos, setArrayProductos] = useState([]);

  useEffect(() => {
    const obtenerProductos = async () => {
      setArrayProductos(await fetchProductos());
    };
    obtenerProductos();
  }, []);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
    setNewProduct({
      id: product.id,
      name: product.nombre,
      price: product.precio,
      type: product.tipe,
      category: product.categoria,
      sizes: {
        tallas: product.tamaño.tallas,
        disponibilidad: product.tamaño.disponibilidad,
      },
      code: product.codigo,
      image: product.imagen,
    });
  };

  const botonEstado = (estado) => {
    return estado
      ? " group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-500 transition focus:outline-none sm:flex-1"
      : " group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-red-500 transition focus:outline-none sm:flex-1";
  };

  const handleAddProductOpen = () => {
    setAddProductOpen(true);
  };

  const handleAddProductClose = () => {
    setAddProductOpen(false);
    setNewProduct({
      id: 0,
      name: "",
      price: 0,
      type: "",
      category: "",
      sizes: { tallas: [], disponibilidad: false },
      code: "",
      image: null,
    });
  };

  const handleNewProductChange = (e) => {
    const { name, value, files, options } = e.target;
    if (name === "image" || name === "imagen") {
      setNewProduct((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name === "disponibilidad") {
      setNewProduct((prev) => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          disponibilidad: value,
        },
      }));
    } else if (name === "price") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const numericfinal = parseFloat(numericValue);
      setNewProduct((prev) => ({ ...prev, [name]: numericfinal }));
    } else if (name === "code" || name === "codigo") {
      let formattedValue = value.replace(/[^0-9]/g, "").slice(0, 8);
      if (formattedValue.length > 6) {
        formattedValue =
          formattedValue.slice(0, 6) + "-" + formattedValue.slice(6);
      }
      setNewProduct((prev) => ({ ...prev, [name]: formattedValue }));
    } else if (name === "sizes") {
      const opciones_seleccionadas = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => ({ talla: option.value }));

      setNewProduct((prev) => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          tallas: opciones_seleccionadas,
        },
      }));
      const arreglo_final = opciones_seleccionadas.map((opcion) => ({
        talla: opcion.talla,
        disponibilidad: newProduct.sizes.disponibilidad,
      }));

      console.log(arreglo_final);

      setNewProduct((prev) => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          tallas: arreglo_final,
        },
      }));
    } else {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    console.log(newProduct.image);
    setAddProductOpen(false);
    subirImagen(newProduct.image);
    setNewProduct({
      id: 0,
      name: "",
      price: 0,
      type: "",
      category: "",
      sizes: { tallas: [], disponibilidad: false },
      code: "",
      image: null,
    });
  };

  const subirImagen = async () => {
    if (newProduct.image == null) {
      subirProducto(newProduct);
    } else {
      const { data, error } = await supabase.storage
        .from("imagenes")
        .upload(v4(), newProduct.image, { cacheControl: "3600" });
      console.log("Imagen subida:", data);
      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Imagen subida correctamente:", data.path);
        const { data: urlData } = supabase.storage
          .from("imagenes")
          .getPublicUrl(data.path);
        console.log("URL de la imagen:", urlData.publicUrl);
        newProduct.image = urlData.publicUrl;
        subirProducto(newProduct);
      }
    }
  };

  const borrarProducto = async (id) => {
    const { data, error } = await supabase
      .from("productos")
      .delete()
      .eq("id", id)
      .select();
    console.log("Producto eliminado:", id);
    setArrayProductos(arrayProductos.filter((p) => p.id !== id));
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditProductOpen(true);
    setNewProduct({
      id: product.id,
      name: product.nombre,
      price: product.precio,
      type: product.tipe,
      category: product.categoria,
      sizes: {
        tallas: product.tamaño.tallas,
        disponibilidad: product.tamaño.disponibilidad,
      },
      code: product.codigo,
      image: product.imagen,
    });
  };

  const actualizarProducto = async (product) => {
    console.log(product.id);

    const { data, error } = await supabase
      .from("productos")
      .update([
        {
          nombre: product.name,
          precio: product.price,
          tipe: product.type,
          categoria: product.category,
          tamaño: { tallas: product.sizes.tallas },
          codigo: product.code,
          imagen: product.image,
        },
      ])
      .eq("id", product.id)
      .select();
    setEditProductOpen(false);
  };

  const handleDeleteProduct = async (product) => {
    setIsSubmitting(true);
    console.log(product);
    console.log(product.id);

    const { data, error } = await supabase
      .from("productos")
      .delete()
      .eq("id", product.id)
      .select();
    console.log("borrado:", product);
    setArrayProductos(arrayProductos.filter((p) => p.id !== product.id));

    setIsSubmitting(false);
    setEditProductOpen(false);
    setQuickViewOpen(false);
  };

  const filteredProducts = arrayProductos.filter((product) =>
    product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-4">Bodega</h1>

        <section aria-labelledby="products-heading" className="pb-24 pt-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            <div className="lg:col-span-4">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <div className="bg-white">
                <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="group relative">
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                          <img
                            src={product.imagen}
                            alt={product.nombre}
                            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                          />
                        </div>
                        <div className="mt-4 flex justify-between">
                          <div>
                            <h3 className="text-sm text-gray-700">
                              <a
                                href="#"
                                onClick={() => handleQuickView(product)}
                              >
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-0"
                                />
                                {product.nombre}
                              </a>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {product.categoria}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            ${product.precio}
                          </p>
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
                      <span className="sr-only">Cerrar</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                      <div className="aspect-h-3 aspect-w-2 overflow-hidden rounded-lg bg-gray-100 sm:col-span-4 lg:col-span-5">
                        <img
                          src={selectedProduct.imagen}
                          alt={`Imagen de ${selectedProduct.nombre}`}
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7">
                        <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">
                          {selectedProduct.nombre}
                        </h2>

                        <section aria-labelledby="information-heading" className="mt-2">
                          <h3 id="information-heading" className="sr-only">
                            Información del producto
                          </h3>

                          <p className="text-2xl text-gray-900">
                            ${selectedProduct.precio}
                          </p>

                          <div className="mt-6">
                            <h4 className="sr-only">Tipo</h4>
                            <p className="text-sm text-gray-700">
                              Tipo: {selectedProduct.tipe}
                            </p>
                          </div>

                          <div className="mt-6">
                            <h4 className="sr-only">Categoría</h4>
                            <p className="text-sm text-gray-700">
                              Categoría: {selectedProduct.categoria}
                            </p>
                          </div>

                          <div className="mt-6">
                            <h4 className="sr-only">Código</h4>
                            <p className="text-sm text-gray-700">
                              Código: {selectedProduct.codigo}
                            </p>
                          </div>
                        </section>

                        <section aria-labelledby="options-heading" className="mt-10">
                          <h3 id="options-heading" className="sr-only">
                            Opciones del producto
                          </h3>

                          <form>
                            <div className="mt-10">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">
                                  Tamaño
                                </h4>
                              </div>

                              <fieldset className="mt-4">
                                <legend className="sr-only">
                                  Elige un tamaño
                                </legend>
                                <div className="grid grid-cols-4 gap-4">
                                  {selectedProduct.tamaño?.tallas?.length > 0 ? (
                                    selectedProduct.tamaño.tallas.map((size, index) => (
                                      <label
                                        key={index}
                                        className={botonEstado(size.disponibilidad)}
                                      >
                                        <input
                                          type="radio"
                                          name="size-choice"
                                          value={size.talla}
                                          className="sr-only"
                                          aria-labelledby={`size-choice-${size.talla}-label`}
                                          onClick={() => {
                                            if (size.disponibilidad) {
                                              console.log(size.talla);
                                            } else {
                                              console.log("Talla no disponible");
                                            }
                                          }}
                                        />
                                        <span id={`size-choice-${size.talla}-label`}>
                                          {size.talla}
                                        </span>
                                      </label>
                                    ))
                                  ) : (
                                    <p>No hay tallas disponibles</p>
                                  )}
                                </div>
                              </fieldset>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleEditProduct(selectedProduct)}
                              className="mt-6 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Editar producto
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

      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleAddProductOpen}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Añadir producto
        </button>
      </div>

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
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Añadir producto
                      </Dialog.Title>
                      <form onSubmit={handleAddProduct} className="mt-2">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <div className="mt-1">
                              <input
                                placeholder="Nombre del producto"
                                type="text"
                                name="name"
                                id="name"
                                value={newProduct.name}
                                onChange={handleNewProductChange}
                                className="mt-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="price"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Precio (clp)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"></div>
                              <input
                                type="text"
                                name="price"
                                id="price"
                                value={newProduct.price}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
                                placeholder="$500.00"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="type"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Tipo
                            </label>
                            <div className="mt-1">
                              <select
                                id="type"
                                name="type"
                                value={newProduct.type}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Selecciona un tipo</option>
                                <option value="accessories">Accesorios</option>
                                <option value="apparel">Ropa</option>
                                <option value="footwear">Calzado</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="category"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Categoría
                            </label>
                            <div className="mt-1">
                              <select
                                id="category"
                                name="category"
                                value={newProduct.category}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Selecciona una categoría</option>
                                <option value="sportstyle">Sportstyle</option>
                                <option value="running-training">Running/Training</option>
                                <option value="teamsport">Teamsport</option>
                                <option value="motorsport">Motorsport</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="sizes"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Disponibilidad
                          </label>
                          <div className="mt-1">
                            <select
                              id="disponibilidad"
                              name="disponibilidad"
                              value={newProduct.sizes.disponibilidad}
                              onChange={handleNewProductChange}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Selecciona disponibilidad</option>
                              <option value="true">Disponible</option>
                              <option value="false">No disponible</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="sizes"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Tallas
                            </label>
                            <div className="mt-1">
                              <select
                                id="sizes"
                                name="sizes"
                                multiple
                                value={newProduct.sizes.tallas}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="code"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Código del producto
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="code"
                                id="code"
                                value={newProduct.code}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label
                              htmlFor="image"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Imagen del producto
                            </label>
                            <div className="mt-1">
                              <input
                                type="file"
                                name="image"
                                id="image"
                                accept="image/*"
                                onChange={handleNewProductChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                          >
                            {isSubmitting ? "Añadiendo..." : "Añadir Producto"}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                            onClick={handleAddProductClose}
                          >
                            Cancelar
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
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        EDITAR PRODUCTO
                      </Dialog.Title>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          actualizarProducto(newProduct);
                        }}
                        className="mt-2"
                      >
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <label
                              htmlFor="name-quickview"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Nombre del Producto
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name-quickview"
                                value={newProduct.name}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="price-quickview"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Precio
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">
                                  $
                                </span>
                              </div>
                              <input
                                type="text"
                                name="price"
                                id="price-quickview"
                                value={newProduct.price}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="type-quickview"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Tipo
                            </label>
                            <div className="mt-1">
                              <select
                                id="type-quickview"
                                name="type"
                                value={newProduct.type}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Selecciona un tipo</option>
                                <option value="accessories">Accesorios</option>
                                <option value="apparel">Ropa</option>
                                <option value="footwear">Calzado</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="category-quickview"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Categoría
                            </label>
                            <div className="mt-1">
                              <select
                                id="category-quickview"
                                name="category"
                                value={newProduct.category}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Selecciona una categoría</option>
                                <option value="sportstyle">Sportstyle</option>
                                <option value="running-training">Running/Training</option>
                                <option value="teamsport">Teamsport</option>
                                <option value="motorsport">Motorsport</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="sizes-quickview"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Tamaños
                            </label>
                            <div className="mt-1">
                              <select
                                id="sizes-quickview"
                                name="sizes"
                                multiple
                                value={newProduct.sizes.tallas.map(t => t.talla)}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="disponibilidad-quickview"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Disponibilidad
                            </label>
                            <div className="mt-1">
                              <select
                                id="disponibilidad-quickview"
                                name="disponibilidad"
                                value={newProduct.sizes.disponibilidad}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              >
                                <option value="">Selecciona disponibilidad</option>
                                <option value="true">Disponible</option>
                                <option value="false">No disponible</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="code-quickview"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Código de producto
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="code"
                                id="code-quickview"
                                value={newProduct.code}
                                onChange={handleNewProductChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label
                              htmlFor="image-quickview"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Imagen de producto
                            </label>
                            <div className="mt-1">
                              <input
                                type="file"
                                name="image"
                                id="image-quickview"
                                accept="image/*"
                                onChange={handleNewProductChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                          >
                            {isSubmitting ? "Actualizando..." : "Actualizar Producto"}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                            onClick={() => {
                              setEditProductOpen(false);
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                      <div className="mt-5">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                          onClick={() => handleDeleteProduct(selectedProduct)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Borrando..." : "Borrar producto"}
                        </button>
                      </div>
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
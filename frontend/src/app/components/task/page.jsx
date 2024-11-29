import React, { useState, useEffect } from 'react';
import { supabase } from "@/app/comandos";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function TareasReposicion() {
  const [tareas, setTareas] = useState([]);
  const [mostrarCrearTarea, setMostrarCrearTarea] = useState(false);
  const [mostrarDetalleTarea, setMostrarDetalleTarea] = useState(false);
  const [tareaActual, setTareaActual] = useState(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [codigoProducto, setCodigoProducto] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [mostrarBusquedaProducto, setMostrarBusquedaProducto] = useState(false);
  const [productoEncontrado, setProductoEncontrado] = useState(null);

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    const { data, error } = await supabase
      .from('tareas_reposicion')
      .select('*')
      .order('fecha', { ascending: false });
    if (error) {
      console.error('Error al cargar tareas:', error);
    } else {
      setTareas(data);
    }
  };

  const crearTarea = async () => {
    const nuevaTarea = {
      titulo: titulo,
      fecha: new Date().toISOString(),
      productos: []
    };
    const { data, error } = await supabase
      .from('tareas_reposicion')
      .insert([nuevaTarea])
      .select();
    if (error) {
      console.error('Error al crear tarea:', error);
    } else {
      setTareas([data[0], ...tareas]);
      setTareaActual(data[0]);
      setMostrarCrearTarea(false);
      setMostrarDetalleTarea(true);
    }
  };

  const buscarProducto = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('codigo', codigoProducto)
      .single();
    if (error) {
      console.error('Error al buscar producto:', error);
      alert('Producto no encontrado');
    } else {
      setProductoEncontrado(data);
    }
  };

  const agregarProductoATarea = async () => {
    if (!productoEncontrado) return;

    const nuevoProducto = {
      ...productoEncontrado,
      cantidad: cantidadProducto
    };

    const tareaActualizada = {
      ...tareaActual,
      productos: Array.isArray(tareaActual.productos) 
        ? [...tareaActual.productos, nuevoProducto]
        : [nuevoProducto]
    };

    const { data, error } = await supabase
      .from('tareas_reposicion')
      .update(tareaActualizada)
      .eq('id', tareaActual.id)
      .select();

    if (error) {
      console.error('Error al agregar producto a la tarea:', error);
    } else {
      setTareaActual(data[0]);
      setTareas(tareas.map(t => t.id === data[0].id ? data[0] : t));
    }

    setProductoEncontrado(null);
    setCodigoProducto('');
    setCantidadProducto(1);
    setMostrarBusquedaProducto(false);
  };

  const eliminarTarea = async () => {
    const { error } = await supabase
      .from('tareas_reposicion')
      .delete()
      .eq('id', tareaActual.id);
    if (error) {
      console.error('Error al eliminar tarea:', error);
    } else {
      setTareas(tareas.filter(t => t.id !== tareaActual.id));
      setMostrarDetalleTarea(false);
    }
  };

  const editarTarea = async () => {
    const { data, error } = await supabase
      .from('tareas_reposicion')
      .update(tareaActual)
      .eq('id', tareaActual.id)
      .select();
    if (error) {
      console.error('Error al editar tarea:', error);
    } else {
      setTareas(tareas.map(t => t.id === data[0].id ? data[0] : t));
      setMostrarDetalleTarea(false);
    }
  };

  const actualizarCantidadProducto = async (productoId, incremento) => {
    const productoIndex = tareaActual.productos.findIndex(p => p.id === productoId);
    if (productoIndex === -1) return;

    const nuevaCantidad = tareaActual.productos[productoIndex].cantidad + incremento;
    
    if (nuevaCantidad < 1) {
      // Eliminar el producto si la cantidad es menor a 1
      const nuevosProductos = tareaActual.productos.filter(p => p.id !== productoId);
      const tareaActualizada = { ...tareaActual, productos: nuevosProductos };
      const { data, error } = await supabase
        .from('tareas_reposicion')
        .update(tareaActualizada)
        .eq('id', tareaActual.id)
        .select();

      if (error) {
        console.error('Error al actualizar tarea:', error);
      } else {
        setTareaActual(data[0]);
        setTareas(tareas.map(t => t.id === data[0].id ? data[0] : t));
      }
    } else {
      // Actualizar la cantidad del producto
      const nuevosProductos = tareaActual.productos.map(p =>
        p.id === productoId ? { ...p, cantidad: nuevaCantidad } : p
      );
      const tareaActualizada = { ...tareaActual, productos: nuevosProductos };
      const { data, error } = await supabase
        .from('tareas_reposicion')
        .update(tareaActualizada)
        .eq('id', tareaActual.id)
        .select();

      if (error) {
        console.error('Error al actualizar tarea:', error);
      } else {
        setTareaActual(data[0]);
        setTareas(tareas.map(t => t.id === data[0].id ? data[0] : t));
      }
    }
  };

  const esTareaAntigua = (fecha) => {
    const fechaTarea = new Date(fecha);
    const hoy = new Date();
    return fechaTarea.setHours(0,0,0,0) < hoy.setHours(0,0,0,0);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tareas de Reposición</h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setMostrarCrearTarea(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Crear Tarea
        </button>
        <button
          onClick={() => setMostrarHistorial(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Historial de Tareas
        </button>
      </div>

      {/* Lista de tareas creadas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Tareas Creadas</h2>
        <div className="space-y-4">
          {tareas.map((tarea) => (
            <div
              key={tarea.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                esTareaAntigua(tarea.fecha) ? 'border-red-500 bg-red-50' : ''
              }`}
              onClick={() => {
                setTareaActual(tarea);
                setMostrarDetalleTarea(true);
              }}
            >
              <h3 className="font-semibold">{tarea.titulo}</h3>
              <p className="text-sm text-gray-600">
                Creada: {new Date(tarea.fecha).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Productos: {tarea.productos?.length || 0}
              </p>
              {!esTareaAntigua(tarea.fecha) && (
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTareaActual(tarea);
                      setMostrarBusquedaProducto(true);
                    }}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Agregar Producto
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTareaActual(tarea);
                      eliminarTarea();
                    }}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Eliminar Tarea
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modales existentes */}
      {/* Modal para crear tarea */}
      <Transition.Root show={mostrarCrearTarea} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setMostrarCrearTarea}>
          <Transition.Child
            as={Fragment}
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
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Crear Nueva Tarea
                        </Dialog.Title>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Título de la tarea"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={crearTarea}
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setMostrarCrearTarea(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Modal para detalle de tarea */}
      <Transition.Root show={mostrarDetalleTarea} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setMostrarDetalleTarea}>
          <Transition.Child
            as={Fragment}
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
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          {tareaActual?.titulo}
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Fecha: {tareaActual ? new Date(tareaActual.fecha).toLocaleString() : ''}
                          </p>
                          <ul className="mt-4 space-y-2">
                            {tareaActual?.productos?.map((producto, index) => (
                              <li key={index} className="flex items-center justify-between py-2 border-b">
                                <span>{producto.codigo} - {producto.nombre}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => actualizarCantidadProducto(producto.id, -1)}
                                    disabled={esTareaAntigua(tareaActual.fecha)}
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center disabled:opacity-50"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span>{producto.cantidad}</span>
                                  <button
                                    onClick={() => actualizarCantidadProducto(producto.id, 1)}
                                    disabled={esTareaAntigua(tareaActual.fecha)}
                                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center disabled:opacity-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setMostrarDetalleTarea(false)}
                    >
                      Cerrar
                    </button>
                    {!esTareaAntigua(tareaActual?.fecha) && (
                      <>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                          onClick={() => setMostrarBusquedaProducto(true)}
                        >
                          Agregar Producto
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                          onClick={eliminarTarea}
                        >
                          Eliminar Tarea
                        </button>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Modal para historial de tareas */}
      <Transition.Root show={mostrarHistorial} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setMostrarHistorial}>
          <Transition.Child
            as={Fragment}
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
            <div className="flex min-:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Historial de Tareas
                        </Dialog.Title>
                        <div className="mt-2 max-h-96 overflow-y-auto">
                          {tareas.filter(tarea => esTareaAntigua(tarea.fecha)).map((tarea) => (
                            <div key={tarea.id} className="mb-4 p-4 border rounded-lg">
                              <h4 className="font-semibold">{tarea.titulo}</h4>
                              <p className="text-sm text-gray-600">
                                Fecha: {new Date(tarea.fecha).toLocaleString()}
                              </p>
                              <ul className="mt-2">
                                {tarea.productos?.map((producto, index) => (
                                  <li key={index} className="text-sm">
                                    {producto.nombre} - Cantidad: {producto.cantidad}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setMostrarHistorial(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Modal para buscar y agregar producto */}
      <Transition.Root show={mostrarBusquedaProducto} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setMostrarBusquedaProducto}>
          <Transition.Child
            as={Fragment}
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
            <div className="flex min-:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Agregar Producto
                        </Dialog.Title>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={codigoProducto}
                            onChange={(e) => setCodigoProducto(e.target.value)}
                            placeholder="Código del producto"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={buscarProducto}
                            className="mt-2 w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                          >
                            Buscar
                          </button>
                          {productoEncontrado && (
                            <div className="mt-4">
                              <p>{productoEncontrado.nombre}</p>
                              <input
                                type="number"
                                value={cantidadProducto}
                                onChange={(e) => setCantidadProducto(parseInt(e.target.value))}
                                min="1"
                                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                onClick={agregarProductoATarea}
                                className="mt-2 w-full inline-flex justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                              >
                                Agregar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        setMostrarBusquedaProducto(false);
                        setProductoEncontrado(null);
                        setCodigoProducto('');
                        setCantidadProducto(1);
                      }}
                    >
                      Cancelar
                    </button>
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


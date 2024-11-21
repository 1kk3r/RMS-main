import React, { useState, useEffect } from 'react';
import { supabase } from "@/app/comandos";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
      productos: [...tareaActual.productos, nuevoProducto]
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
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          {tareaActual?.titulo}
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Fecha: {new Date(tareaActual?.fecha).toLocaleString()}
                          </p>
                          <ul className="mt-4">
                            {tareaActual?.productos.map((producto, index) => (
                              <li key={index} className="flex items-center justify-between py-2">
                                <span>{producto.codigo} - {producto.nombre}</span>
                                <span>Cantidad: {producto.cantidad}</span>
                              </li>
                            ))}
                          </ul>
                          {!mostrarBusquedaProducto && (
                            <button
                              onClick={() => setMostrarBusquedaProducto(true)}
                              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                              Agregar Producto
                            </button>
                          )}
                          {mostrarBusquedaProducto && (
                            <div className="mt-4">
                              <input
                                type="text"
                                value={codigoProducto}
                                onChange={(e) => setCodigoProducto(e.target.value)}
                                placeholder="Código del producto (ej. 327182-02)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                onClick={buscarProducto}
                                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
                                  <div className="mt-2 flex justify-between">
                                    <button
                                      onClick={agregarProductoATarea}
                                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                      Listo
                                    </button>
                                    <button
                                      onClick={() => {
                                        setProductoEncontrado(null);
                                        setCodigoProducto('');
                                        setCantidadProducto(1);
                                      }}
                                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={() => setMostrarDetalleTarea(false)}
                    >
                      Hecho
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={editarTarea}
                    >
                      Editar Tarea
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:mt-0 sm:w-auto"
                      onClick={eliminarTarea}
                    >
                      Eliminar Tarea
                    </button>
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
                          Historial de Tareas
                        </Dialog.Title>
                        <div className="mt-2">
                          <ul className="divide-y divide-gray-200">
                            {tareas.map((tarea) => (
                              <li key={tarea.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {tarea.titulo}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Fecha: {new Date(tarea.fecha).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => {
                                        setTareaActual(tarea);
                                        setMostrarHistorial(false);
                                        setMostrarDetalleTarea(true);
                                      }}
                                      className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                      Ver
                                    </button>
                                  </div>
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
    </div>
  );
}

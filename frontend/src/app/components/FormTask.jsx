"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function FormTask() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false); // Estado para indicar si se está enviando
    const [error, setError] = useState(null); // Estado para manejar errores
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!title || !description) {
            setError('Por favor, completa ambos campos.');
            return;
        }

        setLoading(true);
        setError(null); // Limpiar error al intentar nuevamente

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`, {
                method: "POST",
                body: JSON.stringify({ title, description }),
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!res.ok) {
                throw new Error('Error al guardar la tarea');
            }

            const data = await res.json();
            console.log(data);
            setTitle(""); // Limpiar el campo de título
            setDescription(""); // Limpiar el campo de descripción
            router.refresh(); // Refrescar la lista de tareas

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-200 p-7 h-fit">
            <form onSubmit={handleSubmit}>
                <h1 className="text-black font-bold">Añadir Tarea</h1>

                {error && <p className="text-red-500">{error}</p>} {/* Mostrar errores */}
                
                <label htmlFor="title" className="text-xs text-black">
                    Título:
                </label>
                <input
                    type="text"
                    name="title"
                    value={title} // Asignar el valor actual del estado
                    className="bg-slate-400 rounded-md p-2 mb-2 block w-full text-slate-900"
                    onChange={e => setTitle(e.target.value)}
                />

                <label htmlFor="description" className="text-xs text-black">
                    Descripción:
                </label>
                <textarea
                    name="description"
                    value={description} // Asignar el valor actual del estado
                    className="bg-slate-400 rounded-md p-2 mb-2 block w-full"
                    onChange={e => setDescription(e.target.value)}
                />

                <button
                    className={`${
                        loading ? "bg-gray-500" : "bg-indigo-500"
                    } text-white rounded-md p-2 block w-full`}
                    type="submit"
                    disabled={loading} // Deshabilitar botón mientras se guarda
                >
                    {loading ? "Guardando..." : "Guardar"} {/* Cambiar texto del botón */}
                </button>
            </form>
        </div>
    );
}

export default FormTask;
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`);
            const tasksData = await res.json();
            setTasks(tasksData);
        } catch (err) {
            console.error("Error loading tasks:", err);
            setError("Error loading tasks. Please try again.");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description) {
            setError('Por favor, completa ambos campos.');
            return;
        }

        setLoading(true);
        setError(null);

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

            await res.json();
            setTitle("");
            setDescription("");
            loadTasks();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Quieres eliminar esta tarea?")) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${id}/`, {
                    method: "DELETE",
                });
    
                if (res.ok) {
                    alert('Se elimino exitosamente la Tarea');
                    loadTasks();
                } else {
                    console.error('Error en la eliminación:', res.status, res.statusText);
                    alert('No se pudo eliminar la tarea.');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                alert('Ocurrió un error al intentar eliminar la tarea.');
            }
        }
    };

    const handleTaskDone = async (id) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${id}/done/`, {
            method: "POST",
        })
        if (res.status == 200) {
            loadTasks();
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-slate-200 p-7 mb-4 rounded-lg">
                <form onSubmit={handleSubmit}>
                    <h1 className="text-black font-bold text-2xl mb-4">Añadir Tarea</h1>

                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Título:
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={title}
                        className="bg-slate-100 rounded-md p-2 mb-4 block w-full text-slate-900"
                        onChange={e => setTitle(e.target.value)}
                    />

                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción:
                    </label>
                    <textarea
                        name="description"
                        value={description}
                        className="bg-slate-100 rounded-md p-2 mb-4 block w-full text-slate-900"
                        onChange={e => setDescription(e.target.value)}
                    />

                    <button
                        className={`${
                            loading ? "bg-gray-500" : "bg-indigo-500"
                        } text-white rounded-md p-2 block w-full`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </form>
            </div>

            <div className="bg-slate-700 p-4 w-full rounded-lg">
                <h1 className="text-white text-2xl font-bold mb-4">
                    Lista de Tareas
                </h1>
                {tasks.map((task) => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onDelete={handleDelete} 
                        onToggleDone={handleTaskDone} 
                    />
                ))}
            </div>
        </div>
    );
}

function TaskCard({ task, onDelete, onToggleDone }) {
    const [edit, setEdit] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description);

    const handleEdit = async () => {
        if (edit) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${task.id}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: editTitle,
                        description: editDescription,
                    }),
                });

                if (res.ok) {
                    setEdit(false);
                    // You might want to refresh the task list here
                } else {
                    alert('No se pudo actualizar la tarea.');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                alert('Ocurrió un error al intentar actualizar la tarea.');
            }
        } else {
            setEdit(true);
        }
    };

    return (
        <div className="bg-slate-500 px-4 py-3 mb-2 rounded-md text-slate-200 flex justify-between items-center">
            <div className="flex flex-col">
                {
                    !edit ? (
                        <h2 className="font-bold">
                            {task.title}
                            {task.done && <span>✅</span>}
                        </h2>
                    ) : (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="p-2 bg-slate-400 border-none outline-none rounded-md"
                        />
                    )
                }
                {
                    !edit ? (
                        <p>{task.description}</p>
                    ) : (
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="p-2 bg-slate-400 border-none outline-none rounded-md mt-2"
                            rows={2}
                        />
                    )
                }
            </div>

            <div className="flex justify-between gap-x-2">
                <button
                    className={`text-white rounded-md p-2 ${task.done ? "bg-red-500" : "bg-green-500"}`}
                    onClick={() => onToggleDone(task.id)}
                >
                    {task.done ? "Desmarcar Tarea" : "Marcar Tarea"}
                </button>

                <button
                    className="bg-red-500 text-white rounded-md p-2"
                    onClick={() => onDelete(task.id)}
                >
                    Eliminar
                </button>

                <button
                    className="bg-indigo-500 text-white rounded-md p-2"
                    onClick={handleEdit}
                >
                    {edit ? "Guardar" : "Editar"}
                </button>
            </div>
        </div>
    );
}

export default TaskManager;
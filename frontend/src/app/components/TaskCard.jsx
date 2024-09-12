"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function TaskCard({ task }) {
    const router = useRouter();
    const [edit, setEdit] = useState(false)

    const handleDelete = async (id) => {
        if (window.confirm("¿Quieres eliminar esta tarea?")) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${id}/`, {
                    method: "DELETE",
                });
    
                if (res.ok) {
                    // Solo actualiza la vista si la respuesta es exitosa
                    alert('Se elimino exitosamente la Tarea');
                    router.refresh();
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${id}/done/`,{
            method: "POST",
        })
        if (res.status == 200) {
            router.refresh()
        }
    }

    return (
        <div className="bg-slate-500 px-4 py-3 mb-2 rounded-md text-slate-200 flex justify-between items-center">
            <div>
                {
                    !edit? (
                        <h2 className="font-bold">
                        {task.title}
                        {task.done && <span>✅</span>}
                        </h2>
                    ) : (
                        <input
                        type="text"
                        placeholder={task.title}
                        className="p-2 bg-slate-500 border-none outline-none"/>
                    )
                }
                <p>
                {task.description}
                </p>
            </div>

            <div className="flex justify-between gap-x-2">
                <button
                className={" text-white rounded-md p-2" + (task.done ? "bg-red-500" : "bg-green-500")}
                onClick={() => handleTaskDone(task.id)}
                >{task.done ? "Desmarcar Tarea" : "Marcar Tarea"}
                </button>

                <button
                className="bg-red-500 text-white rounded-md p-2"
                onClick={() => handleDelete(task.id)}
                >Eliminar
                </button>

                <button
                className="bg-indigo-500 text-white rounded-md p-2"
                onClick={() => setEdit(!edit)}>
                    Editar
                </button>
            </div>
        </div>
    );
}

export default TaskCard;
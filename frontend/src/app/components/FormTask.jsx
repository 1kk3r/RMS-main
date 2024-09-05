"use client"

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function FormTask() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`, {

            method: "POST",
            body: JSON.stringify({ title, description }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await res.json()
        console.log(data)
        router.refresh()
    };

  return (
    <div className="bg-slate-200 p-7">
        <form onSubmit={handleSubmit}>
            <h1 className="text-black font-bold">Añadir Tarea</h1>
            <label
            htmlFor="title"
            className="text-xs text-black"
            >
            Titulo:
            </label>
            <input
            type="text"
            name="title"
            className="bg-slate-400 rounded-md p-2 mb-2 block w-full text-slate-900"
            onChange={e => setTitle(e.target.value)}
            />

            <label
            htmlFor="title"
            className="text-xs text-black"
            >
            Descripcion:
            </label>
            <textarea
            name="description"
            className="bg-slate-400 rounded-md p-2 mb-2 block w-full"
            onChange={e => setDescription(e.target.value)}
            />

            <button
            className="bg-indigo-500 text-white rounded-md p-2 block w-full"
            type="submit"
            name="save"
            >
                Save
            </button>
        </form>
    </div>
  )
};

export default FormTask
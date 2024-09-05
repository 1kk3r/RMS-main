async function loadTasks() {
  
  const res = await fetch(`${process.env.BACKEND_URL}/api/tasks/`)
  const tasks = await res.json()
  return tasks
}

async function ListTask() {

  const tasks = await loadTasks()
  console.log(tasks)

  return (
    <div
    className="bg-slate-700 p-4 w-full"
    >
    ListTask
      <h1>
        Lista de Tareas
      </h1>
      {tasks.map(task => (
        <div key={task.id} className="bg-slate-500 px-4 py-3 mb-2 rounded-md flex justify-between items-center">
          <div>
          <h2>
            {task.title}
          </h2>
          <p>
            {task.description}
          </p>
          </div>
          <div className="flex justify-between gap-x-2">
            <button className="bg-red-500 text-white rounded-md p-2">Eliminar</button>
            <button className="bg-indigo-500 text-white rounded-md p-2">Actualizar</button>
          </div>
        </div>
      ))}

    </div>
  )
}

export default ListTask
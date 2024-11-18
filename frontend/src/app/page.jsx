"use client";


import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ArchiveBoxIcon,
  DocumentMagnifyingGlassIcon,
  BanknotesIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import { notFound, useRouter } from "next/navigation";
import Ecommerce from "./components/e-commerce/page";
import TaskManager from "./components/task/page";
import Product from "./components/products/page";
import Map from "./components/map/page";
import { v4 } from "uuid";
import { supabase,seleccionar, registrar } from "./comandos";



const navigation = [
  {
    name: (
      <div className="group ">
        <ArchiveBoxIcon className="h-7 w-7 text-black-500 transition-transform duration-300 group-hover:scale-105" />
      </div>
    ),
    href: "/tareas",
    title: "Tareas",
  },
  {
    name: (
      <div className="relative group">
        <DocumentMagnifyingGlassIcon className="h-7 w-7 text-black-500 transition-transform duration-300 group-hover:scale-105" />
      </div>
    ),
    href: "/inventario",
    title:"inventario"
  },
  {
    name: (
      <div className="relative group">
        <BanknotesIcon className="h-7 w-7 text-black-500 transition-transform duration-300 group-hover:scale-105" />
      </div>
    ),
    href: "/e-commerce",
    title:"e-commerce"
  },
  {
    name: (
      <div className="relative group">
        <MapIcon className="h-7 w-7 text-black-500 transition-transform duration-300 group-hover:scale-105" />
        
      </div>
    ),
    href: "/mapa",
    title:"mapa"
  },
];

const users = [
  { username: "iker.ca", password: "1111" },
  { username: "user2", password: "password2" },
];




export default function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState("home");
  const router = useRouter();
  const [password_confirm, setpassword_confirm] = useState("");
  const [password_register, setpassword_register] = useState("");



  /*
  let timeout;

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedIn === 'true');

    const handleIdleTimeout = () => {
      handleLogout();
    };

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleIdleTimeout, 100000);
    };

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keypress', resetTimeout);

    resetTimeout();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  }, []);
*/
  const handleLogin = (e) => {
    e.preventDefault();
    ingresar(username,password)

  };

  const registrar = async (username,password) =>{
    const {user,error} = await supabase.auth.signUp({
      email: username,
      password: password,
    })
    if (error){
      console.log("Error en el registro:", error);
  
    }
    else{
      setError("Registro exitoso");
  }
}


  const ingresar = async (username,password) => {
    const {data,error} = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    })
    if (error){
      console.log("Error en el ingreso:", error);
      setError("Nombre de usuario o contraseña incorrectas");
    }
    else{
      setError("Ingreso exitoso");
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
    }

  }


  /*
    const foundUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Nombre de usuario o contraseña incorrectas");
    }

  */

  const handleNavigation = (href) => {
    if (href === "/e-commerce") {
      setCurrentPage("e-commerce");
    } else if (href === "/tareas") {
      setCurrentPage("tareas");
    } else if (href === "/inventario") {
      setCurrentPage("inventario");
    } else if (href === "/mapa") {
      setCurrentPage("mapa");
    } else {
      setCurrentPage("home");
      router.push(href);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setCurrentPage("home");
  };

  const [activa, setactiva] = useState("ingreso");

  const botonIngreso = (estado,final) => {
    if (estado === "ingreso" && final === "ingreso") {
      return "px-4 rounded-md py-2 bg-gray-300  border border-gray hover:border-gray-500 transition ";
    }
    else{
      return "px-4 rounded-md py-2  border border-gray hover:border-gray-500 transition ";
    }
  }
  const botonRegistro = (estado,final) => {
    if(estado === "registro" && final === "registro"){
      return "px-4 rounded-md py-2 bg-gray-300  border border-gray hover:border-gray-500 transition ";
    }
    else{
      return "px-4 rounded-md py-2  border border-gray hover:border-gray-500 transition ";
    }
  }

  const handleRegister = (e) => {
    e.preventDefault();
    if (
      username !== " " &&
      password_register !== " " &&
      password_confirm !== " " &&
      password_register === password_confirm &&
      !users.some((user) => user.username === username ) && password_register.length >= 6
    ) {
      registrar(username,password_register)
      
      //console.log(users);
      registrar(username,password_register)

      //setactiva('ingreso')
    } else {
      setError("Error en el registro de usuario");
    }
    //Evitar que el registro de usuario se haga con campos vacios
  };

  return (
    <div>
      {!isLoggedIn && (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
          <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="flex justify-center space-x-4 ">
                <button
                  className={botonIngreso(activa,"ingreso")}
                  onClick={() => [setactiva("ingreso")]}
                >
                  ingresar
                </button>
                <button
                  className={botonRegistro(activa,"registro")}
                  onClick={() => [ setactiva("registro")]}
                >
                  registrarse
                </button>
              </div>

              <img
                alt="Logo provisional"
                title='Logo Provisional'
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBEdGyhY43kLvgJXnkmLJZWAwh_un3-EkKiw&s"
                className="h-12 w-auto mt-5"
              />
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                BIENVENIDO
              </h2>
            </div>

            {activa === "ingreso" ? (
              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <div className="space-y-4 rounded-md shadow-sm">
                  <div>
                    <label htmlFor="username" className="sr-only">
                      Correo electronico
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      placeholder="Correo electronico"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    title="login"
                    type="submit"
                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >Ingresar
                  </button>
                </div>
              </form>
            ) : (
              <form className="mt-/ space-y-6" onSubmit={handleRegister}>
                <div className="space-y-4 rounded-md shadow-sm">
                  <div>
                    <label htmlFor="username" className="sr-only">
                      Nombre de usuario
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      placeholder="Nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      placeholder="Contraseña"
                      value={password_register}
                      onChange={(e) => setpassword_register(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Confirmar Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      placeholder="Confirmar Contraseña"
                      value={password_confirm}
                      onChange={(e) => [
                        setpassword_confirm(e.target.value),
                        //console.log(e.target.value),
                      ]}
                    />
                  </div>
                  <div>
                    <button
                      title="register"
                      type="submit"
                      className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Registrar
                    </button>
                  </div>
                </div>
              </form>
            )}
            <p className="mt-2 text-center text-sm text-gray-10000">{error}</p>
          </div>
        </div>
      )}
      {isLoggedIn && (
        <div className="bg-white">
          <header className="absolute inset-x-0 top-0 z-50 bg-white">
            <nav
              aria-label="Global"
              className="flex items-center justify-between p-6 lg:px-8"
            >
              <div className="flex lg:flex-1">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">Your Company</span>
                  <img
                    alt="Logo"
                    src="https://www.pngplay.com/wp-content/uploads/7/Home-Logo-Background-PNG-Image.png"
                    className="h-8 w-auto"
                    onClick={() => setCurrentPage("home")}
                  />
                </a>
              </div>
              <div className="flex lg:hidden">
                <button
                  title="Abrir menu principal"
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                >
                  <span className="sr-only">Abrir menu principal</span>
                  <Bars3Icon aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>
              <div className="hidden lg:flex lg:gap-x-12">
                {navigation.map((item) => (
                  <button
                    key={v4()}
                    onClick={() => handleNavigation(item.href)}
                    className="text-sm font-semibold leading-6 text-gray-900"
                    title={item.title}
                  >
                    {item.name}
              
                  </button>
                ))}
              </div>
              <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                <button
                  title="logout"
                  onClick={handleLogout}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Cerrar sesión <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </nav>

            <Dialog
              open={mobileMenuOpen}
              onClose={setMobileMenuOpen}
              className="lg:hidden"
            >
              <div className="fixed inset-0 z-50" />
              <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div className="flex items-center justify-between">
                  <a href="#" className="-m-1.5 p-1.5">
                    <span className="sr-only">Your Company</span>
                    <img
                      alt="Logo"
                      src="https://static-00.iconduck.com/assets.00/brand-puma-icon-2048x1595-7h1m6t2y.png"
                      className="h-8 w-auto"
                      onClick={() => setCurrentPage("home")}
                    />
                  </a>
                  <button
                    title="close-menu"
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                      {navigation.map((item) => (
                        <button
                          key={v4()}
                          onClick={() => handleNavigation(item.href)}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                          title={item.title}
                        >
                          {item.name}
                        </button>
                      ))}
                       <button
                  title="logout"
                  onClick={handleLogout}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Cerrar sesión <span aria-hidden="true">&rarr;</span>
                </button>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
               
                </div>
              </Dialog.Panel>
            </Dialog>
          </header>

          <main className="mt-16 px-6 py-24 sm:px-6 sm:py-4 lg:px-8">
            {currentPage === "e-commerce" && <Ecommerce />}
            {currentPage === "tareas" && <TaskManager />}
            {currentPage === "inventario" && <Product />}
            {currentPage === "mapa" && <Map />}
            {currentPage !== "e-commerce" &&
              currentPage !== "tareas" &&
              currentPage !== "inventario" &&
              currentPage !== "mapa" && (
                <div className="text-center">
        
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Selecciona un modal del menú de navegación para comenzar.
                  </p>
                  <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                    <h2 className="text-center text-base/7 font-semibold text-indigo-600">
                      WORK FASTER.
                    </h2>
                    <p className="mx-auto mt-2 max-w-lg text-balance text-center text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                      Todo lo que Necesitas en una App.
                    </p>
                    <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
                      <div className="relative lg:row-span-2">
                        <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                          <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                            <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 max-lg:text-center">
                              Amigable con Dispositivos Moviles
                            </p>
                            <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                              Facil uso desde dispositivos moviles.
                            </p>
                          </div>
                          <div className="relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                            <div className="absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                              <img
                                className="size-full object-cover object-top"
                                src="https://tailwindui.com/plus/img/component-images/bento-03-mobile-friendly.png"
                                alt=""
                              />
                            </div>
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]"></div>
                      </div>
                      <div className="relative max-lg:row-start-1">
                        <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                          <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                            <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 max-lg:text-center">
                              Rendimiento
                            </p>
                            <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                              -Reduce el Trabajo y +Aumenta el Rendimiento.
                            </p>
                          </div>
                          <div className="flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2">
                            <img
                              className="w-full max-lg:max-w-xs"
                              src="https://tailwindui.com/plus/img/component-images/bento-03-performance.png"
                              alt=""
                            />
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]"></div>
                      </div>
                      <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
                        <div className="absolute inset-px rounded-lg bg-white"></div>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                          <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                            <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 max-lg:text-center">
                              Securidad
                            </p>
                            <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                              Almacenamiento y Desarrollo 100% en Cloud con
                              Encriptados de PTP.
                            </p>
                          </div>
                          <div className="flex flex-1 items-center [container-type:inline-size] max-lg:py-6 lg:pb-2">
                            <img
                              className="h-[min(152px,40cqw)] object-cover object-center"
                              src="https://tailwindui.com/plus/img/component-images/bento-03-security.png"
                              alt=""
                            />
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
                      </div>
                      <div className="relative lg:row-span-2">
                        <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                          <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                            <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 max-lg:text-center">
                              Aplicación poderosa
                            </p>
                            <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                              Pagina de Facil Entendimiento y Rapida Respuesta
                              para Cualquier Recurso Requerido en la Tienda.
                            </p>
                          </div>
                          <div className="relative min-h-[30rem] w-full grow">
                            <div className="absolute bottom-0 left-10 right-0 top-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl">
                              <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                                <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
                                  <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                                    E-commerce.jsx
                                  </div>
                                  <div className="border-r border-gray-600/10 px-4 py-2">
                                    Products.jsx
                                  </div>
                                </div>
                              </div>
   


   
                            </div>
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </main>
        </div>
      )}
    </div>
  );
}



/*

                              <div className="px-6 pb-14 pt-6">
                                {<Ecommerce />}
                              </div>
                              */
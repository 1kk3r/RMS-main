'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ArchiveBoxIcon, DocumentMagnifyingGlassIcon, BanknotesIcon, MapIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Ecommerce from './components/e-commerce/page';
import TaskManager from './components/task/page';
import Product from './components/products/page';
import Map from './components/map/page';

const navigation = [
  { name: <ArchiveBoxIcon className="h-7 w-7 text-black-500"/>, href: '/tareas' },
  { name: <DocumentMagnifyingGlassIcon className="h-7 w-7 text-black-500" />, href: '/inventario' },
  { name: <BanknotesIcon className="h-7 w-7 text-black-500" />, href: '/e-commerce' },
  { name: <MapIcon className="h-7 w-7 text-black-500" />, href: '/mapa' },
];

const users = [
  { username: 'iker.ca', password: '1111' },
  { username: 'user2', password: 'password2' },
];

export default function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const router = useRouter();
  
  let timeout;

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedIn === 'true');

    const handleIdleTimeout = () => {
      handleLogout();
    };

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleIdleTimeout, 60000);
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

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleNavigation = (href) => {
    if (href === '/e-commerce') {
      setCurrentPage('e-commerce');
    } else if (href === '/tareas') {
      setCurrentPage('tareas');
    } else if (href === '/inventario') {
      setCurrentPage('inventario');
    } else if (href === '/mapa') {
      setCurrentPage('mapa');
    } else {
      setCurrentPage('home');
      router.push(href);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  return (
    <div>
      {!isLoggedIn && (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-xl">
          <div className="flex flex-col items-center">
            <img
              alt="Your Company"
              src="https://static-00.iconduck.com/assets.00/brand-puma-icon-2048x1595-7h1m6t2y.png"
              className="h-12 w-auto"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              FOREVER FASTER.
            </h2>
          </div>
          {error && <p className="text-center text-red-500">{error}</p>}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
  
            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
      {isLoggedIn && (
        <div className="bg-white">
          <header className="absolute inset-x-0 top-0 z-50 bg-white">
            <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
              <div className="flex lg:flex-1">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">Your Company</span>
                  <img
                    alt="Logo"
                    src="https://static-00.iconduck.com/assets.00/brand-puma-icon-2048x1595-7h1m6t2y.png"
                    className="h-8 w-auto"
                  />
                </a>
              </div>
              <div className="flex lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                >
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>
              <div className="hidden lg:flex lg:gap-x-12">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Log out <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </nav>

            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
              <div className="fixed inset-0 z-50" />
              <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div className="flex items-center justify-between">
                  <a href="#" className="-m-1.5 p-1.5">
                    <span className="sr-only">Your Company</span>
                    <img
                      alt="Logo"
                      src="https://static-00.iconduck.com/assets.00/brand-puma-icon-2048x1595-7h1m6t2y.png"
                      className="h-8 w-auto"
                    />
                  </a>
                  <button
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
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Dialog>
          </header>
          
          <main className="mt-16 px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            {currentPage === 'e-commerce' && <Ecommerce />}
            {currentPage === 'tareas' && <TaskManager />}
            {currentPage === 'inventario' && <Product />}
            {currentPage === 'mapa' && <Map />}
            {currentPage !== 'e-commerce' && currentPage !== 'tareas'
            && currentPage !== 'inventario' && currentPage !== 'mapa'
            && (
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Bienvenido a tu Dashboard
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Selecciona una página del menú de navegación para comenzar.
                </p>
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
                    Trusted by the world’s most innovative teams
                  </h2>
                  <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                    <img
                      alt="Transistor"
                      src="https://tailwindui.com/plus/img/logos/158x48/transistor-logo-gray-900.svg"
                      width={158}
                      height={48}
                      className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                    />
                    <img
                      alt="Reform"
                      src="https://tailwindui.com/plus/img/logos/158x48/reform-logo-gray-900.svg"
                      width={158}
                      height={48}
                      className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                    />
                    <img
                      alt="Tuple"
                      src="https://tailwindui.com/plus/img/logos/158x48/tuple-logo-gray-900.svg"
                      width={158}
                      height={48}
                      className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                    />
                    <img
                      alt="SavvyCal"
                      src="https://tailwindui.com/plus/img/logos/158x48/savvycal-logo-gray-900.svg"
                      width={158}
                      height={48}
                      className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
                    />
                    <img
                      alt="Statamic"
                      src="https://tailwindui.com/plus/img/logos/158x48/statamic-logo-gray-900.svg"
                      width={158}
                      height={48}
                      className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
                    />
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
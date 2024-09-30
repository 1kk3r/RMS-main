'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ArchiveBoxIcon, DocumentMagnifyingGlassIcon, BanknotesIcon, MapIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Ecommerce from './components/e-commerce/page';
import TaskManager from './components/task/page';

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
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Your Company"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            {error && <p className="text-red-500">{error}</p>}
            <form class="space-y-6" onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium leading-6 text-gray-900">Username</label>
                <input
                  id="username"
                  name="username"
                  type="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Login
              </button>
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
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
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
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
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
          <footer className="absolute inset-x-0 top-0 z-50 bg-white">
            <div className="bg-white">

            </div>
          </footer>
          
          <main className="mt-16 px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            {currentPage === 'e-commerce' && <Ecommerce />}
            {currentPage === 'tareas' && <TaskManager />}
            {currentPage !== 'e-commerce' && currentPage !== 'tareas' && (
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Bienvenido a tu Dashboard
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Selecciona una página del menú de navegación para comenzar.
                </p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
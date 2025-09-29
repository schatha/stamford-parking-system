'use client';

import { useState, Fragment } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-700">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.role}</p>
            </div>
          </div>
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
            <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <UserIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Dashboard
                </Link>
              )}
            </Menu.Item>

            {session.user.role === 'ADMIN' && (
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/admin"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'group flex items-center px-4 py-2 text-sm'
                    )}
                  >
                    <CogIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Admin Panel
                  </Link>
                )}
              </Menu.Item>
            )}

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard/settings"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <CogIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Settings
                </Link>
              )}
            </Menu.Item>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex w-full items-center px-4 py-2 text-sm'
                  )}
                >
                  <ArrowRightOnRectangleIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Cookie from 'js-cookie'

import ApplicationLogo from '@/components/ApplicationLogo'
import Dropdown from '@/components/Dropdown'
import NavLink from '@/components/NavLink'
import DropdownLink, { DropdownButton } from '@/components/DropdownLink'
import ResponsiveNavLink, { ResponsiveNavButton } from '@/components/ResponsiveNavLink'

import { useAuth } from '@/hooks/auth'
import { navItems } from '@/lib/navItems' // Single array of nav items

const Navigation = ({ user }) => {
  const { hasPermission, logout } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Check if there's an active account
  const activeAccount = Cookie.get('active_account_id')

  // Decide if user can see a given item
  const canView = (item) => {
    // 1) If `needActiveAccount` is true, must have an active account
    if (item.needActiveAccount && !activeAccount) {
      return false
    }

    // 2) Check permissions (if `permission` is null, user can see it)
    if (!item.permission) {
      return true
    }

    // 3) If there's a permission, check it
    return hasPermission(item.permission)
  }

  return (
    <nav className="bg-white border-b border-gray-100">
      {/* Primary Navigation Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo + Nav */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <ApplicationLogo className="block h-10 w-auto fill-current text-gray-600" />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
              {navItems.map((item) => {
                // Skip if user can't view
                if (!canView(item)) return null

                // If item has children => render a Dropdown
                if (item.children && item.children.length > 0) {
                  // Filter children by canView
                  const visibleChildren = item.children.filter(canView)
                  // If no children remain visible, skip the entire top-level
                  if (visibleChildren.length === 0) return null

                  return (
                    <div key={item.label} className="mt-6">
                      <Dropdown
                        align="right"
                        width="48"
                        trigger={
                          <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                            <div>{item.label}</div>
                            <div className="ml-1">
                              <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 
                                  111.414 1.414l-4 4a1 1 0 
                                  01-1.414 0l-4-4a1 1 0 
                                  010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </button>
                        }
                      >
                        {visibleChildren.map((child) => (
                          <DropdownLink
                            key={child.label}
                            href={child.href}
                            active={pathname.includes(child.href)}
                          >
                            {child.label}
                          </DropdownLink>
                        ))}
                      </Dropdown>
                    </div>
                  )
                } else {
                  return (
                    <NavLink
                      key={item.label}
                      href={item.href}
                      active={
                        pathname === item.href || pathname.includes(item.href)
                      }
                    >
                      {item.label}
                    </NavLink>
                  )
                }
              })}
            </div>
          </div>

          {/* Right side: User dropdown (desktop) */}
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            <Dropdown
              align="right"
              width="48"
              trigger={
                <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                  <div>{user?.name}</div>
                  <div className="ml-1">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 
                        011.414 0L10 10.586l3.293-3.293a1 1 0 
                        111.414 1.414l-4 4a1 1 0 
                        01-1.414 0l-4-4a1 1 0 
                        010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
              }
            >
              <DropdownButton onClick={logout}>Logout</DropdownButton>
            </Dropdown>
          </div>

          {/* Hamburger button (mobile menu toggle) */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 
                         hover:text-gray-500 hover:bg-gray-100 focus:outline-none 
                         focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {open ? (
                  <path
                    className="inline-flex"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    className="inline-flex"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {open && (
        <div className="block sm:hidden">
          {/* Mobile nav items */}
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              if (!canView(item)) return null

              // Has children => group them
              if (item.children && item.children.length > 0) {
                const visibleChildren = item.children.filter(canView)
                if (visibleChildren.length === 0) return null

                return (
                  <div key={item.label} className="px-4">
                    {/* Parent label (not clickable if href='#') */}
                    <div className="text-gray-700 font-semibold py-2">
                      {item.label}
                    </div>
                    {/* Render child links underneath */}
                    {visibleChildren.map((child) => (
                      <ResponsiveNavLink
                        key={child.label}
                        href={child.href}
                        active={pathname.includes(child.href)}
                      >
                        {child.label}
                      </ResponsiveNavLink>
                    ))}
                  </div>
                )
              } else {
                // Direct link for mobile
                return (
                  <ResponsiveNavLink
                    key={item.label}
                    href={item.href}
                    active={pathname.includes(item.href)}
                  >
                    {item.label}
                  </ResponsiveNavLink>
                )
              }
            })}
          </div>

          {/* Mobile user info + logout */}
          <div className="pt-4 pb-1 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-10 w-10 fill-current text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 
                    11-8 0 4 4 0 
                    018 0zM12 14a7 7 0 
                    00-7 7h14a7 7 0 
                    00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <div className="font-medium text-base text-gray-800">
                  {user?.name}
                </div>
                <div className="font-medium text-sm text-gray-500">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <ResponsiveNavButton onClick={logout}>
                Logout
              </ResponsiveNavButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation

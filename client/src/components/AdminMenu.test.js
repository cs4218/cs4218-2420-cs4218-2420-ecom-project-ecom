import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter } from 'react-router-dom'
import AdminMenu from './AdminMenu'

// Helper function to render component with Router
const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('AdminMenu Component', () => {
  beforeEach(() => {
    // Clear any mocks if added in future
    jest.clearAllMocks()
  })

  // TEST #1: Basic rendering
  it('renders the admin menu with title', () => {
    renderWithRouter(<AdminMenu />)
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  // TEST #2: Navigation links presence
  it('renders all navigation links with correct paths', () => {
    renderWithRouter(<AdminMenu />)

    const links = [
      { text: 'Create Category', path: '/dashboard/admin/create-category' },
      { text: 'Create Product', path: '/dashboard/admin/create-product' },
      { text: 'Products', path: '/dashboard/admin/products' },
      { text: 'Orders', path: '/dashboard/admin/orders' }
    ]

    links.forEach(link => {
      const navLink = screen.getByText(link.text)
      expect(navLink).toBeInTheDocument()
      expect(navLink.getAttribute('href')).toBe(link.path)
    })
  })
})

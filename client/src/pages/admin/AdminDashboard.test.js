import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import AdminDashboard from './AdminDashboard'
import { useAuth } from '../../context/auth'

// Mocks
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn()
}))

jest.mock('../../components/Layout', () => {
  return ({ children }) => <div data-testid='mock-layout'>{children}</div>
})

jest.mock('../../components/AdminMenu', () => {
  return () => <div data-testid='mock-admin-menu'>Admin Menu</div>
})

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  // TEST #1
  it('renders with Layout wrapper and AdminMenu', () => {
    useAuth.mockReturnValue([{ user: null }])
    render(<AdminDashboard />)

    expect(screen.getByTestId('mock-layout')).toBeInTheDocument()
    expect(screen.getByTestId('mock-admin-menu')).toBeInTheDocument()
  })

  // TEST #2
  it('displays admin information when auth data is present', () => {
    const mockUser = {
      name: 'Test Admin',
      email: 'admin@test.com',
      phone: '1234567890'
    }
    useAuth.mockReturnValue([{ user: mockUser }])

    render(<AdminDashboard />)

    expect(
      screen.getByText(`Admin Name : ${mockUser.name}`)
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Admin Email : ${mockUser.email}`)
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Admin Contact : ${mockUser.phone}`)
    ).toBeInTheDocument()
  })

  // TEST #3
  it('handles missing user data gracefully', () => {
    useAuth.mockReturnValue([{}])
    render(<AdminDashboard />)

    expect(screen.getByText('Admin Name :')).toBeInTheDocument()
    expect(screen.getByText('Admin Email :')).toBeInTheDocument()
    expect(screen.getByText('Admin Contact :')).toBeInTheDocument()
  })

  // TEST #4
  it('handles null auth state', () => {
    useAuth.mockReturnValue([null])
    render(<AdminDashboard />)

    expect(screen.getByText('Admin Name :')).toBeInTheDocument()
    expect(screen.getByText('Admin Email :')).toBeInTheDocument()
    expect(screen.getByText('Admin Contact :')).toBeInTheDocument()
  })

  // TEST #5
  it('handles undefined user properties', () => {
    const mockUser = {
      name: undefined,
      email: undefined,
      phone: undefined
    }
    useAuth.mockReturnValue([{ user: mockUser }])

    render(<AdminDashboard />)

    expect(screen.getByText('Admin Name :')).toBeInTheDocument()
    expect(screen.getByText('Admin Email :')).toBeInTheDocument()
    expect(screen.getByText('Admin Contact :')).toBeInTheDocument()
  })
})

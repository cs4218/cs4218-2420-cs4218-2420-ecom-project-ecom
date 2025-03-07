import { renderHook, act, waitFor } from '@testing-library/react'
import axios from 'axios'
import useCategory from './useCategory'

// Mock axios
jest.mock('axios')

describe('useCategory Hook', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // TEST #1
  it('should initialize with an empty array', () => {
    const { result } = renderHook(() => useCategory())
    expect(result.current).toEqual([])
  })

  // TEST #2
  it('should fetch categories and update state on successful API call', async () => {
    // Mock successful response
    const mockCategories = [
      { _id: '1', name: 'Electronics' },
      { _id: '2', name: 'Clothing' }
    ]

    axios.get.mockResolvedValueOnce({
      data: { category: mockCategories }
    })

    const { result } = renderHook(() => useCategory())

    // Wait for the state to update
    await waitFor(() => {
      expect(result.current).toEqual(mockCategories)
    })

    // Verify axios was called with the correct URL
    expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category')
    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  // TEST #3
  it('should handle empty category response', async () => {
    // Mock empty response
    axios.get.mockResolvedValueOnce({
      data: { category: [] }
    })

    const { result } = renderHook(() => useCategory())

    // Wait for the state to update
    await waitFor(() => {
      expect(result.current).toEqual([])
    })

    // Verify axios was called
    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  // TEST #4
  it('should handle undefined category response', async () => {
    // Mock undefined response
    axios.get.mockResolvedValueOnce({
      data: {}
    })

    const { result } = renderHook(() => useCategory())

    // Wait for the state to update (should remain empty array)
    await waitFor(() => {
      expect(result.current).toEqual([])
    })

    // Verify axios was called
    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  // TEST #5
  it('should handle API call error', async () => {
    // Mock error response
    const errorMessage = 'Network Error'
    axios.get.mockRejectedValueOnce(new Error(errorMessage))

    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    const { result } = renderHook(() => useCategory())

    // Wait for the API call to complete
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
    expect(result.current).toEqual([])
    expect(axios.get).toHaveBeenCalledTimes(1)

    consoleSpy.mockRestore()
  })

  // TEST #6
  it('should not trigger multiple API calls on re-renders', async () => {
    // Mock successful response
    axios.get.mockResolvedValueOnce({
      data: { category: [{ _id: '1', name: 'Electronics' }] }
    })

    // First render
    const { rerender } = renderHook(() => useCategory())

    // Re-render the hook
    rerender()
    rerender()

    // Verify axios was called only once despite multiple renders
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1)
    })
  })
})

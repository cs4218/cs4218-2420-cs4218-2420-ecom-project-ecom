import { jest } from '@jest/globals'
import categoryModel from './categoryModel.js'

jest.mock('../models/categoryModel.js')

describe('Category Model Test', () => {
  //Test schema definition
  describe('Schema Definition', () => {
    // TEST #1
    it('should have the correct fields', () => {
      const fields = Object.keys(categoryModel.schema.paths)
      expect(fields).toContain('name')
      expect(fields).toContain('slug')
      expect(fields).toContain('_id')
      expect(fields).toContain('__v') // Mongoose version key
      expect(fields).toHaveLength(4) // _id, name, slug, __v
    })
    // TEST #2
    it('should enforce correct field types', () => {
      expect(categoryModel.schema.paths.name.instance).toBe('String')
      expect(categoryModel.schema.paths.slug.instance).toBe('String')
    })
    // TEST #3
    it('should convert slug to lowercase', async () => {
      const category = new categoryModel({
        name: 'Test Category',
        slug: 'TEST-CATEGORY'
      })
      expect(category.slug).toBe('test-category')
    })
    // TEST #4
    it('should handle special characters in slug', async () => {
      const category = new categoryModel({
        name: 'Test & Category',
        slug: 'TEST & CATEGORY'
      })
      expect(category.slug).toBe('test & category')
    })
  })

  // Test model validation
  describe('Model Validation', () => {
    // TEST #1
    it('should allow empty fields', async () => {
      const category = new categoryModel({})
      const err = await category.validateSync()
      expect(err).toBeUndefined()
    })
    // TEST #2
    it('should accept valid category data', async () => {
      const category = new categoryModel({
        name: 'Electronics',
        slug: 'electronics'
      })
      const err = await category.validateSync()
      expect(err).toBeUndefined()
    })
    // TEST #3
    it('should accept category with only name', async () => {
      const category = new categoryModel({
        name: 'Electronics'
      })
      const err = await category.validateSync()
      expect(err).toBeUndefined()
    })
    // TEST #4
    it('should accept category with only slug', async () => {
      const category = new categoryModel({
        slug: 'electronics'
      })
      const err = await category.validateSync()
      expect(err).toBeUndefined()
    })
  })

  // Test model methods and properties
  describe('Model Methods and Properties', () => {
    // TEST #1
    it('should create a new category with valid data', () => {
      const validCategory = new categoryModel({
        name: 'Electronics',
        slug: 'electronics'
      })
      expect(validCategory._id).toBeDefined()
      expect(validCategory.name).toBe('Electronics')
      expect(validCategory.slug).toBe('electronics')
    })
    // TEST #2
    it('should create category with minimal fields', () => {
      const category = new categoryModel({})
      expect(category._id).toBeDefined()
      expect(category.name).toBeUndefined()
      expect(category.slug).toBeUndefined()
    })
    // TEST #3
    it('should handle null values', () => {
      const category = new categoryModel({
        name: null,
        slug: null
      })
      expect(category._id).toBeDefined()
      expect(category.name).toBeNull()
      expect(category.slug).toBeNull()
    })
    // TEST #4
    it('should handle empty string values', () => {
      const category = new categoryModel({
        name: '',
        slug: ''
      })
      expect(category._id).toBeDefined()
      expect(category.name).toBe('')
      expect(category.slug).toBe('')
    })
  })
})

import fs from 'fs'


export const CATEGORY_DATA = [
  {
      name: "Electronics",
      slug: "electronics"
  },
  {
      name: "Book",
      slug: "book"
  },
  {
      name: "Clothing",
      slug: "clothing"
  }
]

export const ELECTRONICS_PRODUCT_DATA = [
  {
      name: "Laptop",
      slug: "laptop",
      description: "A powerful laptop",
      price: 1499.99,
      category: "Electronics",
      quantity: 30,
      photo: {
        data: fs.readFileSync("./test-data/images/electronics/laptop.jpeg"),
        contentType: "image/jpeg",
      },
      shipping: true,
  },
  {
      name: "Smartphone",
      slug: "smartphone",
      description: "A high-end smartphone",
      price: 999.99,
      category: "Electronics",
      quantity: 50,
      photo: {
        data: fs.readFileSync("./test-data/images/electronics/smartphone.jpeg"),
        contentType: "image/jpeg",
      },
      shipping: true,
  }
]

export const USER_DATA = {
  name: "John Doe",
  email: "test@example.com",
  password: "password123",
  phone: "1234567890",
  address: "123 Street",
  DOB: "2000-01-01",
  answer: "Football"
}
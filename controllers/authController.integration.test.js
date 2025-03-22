import express from "express";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import router from "../routes/authRoute";
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";
import productModel from "../models/productModel";
import request from "supertest";
import "dotenv/config";

jest.spyOn(console, 'log').mockImplementation(() => {});

const users = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: "user A",
    email: "A@example.com",
    password: "password123",
    phone: "AAAA",
    address: "AAAA",
    answer: "AAAA",
    role: 1,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "user B",
    email: "b@example.com",
    password: "password456",
    phone: "BBBB",
    address: "BBBB",
    answer: "BBBB",
    role: 0,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "user Empty",
    email: "empty@example.com",
    password: "password0000",
    phone: "0000",
    address: "0000",
    answer: "0000",
    role: 0,
  },
];

const products = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Product A",
    slug: "product-a",
    description: "AAAA",
    price: 100,
    category: new mongoose.Types.ObjectId(),
    quantity: 10,
    shipping: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Product B",
    slug: "product-b",
    description: "BBBB",
    price: 200,
    category: new mongoose.Types.ObjectId(),
    quantity: 5,
    shipping: false,
  },
];

const orders = [
  {
    _id: new mongoose.Types.ObjectId(),
    products: [products[0]._id, products[1]._id],
    payment: {},
    buyer: users[0]._id,
    status: "Processing",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    products: [products[1]._id],
    payment: {},
    buyer: users[1]._id,
    status: "Shipped",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    products: [products[0]._id],
    payment: {},
    buyer: users[0]._id,
    status: "Not Process",
  },
];

jest.mock("../helpers/authHelper", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashpassword123")
}));
const app = express();
app.use(express.json());
app.use("/", router);

const addAuthorization = (request, userId) => {
  const token = JWT.sign({ _id: userId }, process.env.JWT_SECRET)
  request.set("Authorization", `${token}`);
  return request
}

describe("updateProfileController integration test", () => {
  let mongoServer, userId
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });
  beforeEach(async () => {
    await userModel.deleteMany({});
    await orderModel.deleteMany({});
    await userModel.create({
      name: "olduser",
      password: "oldpw123",
      email: "old@email.com",
      phone: "1234",
      address: "old address",
      answer: "old ans"
    })
    let user = await userModel.findOne({});
    userId = user._id;
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("PUT /profile should return 200 with profile updated", async () => {
    const updatedProfle = {
      name: "newuser",
      password: "newpw123",
      phone: "5678",
      address: "new address",
    };
    const response = await addAuthorization(
      request(app).put("/profile").send(updatedProfle),
      userId
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser: expect.objectContaining({
        name: updatedProfle.name,
        password: "hashpassword123",
        phone: updatedProfle.phone,
        address: updatedProfle.address,
      }),
    });
  });

  it("PUT /profile should return error when thrown", async () => {
    const updatedProfle = {
      name: "newuser",
      password: "newpw123",
      phone: "5678",
      address: "new address",
    };
    const response = await addAuthorization(
      request(app).put("/profile").send(updatedProfle),
      0
    );
    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Error While Update profile",
      })
    );
  });
});

describe("OrdersController integration test", () => { //Includes getOrdersController, getAllOrdersController, orderStatusController
  let mongoServer, userId
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await userModel.create(users);
    await productModel.create(products);
    await orderModel.create(orders);
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("GET /orders should return all of the user orders", async () => {
    const res = await addAuthorization(request(app).get("/orders"), users[0]._id);
    expect(res.status).toBe(200);
    const orders = res.body; //Since body will be long only test for key parts of the orders
    expect(orders).toHaveLength(2); //User A should only have 2 orders
    orders.forEach((order) => {
      if (order.status == "Processing") {
        expect(order.products).toHaveLength(2);
      } else {
        expect(order.products).toHaveLength(1);
      }
      expect(order.buyer.name).toBe("user A");
    });
  });

  it("GET /orders should return empty if no orders", async () => {
    const res = await addAuthorization(request(app).get("/orders"), users[2]._id);
    expect(res.status).toBe(200);
    const orders = res.body;
    expect(orders).toHaveLength(0);
  });

  it("GET /orders should return error when thrown", async () => {
    const res = await addAuthorization(request(app).get("/orders"), 0);
    expect(res.status).toBe(500);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Error While Getting Orders",
      })
    );
  });

  it("GET /all-orders should return all of the orders", async () => {
    const res = await addAuthorization(request(app).get("/all-orders"), users[0]._id);
    expect(res.status).toBe(200);
    const orders = res.body; //Since body will be long only test for key parts of the orders
    expect(orders).toHaveLength(3);
    orders.forEach((order) => {
      if (order.status == "Processing") {
        expect(order.products).toHaveLength(2);
        expect(order.buyer.name).toBe("user A");
      } else if (order.status == "Shipped") {
        expect(order.products).toHaveLength(1);
        expect(order.buyer.name).toBe("user B");
      } else {
        expect(order.products).toHaveLength(1);
        expect(order.buyer.name).toBe("user A");
      }
    });
  });

  it("GET /all-orders should return error when non admin", async () => {
    const res = await addAuthorization(request(app).get("/all-orders"), users[1]._id);
    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Unauthorized Access",
      })
    );
  });

  it("PUT /order-status should update the order status successfully", async () => {
    const res = await addAuthorization(request(app).put("/order-status/" + orders[0]._id)
      .send({ status: "shipped" }),
      users[0]._id);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("shipped");
  });

  it("PUT /order-status should throw error if non admin", async () => {
    const res = await addAuthorization(request(app).put("/order-status/" + orders[1]._id)
      .send({ status: "shipped" }),
      users[1]._id);
    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Unauthorized Access",
      })
    );
  });
});
import { jest } from "@jest/globals";
import { forgotPasswordController, getAllOrdersController, getOrdersController, loginController, orderStatusController, registerController, testController, updateProfileController } from "./authController";
import userModel from "../models/userModel";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js");
jest.mock("jsonwebtoken");
jest.mock("../models/orderModel.js");

describe("Register Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "John Doe",
        email: "invalid email",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
        answer: "Football",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });
  test("Missing name", async () => {
    req.body.name = null;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Name is Required" });
  })

  test("Missing email", async () => {
    req.body.email = null;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  })


  test("Missing password", async () => {
    req.body.password = null;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required and of at least 6 characters" });
  })

  test("Password.length < 6", async () => {
    req.body.password = "1234";
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required and of at least 6 characters" });
  })

  test("Missing phone", async () => {
    req.body.phone = null;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  })

  test("Missing Address", async () => {
    req.body.address = null;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  })

  test("Missing Answer", async () => {
    req.body.answer = null;
    await registerController(req, res);
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  })

  test("user model is not saved for invalid email", async () => {

    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
  });

  test("User Model not saved for existing user", async () => {
    req.body.email = "test@gmail.com";

    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue("Something Here");
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("User Model saved for new user", async () => {
    req.body.email = "test@gmail.com";

    // specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("Error thrown when accessing database", async () => {
    req.body.email = "test@gmail.com";

    // Specify mock functionality
    userModel.findOne = jest.fn().mockRejectedValue(new Error("Error retrieving from Database"));
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  })

  test("Error thrown when saving to userModel", async () => {
    req.body.email = "test@gmail.com";

    // Specify mock functionality
    userModel.findOne = jest.fn().mockResolvedValue(null);
    userModel.prototype.save = jest.fn().mockRejectedValue(new Error("Error in saving to userModel"));

    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Login Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "Test@gmail.com",
        password: "12345678",
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("Reject login for missing password", async () => {
    req.body.password = null;

    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("Reject login for missing email", async () => {
    req.body.email = null;

    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("Reject login for user not found", async () => {

    userModel.findOne = jest.fn().mockResolvedValue(null);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Email is not registerd",
    });
  });

  test("Reject login for incorrect password", async () => {
      userModel.findOne = jest.fn().mockResolvedValue({_id: 1,
                                                      password: "12345678",
                                                      name: "Jane Doe",
                                                      email: "Test@gmail.com",
                                                      phone: 88888888,
                                                      address: "123 Football drive",
                                                      role: "Player",});
      comparePassword.mockResolvedValue(false);
      await loginController(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Invalid Password",
      });
  });

  test("Error thrown when accessing database", async () => {
    userModel.findOne = jest.fn().mockRejectedValue(new Error("Database error"));
    userModel.prototype.save = jest.fn();

    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("Successful Login", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({_id: 1,
      password: "12345678",
      name: "Jane Doe",
      email: "Test@gmail.com",
      phone: 88888888,
      address: "123 Football drive",
      role: "Player",});
    comparePassword.mockResolvedValue(true);

    JWT.sign = jest.fn().mockResolvedValue("");

    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      {
        success: true,
        message: "login successfully",
        user: {
          _id: 1,
          name: "Jane Doe",
          email: "Test@gmail.com",
          phone: 88888888,
          address: "123 Football drive",
          role: "Player",
        },
        token: "",
      });
  });
});

describe("Forget Password Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "Test@gmail.com",
        answer: "12345678",
        newPassword: "12345678",
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("Empty Email", async () => {
    req.body.email = null;
    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Empty Answer", async () => {
    req.body.answer = null;
    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Empty New Password", async () => {
    req.body.newPassword = null;
    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Reject if wrong email or answer", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("Error when accessing Database", async () => {
    userModel.findOne = jest.fn().mockRejectedValue(new Error("Database error"));
    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("Successfully Change of Password", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({email: "Test@gmail.com", _id: 1});
    hashPassword.mockResolvedValue("password");
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

    await forgotPasswordController(req, res);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("Test Controller Tests", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        email: "Test@gmail.com",
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("No errors on Test Controller", () => {
    testController(req, res);
    expect(res.send).toHaveBeenCalledWith("Protected Routes");
  });

  test("Error Thrown for test Controller", () => {
    res.send
      .mockImplementationOnce(() => {
        throw new Error("Error Thrown");
      });
    testController(req, res);
    expect(res.send).toHaveBeenCalledTimes(2);
  });
});

describe("Update Profile Controller Tests", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "Jane Doe",
        email: "Test@gmail.com",
        password: "12345678",
        address: "123 Football drive",
        phone: 88888888,
      },
      user: {
        _id: 1
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });
  test("Password of length < 6", async () => {
    req.body.password = "12345";
    userModel.findById = jest.fn().mockResolvedValue(null);

    await updateProfileController(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Passsword is required and is at least 6 characters long" });
  });

  test("Null password should be rejected", async () => {
    req.body.password = "";
    userModel.findById = jest.fn().mockResolvedValue(null);

    await updateProfileController(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Passsword is required and is at least 6 characters long" });
  });


  test("Error Accessing Database", async () => {
    userModel.findById = jest.fn().mockRejectedValue(new Error("Database Error"));

    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Succesful Update with no new details", async () => {
    req.body.name = null;
    req.body.address = null;
    req.body.phone = null;
    userModel.findById = jest.fn().mockResolvedValue({user: {name: "test", phone: "12345", "address": "nus drive"}});
    hashPassword.mockResolvedValue(null);
    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  })

  test("Successful Update with all new data", async () => {
    userModel.findById = jest.fn().mockResolvedValue(null);
    hashPassword.mockResolvedValue("123456");
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

    await updateProfileController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("Get Orders Controller Tests", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: {
        _id: 1
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test("Successful get of buyer orders", async () => {
    orderModel.find = jest.fn().mockReturnThis();
    orderModel.populate = jest.fn().mockReturnThis();

    await getOrdersController(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test("Error during database retrieval", async () => {  
    orderModel.find = jest.fn().mockImplementation(() => {
      throw new Error("Database Error");
    });
    orderModel.populate = jest.fn().mockReturnThis();

    await getOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("Error during population of extra data", async () => {
    orderModel.find = jest.fn().mockReturnThis();
    orderModel.populate = jest.fn().mockImplementation(() => {
      throw new Error("Database Error");
    });

    await getOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Get All Orders Controller Test", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test("Successfully get all orders", async () => {
    orderModel.find = jest.fn().mockReturnThis();
    orderModel.populate = jest.fn().mockReturnThis();
    orderModel.sort = jest.fn().mockReturnThis();

    await getAllOrdersController(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test("Error during database retrieval", async () => {  
    orderModel.find = jest.fn().mockImplementation(() => {
      throw new Error("Database Error");
    });
    orderModel.populate = jest.fn().mockReturnThis();
    orderModel.sort = jest.fn().mockReturnThis();


    await getAllOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("Error during population of extra data", async () => {
    orderModel.find = jest.fn().mockReturnThis();
    orderModel.populate = jest.fn().mockImplementation(() => {
      throw new Error("Database Error");
    });
    orderModel.sort = jest.fn().mockReturnThis();


    await getAllOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
  
  test("Error during population of extra data", async () => {
    orderModel.find = jest.fn().mockReturnThis();
    orderModel.populate = jest.fn().mockReturnThis();
    orderModel.sort = jest.fn().mockImplementation(() => {
      throw new Error("Database Error");
    });

    await getAllOrdersController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Order Status Controller Test", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {
        orderId: 1
      },
      body: {
        status: "true"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test("Successfully Updated Order", async () => {
    orderModel.findByIdAndUpdate = jest.fn().mockReturnThis();

    await orderStatusController(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test("Error during database Retrieval", async () => {
    orderModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error("Database Error"));

    await orderStatusController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  })
})
jest.mock("braintree", () => {
  return {
    BraintreeGateway: jest.fn(() => ({
      clientToken: {
				generate: jest.fn((_, callback) => callback(null, null))
      },
      transaction: {
        sale: jest.fn((_, callback) => callback(null, { success: true, transaction: { id: "fakeId" } })),
      },
    })),
    Environment: {
      Sandbox: "Sandbox",
    },
  };
});

jest.mock("mongoose", () => {
	return {
		Schema: jest.fn(),
		model: jest.fn(),
		connect: jest.fn(),
	};
});

jest.mock("../models/orderModel.js", () => {
  return jest.fn().mockImplementation(() => {
    return {
      save: jest.fn().mockResolvedValue({ _id: "fakeOrderId" }) // Mock save method
    };
  });
});

describe("braintreeTokenController", () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

  it("Should return a client token when generate is successful", async () => {
		// Setup
		jest.doMock("braintree", () => ({
      BraintreeGateway: jest.fn(() => ({
        clientToken: {
          generate: jest.fn((_, callback) => callback(null, { clientToken: "mockToken" })),
        },
      })),
      Environment: {
        Sandbox: "Sandbox",
      },
    }));

		const res = {
			send: jest.fn(),
			status: jest.fn().mockReturnThis(),
		};

		// Reimport
		const { braintreeTokenController } = require("./productController");

		// Test
		await braintreeTokenController({}, res);
		expect(res.send).toHaveBeenCalledWith({ clientToken: "mockToken" });
		await expect(braintreeTokenController({}, res)).resolves.not.toThrow();
  });

	it("Should return a 500 status when generate fails", async () => {
		// Setup
		jest.doMock("braintree", () => ({
			BraintreeGateway: jest.fn(() => ({
				clientToken: {
					generate: jest.fn((_, callback) => callback("error", null)),
				},
			})),
			Environment: {
				Sandbox: "Sandbox",
			},
		}));

		const res = {
			send: jest.fn(),
			status: jest.fn().mockReturnThis(),
		};

		// Reimport
		const { braintreeTokenController } = require("./productController");

		// Test
		await braintreeTokenController({}, res);
		expect(res.status).toHaveBeenCalledWith(500);
		await expect(braintreeTokenController({}, res)).resolves.not.toThrow();
	});

	it("Should log error when generate fails", async () => {
		// Setup
		jest.doMock("braintree", () => ({
			BraintreeGateway: jest.fn(() => ({
				clientToken: {
					generate: jest.fn((_, callback) => callback("error", null)),
				},
			})),
			Environment: {
				Sandbox: "Sandbox",
			},
		}));

		const res = {
			send: jest.fn().mockImplementation(() => { throw new Error("mockError"); }),
			status: jest.fn().mockReturnThis(),
		};

		const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

		// Reimport
		const { braintreeTokenController } = require("./productController");

		// Test
		await braintreeTokenController({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
		expect(consoleSpy).toHaveBeenCalledWith(new Error("mockError"));

		// Cleanup
		consoleSpy.mockRestore();
	});
});

describe("brainTreePaymentController", () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it("Should return a transaction id when sale is successful", async () => {
		// Setup
		jest.doMock("braintree", () => ({
			BraintreeGateway: jest.fn(() => ({
				transaction: {
					sale: jest.fn((_, callback) => callback(null, "success")),
				},
			})),
			Environment: {
				Sandbox: "Sandbox",
			},
		}));

		const req = {
			body: {
				nonce: "mockNonce",
				cart: [{ price: 10 }],
			},
			user: { _id: "mockId" },
		};

		const res = {
			send: jest.fn().mockReturnThis(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};

		// Reimport
		const { brainTreePaymentController } = require("./productController");

		// Test
		await brainTreePaymentController(req, res);
		expect(res.json).toHaveBeenCalledWith({ ok: true });
	});

	it("Should log error and return 500 when sale fails", async () => {
		// Setup
		jest.doMock("braintree", () => ({
			BraintreeGateway: jest.fn(() => ({
				transaction: {
					sale: jest.fn((_, callback) => callback("mockError", null)),
				},
			})),
			Environment: {
				Sandbox: "Sandbox",
			},
		}));

		const req = {
			body: {
				nonce: "mockNonce",
				cart: [{ price: 10 }],
			},
			user: { _id: "mockId" },
		};

		const res = {
			send: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};

		const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

		// Reimport
		const { brainTreePaymentController } = require("./productController");

		// Test
		await brainTreePaymentController(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(consoleSpy).toHaveBeenCalledWith("mockError");

		// Cleanup
		consoleSpy.mockRestore();
	});

	it("Should log error when sale method fails", async () => {
		// Setup
		jest.doMock("braintree", () => ({
			BraintreeGateway: jest.fn(() => ({
				transaction: {
					sale: jest.fn((_, callback) => { throw new Error("mockError") }),
				},
			})),
			Environment: {
				Sandbox: "Sandbox",
			},
		}));

		const req = {
			body: {
				nonce: "mockNonce",
				cart: [{ price: 10 }],
			},
			user: { _id: "mockId" },
		};

		const res = {
			send: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};

		const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

		// Reimport
		const { brainTreePaymentController } = require("./productController");

		// Test
		await brainTreePaymentController(req, res);
		expect(consoleSpy).toHaveBeenCalledWith(new Error("mockError"));

		// Cleanup
		consoleSpy.mockRestore();
	});
});
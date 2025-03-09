### How to Guide

1. Clone the repository.
```
git clone https://github.com/cs4218/cs4218-2420-ecom-project-team06.git
```

2. In the backend directory, install the backend dependencies.
```
npm install
```

3. Navigate to the frontend directory and install the frontend dependencies.
```
cd client
npm install
```
4. Create a .env file in the root directory.
```
PORT = 6060
DEV_MODE = development
MONGO_URL = <Insert your MongoDB database URL>
JWT_SECRET = <Insert your JWT secret key>
BRAINTREE_MERCHANT_ID = <Insert your BrainTree merchant ID>
BRAINTREE_PUBLIC_KEY = <Insert your BrainTree public key>
BRAINTREE_PRIVATE_KEY = <Insert your Braintree private key>
```

5. To start the webapp, run the command
```
npm run dev
```

### Running Unit Tests
To run an unit test file, run the following command in the root directory.
```
npm test -- <Path to Test File>
#e.g. npm test -- Register.test.js
```

To run all tests, run this command in the root directory.
```
npm test
```

### CI
We have configured Github Actions to run Jest on Github

<To do - Insert Link>

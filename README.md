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

### Running Unit/Integration Tests
To run an unit test file, run the following command in the root directory.
```
npm test -- <Path to Test File>
#e.g. npm test -- Register.test.js
```
To run all frontend unit tests, run this command in the root directory.
```
npm run test:frontend
```

To run all backend unit tests, run this command in the root directory.
```
npm run test:backend
```

To run all tests, run this command in the root directory.
```
npm test
```

> [!NOTE]
> Some integration tests will spin up a server, please ensure you do not have another server instance running on your device. 

### Running UI Tests
#### Prerequisites
1. Update the `.env` file with the `MONGO_URL` of your test database.
2. Run `npm run dev` to start the local server.

To run an unit test file, run these command in the root directory.

```
# For playwright test results in HTML format
npx playwright test <Path to Test File>

# For playwright test results in UI mode
npx playwright test <Path to Test File> -- ui
```

To run all UI tests in the `tests` folder, run this command in the root directory.
```
# Runs all UI tests and presents playwright test results in UI mode
npm run test:e2e
```

### CI
We have configured Github Actions to run Jest on Github

Run link:
https://github.com/cs4218/cs4218-2420-ecom-project-team06/actions/runs/13751806285/job/38453685571

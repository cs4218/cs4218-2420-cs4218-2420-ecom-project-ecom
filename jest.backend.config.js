export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",
  transform: {},

  // which test to run
  //testMatch: ["<rootDir>/controllers/*.test.js"],

  testMatch: ["<rootDir>/models/*.test.js", "<rootDir>/controllers/*.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**", "models/**"],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
      lines: 90,
      functions: 90,
    },
  },
};

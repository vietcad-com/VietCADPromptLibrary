/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "api",
      testMatch: ["<rootDir>/src/**/*.api.test.ts"],
      transform: { "^.+\\.tsx?$": "ts-jest" },
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      testEnvironment: "node",
    },
    {
      displayName: "ui",
      testMatch: ["<rootDir>/src/**/*.ui.test.tsx"],
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx", esModuleInterop: true, module: "commonjs", moduleResolution: "node" } }],
      },
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      testEnvironment: "jsdom",
    },
  ],
};

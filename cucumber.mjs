export default {
  tags: "not @e2e",
  import: [
    "./features/support/tsx-register.js",
    "features/support/**/*.ts",
    "features/step_definitions/**/*.ts",
  ],
};

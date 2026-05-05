import nextPlugin from "eslint-config-next";

export default [
  ...nextPlugin,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

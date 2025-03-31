import terser from "@rollup/plugin-terser";

export default {
  input: "dist/index.js",
  output: [
    {
      file: "dist/bundle.cjs.js",
      format: "cjs",
    },
    {
      file: "dist/bundle.esm.js",
      format: "esm",
    },
  ],
  external: ["react", "socket.io-client", "@tanstack/react-query"],
  plugins: [terser()],
};

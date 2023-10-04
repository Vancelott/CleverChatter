/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // See https://webpack.js.org/configuration/resolve/#resolvealias
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      "bcrypt",
      "@google-cloud/dialogflow",
      "google-cloud/dialogflow",
      "@xenova/transformers",
      "xenova/transformers",
      "sharp",
      "onnxruntime-node",
    ],
    serverActions: true,
  },
};

module.exports = nextConfig;

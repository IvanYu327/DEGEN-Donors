/** @type {import('next').NextConfig} */
const nextConfig = {
  // prevent double render on dev mode, which causes 2 frames to exist
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "*",
        protocol: "http",
      },
      {
        hostname: "*",
        protocol: "https",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    // Add a rule to handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          outputPath: "static/fonts/", // or any other desired output path
          publicPath: "/_next/static/fonts/", // public path to access the fonts
        },
      },
    });

    return config;
  },
};

export default nextConfig;

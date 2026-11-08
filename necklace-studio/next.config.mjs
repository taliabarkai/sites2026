/** @type {import('next').NextConfig} */
const nextConfig = {
  // Native / UMD packages stay as plain Node requires on the server.
  serverExternalPackages: ['sharp', '@gltf-transform/core', 'clipper-lib', 'earcut'],
  // The engine reads its extracted product data from disk at runtime.
  outputFileTracingIncludes: { '/api/**': ['./engine/products/**/data/*.json'] },
};
export default nextConfig;

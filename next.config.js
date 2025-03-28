/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用输出跟踪以支持静态导出
  output: 'standalone',
  
  // 图像域名配置
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // 环境变量配置
  env: {
    DOUBAO_API_URL: process.env.DOUBAO_API_URL,
    DOUBAO_APPID: process.env.DOUBAO_APPID,
    DOUBAO_ACCESS_TOKEN: process.env.DOUBAO_ACCESS_TOKEN,
    DOUBAO_UID: process.env.DOUBAO_UID,
    DOUBAO_CLUSTER: process.env.DOUBAO_CLUSTER,
  },
}

module.exports = nextConfig 
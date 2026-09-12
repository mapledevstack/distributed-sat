import "dotenv/config"

export const getRedisConnection = () => ({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
})

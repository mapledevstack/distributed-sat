import cors from "cors"
import express from "express"
import { errorHandler, notFound } from "./middlewares/index.js"
import solveRoutes from "./routes/solve.routes.js"

const app = express()
app.use(express.json())
app.use(cors())

app.get("/health", (_req, res) => {
  res.json({ status: "Healthy" })
})

app.use("/api", solveRoutes)

app.use(notFound)
app.use(errorHandler)

export default app

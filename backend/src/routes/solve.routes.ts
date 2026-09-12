import { Router } from "express"
import {
  getSolveChunksController,
  getSolveController,
  solveController,
} from "../controllers/solve.controller.js"
import { rateLimit } from "../middlewares/rateLimit.js"

const router = Router()

router.post("/solve", rateLimit, solveController)
router.get("/solve/:jobId", getSolveController)
router.get("/solve/:jobId/chunks", getSolveChunksController)

export default router

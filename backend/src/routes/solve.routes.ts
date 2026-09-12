import { Router } from "express"
import {
  getSolveController,
  solveController,
} from "../controllers/solve.controller.js"
import { rateLimit } from "../middlewares/rateLimit.js"

const router = Router()

router.post("/solve", rateLimit, solveController)
router.get("/solve/:jobId", getSolveController)

export default router

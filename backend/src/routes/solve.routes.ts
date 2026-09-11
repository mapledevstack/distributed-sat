import { Router } from "express"
import {
  getSolveController,
  solveController,
} from "../controllers/solve.controller.js"

const router = Router()

router.post("/solve", solveController)
router.get("/solve/:jobId", getSolveController)

export default router

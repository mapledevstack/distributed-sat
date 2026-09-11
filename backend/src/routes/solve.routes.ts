import { Router } from "express"
import { solveController } from "../controllers/solve.controller.js"

const router = Router()

router.post("/solve", solveController)

export default router

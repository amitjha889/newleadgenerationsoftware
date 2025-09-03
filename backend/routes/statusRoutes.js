import express from "express";
import { Router } from "express";

import {
  createStatus,
  getAllStatuses,
  getStatusById,
  updateStatus,
  deleteStatus,
} from "../controllers/statusControllers.js";

const router = Router();

router.post("/", createStatus);   
router.get("/", getAllStatuses);    
router.get("/:id", getStatusById);  
router.put("/:id", updateStatus);  
router.delete("/:id", deleteStatus); 

export default router;

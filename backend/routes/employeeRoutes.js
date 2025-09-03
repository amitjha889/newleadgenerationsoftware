import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createEmployee, getEmployees, upload, singleEmployee, assignBatch, getEmployeeById, editEmployee, getEmployeeData, getAssignedCustomersByStatus, singleTargertEmployee, getCustomerDetailsByEmployeeId } from "../controllers/employeeController.js";

const router = Router();

router.get("/get",  getEmployees);

router.post("/add", upload.single("avatar"),createEmployee);

router.get("/single", singleEmployee);

router.get("/target", singleTargertEmployee);

router.get("/status", getEmployeeData);

router.post("/assign",  assignBatch);

router.get("/:id", getEmployeeById);

router.put("/edit/:id", upload.single("avatar"), editEmployee);

router.get("/status/data",  getAssignedCustomersByStatus);

router.get("/customer-details/:id", getCustomerDetailsByEmployeeId);


export default router;

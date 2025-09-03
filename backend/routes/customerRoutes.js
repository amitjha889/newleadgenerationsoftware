import { Router } from "express";
import multer from "multer";
import { getCustomers, uploadExcel, getBatches, getCustomersByBatch, getAssignedCustomers, changeStatus, leadData, dashboardBoxData, getLeadHistoryByCustomerId, getName, addBankDetails, getBankDetails, earning, getStatusByDataForEmployee, getDailyDemos, getStatusByDataForEmployeeCurrentDate, earningData } from "../controllers/customerController.js";


const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/add-bank", addBankDetails);

router.post("/upload", upload.single("file"), uploadExcel);

router.get("/get-data", getCustomers);

router.get("/get-users", getName);

router.get("/get-batches", getBatches);

router.get("/wise/:batchId", getCustomersByBatch);

router.get("/assigned", getAssignedCustomers);

router.get("/get-lead-data", leadData);

router.get("/fetch-customer-status", dashboardBoxData);

router.put("/status/:id", changeStatus);

router.get("/lead/:id", getLeadHistoryByCustomerId);

router.get("/get/:clientId", getBankDetails);

router.get("/get-status-employee", getStatusByDataForEmployee);

router.get("/get-status-employee-current", getStatusByDataForEmployeeCurrentDate);


router.get('/daily-demos', getDailyDemos);

router.get('/earning-data', earningData);

router.post("/add", earning); 





export default router;

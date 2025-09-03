import { Router } from "express";
import { login } from "../controllers/authControllers.js";

const authrouter = Router();
authrouter.post("/login", login);

export default authrouter;

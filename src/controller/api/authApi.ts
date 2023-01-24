import { Request, Response, Router } from "express";

export const authApiRouter = Router();
const router = Router();
authApiRouter.use("/auth", router);

//TODO: create authentication for users and replace endpoints with :username params to get said username from bearer token

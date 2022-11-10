import { Router } from "express";
import { actorApiRouter } from "./actorApi";
import { actorFedRouter } from "./actorFed";

export const apiRoutes = Router();

apiRoutes.use(actorApiRouter);

export const fedRoutes = Router();

fedRoutes.use(actorFedRouter);

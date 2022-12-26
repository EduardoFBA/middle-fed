import { Router } from "express";
import { userApiRouter } from "./controller/api/userApi";
import { userFedRouter } from "./controller/activitypub/userFed";
import { wellKnownRouter } from "./controller/well-known/webfinger";

export const apiRoutes = Router();
apiRoutes.use(userApiRouter);

export const fedRoutes = Router();
fedRoutes.use(userFedRouter);

export const wellKnownRoutes = Router();
wellKnownRouter.use(wellKnownRouter);

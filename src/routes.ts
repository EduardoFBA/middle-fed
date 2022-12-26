import { Router } from "express";
import { userApiRouter } from "./api/userApi";
import { userFedRouter } from "./activitypub/userFed";
import { wellKnownRouter } from "./well-known/webfinger";

export const apiRoutes = Router();
apiRoutes.use(userApiRouter);

export const fedRoutes = Router();
fedRoutes.use(userFedRouter);

export const wellKnownRoutes = Router();
wellKnownRouter.use(wellKnownRouter);

import { Router } from "express";
import { activityFedRouter } from "./controller/activitypub/activityFed";
import { publicFedRouter } from "./controller/activitypub/publicFed";
import { userFedRouter } from "./controller/activitypub/userFed";
import { activityApiRouter } from "./controller/api/activityApi";
import { searchApiRouter } from "./controller/api/searchApi";
import { timelineApiRouter } from "./controller/api/timelineApi";
import { userApiRouter } from "./controller/api/userApi";
import { wellKnownRouter } from "./controller/well-known/webfinger";

export const apiRoutes = Router();
apiRoutes.use(activityApiRouter);
apiRoutes.use(searchApiRouter);
apiRoutes.use(timelineApiRouter);
apiRoutes.use(userApiRouter);

export const fedRoutes = Router();
fedRoutes.use(activityFedRouter);
fedRoutes.use(publicFedRouter);
fedRoutes.use(userFedRouter);

export const wellKnownRoutes = Router();
wellKnownRouter.use(wellKnownRouter);

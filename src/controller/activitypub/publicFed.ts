import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import { inbox } from "../../service/user.service";
import { list } from "../../utils";

export const publicFedRouter = Router();
const router = Router();
publicFedRouter.use("/public", router);

router.get("/inbox", async (req: Request, res: Response) => {
  res.send(await list(AP.ActivityTypes.CREATE));
});

router.post("/inbox", async (req: Request, res: Response) => {
  console.log("sharedInbox");
  inbox(req, res);
});

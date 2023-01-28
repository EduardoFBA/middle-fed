import { Request, Response, Router } from "express";
import { getWebfinger } from "../../utils";

export const wellKnownRouter = Router();

wellKnownRouter.get("/webfinger", async (req: Request, res: Response) => {
  if (req.query.resource) {
    const webfinger = await getWebfinger(req.query.resource as string);
    res.send(webfinger);
    return;
  }

  res.send({ error: "No account provided" });
});

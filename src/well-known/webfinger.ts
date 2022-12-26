import { Request, Response, Router } from "express";
import { getWebfinger } from "../utils";

export const wellKnownRouter = Router();

wellKnownRouter.get("/webfinger", async (req: Request, res: Response) => {
  if (req.query.resource) {
    const domain = req.app.get("localDomain");
    res.send(await getWebfinger(req.query.resource as string, domain));
    return;
  }

  res.send({ error: "No account provided" });
});

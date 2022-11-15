import { Request, Response, Router } from "express";
import { webfinger, search, getWebfinger } from "./utils";

export const actorFedRouter = Router();

actorFedRouter.get("/u/:username", async (req: Request, res: Response) => {
  const domain = req.app.get("localDomain");
  res.send(
    await search("actor", "id", `https://${domain}/u/${req.params.username}`)
  );
});

actorFedRouter.get("/u/:username/outbox", (req: Request, res: Response) => {
  res.send({ dvklsn: req.params.username });
});

actorFedRouter.get("/.well-known/webfinger", webfinger);

actorFedRouter.get("/test", async (req: Request, res: Response) => {
  res.send(await getWebfinger(req.body.resource, req.app.get("localDomain")));
});

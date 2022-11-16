import { Request, Response, Router } from "express";
import { search, getWebfinger, save } from "./utils";

export const actorFedRouter = Router();

actorFedRouter.get("/u/:username", async (req: Request, res: Response) => {
  const domain = req.app.get("localDomain");
  const result = await search(
    "actor",
    "id",
    `https://${domain}/u/${req.params.username}`
  );
  if (result.length) {
    res.send(result[0]);
  } else throw "No account found";
});

actorFedRouter.get("/u/:username/followers", (req: Request, res: Response) => {
  res.send({ dvklsn: req.params.username });
});

actorFedRouter.get("/u/:username/inbox", (req: Request, res: Response) => {
  save("inbox", req.body);
});

actorFedRouter.get("/u/:username/outbox", (req: Request, res: Response) => {
  res.send({ dvklsn: req.params.username });
});

actorFedRouter.get(
  "/.well-known/webfinger",
  async (req: Request, res: Response) => {
    if (req.query.resource) {
      const domain = req.app.get("localDomain");
      res.send(await getWebfinger(req.query.resource as string, domain));
      return;
    }

    throw "No account provided";
  }
);

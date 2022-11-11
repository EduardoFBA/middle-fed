import express, { Request, Response, Router } from "express";
import { save, search } from "./utils";

export const actorFedRouter = Router();

actorFedRouter.get(
  "/u/:username/actor.json",
  async (req: Request, res: Response) => {
    const domain = req.app.get("domain");
    res.send(
      await search("actor", "id", `https://${domain}/u/${req.params.username}`)
    );
  }
);

actorFedRouter.get("/u/:username/outbox", (req: Request, res: Response) => {
  res.send({ dvklsn: req.params.username });
});

actorFedRouter.get(
  "/.well-known/webfinger",
  async (req: Request, res: Response) => {
    if ("string" === typeof req.query.resource) {
      const acct: string = req.query.resource;
      res.send(await search("webfinger", "subject", acct));
    }
  }
);

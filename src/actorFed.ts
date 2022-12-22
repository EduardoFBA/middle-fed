import { Request, Response, Router } from "express";
import { Readable } from "stream";
import { search, getWebfinger, save, list } from "./utils";
import { createAcceptActivity } from "./utils-json";

export const actorFedRouter = Router();

actorFedRouter.get(
  "/authorize_interaction",
  async (req: Request, res: Response) => {
    const buf = await buffer(req);
    const rawBody = buf.toString("utf8");
    console.log("authorize interaction", rawBody);
    res.send(
      createAcceptActivity(
        `${req.params.uri}@${req.app.get("localDomain")}`,
        req.body.target,
        "Follow"
      )
    );
  }
);

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

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

actorFedRouter.get(
  "/u/:username/inbox",
  async (req: Request, res: Response) => {
    res.send(await list("inbox"));
  }
);

actorFedRouter.post(
  "/u/:username/inbox",
  async (req: Request, res: Response) => {
    const buf = await buffer(req);
    const rawBody = buf.toString("utf8");
    console.log("authorize interaction", rawBody);
    if (req.body) {
      await save("inbox", req.body);
      res.send(
        createAcceptActivity(
          `${req.params.username}@${req.app.get("localDomain")}`,
          req.body.target,
          "Follow"
        )
      );
    } else {
      //error
      res.send("ERROR");
    }
  }
);

actorFedRouter.get("/u/:username/outbox", (req: Request, res: Response) => {
  res.send({ outbox: req.params.username });
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

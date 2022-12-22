import { AP } from "activitypub-core-types";
import { randomUUID } from "crypto";
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
    // const message: AP.Activity = <AP.Activity>JSON.parse(rawBody);
    const message: AP.Activity = <AP.Activity>req.body;

    if (message.type == "Follow") {
      const followMessage: AP.Follow = <AP.Follow>message;
      if (followMessage.id == null) return;

      // const collection = db.collection('followers');

      // const actorID = (<URL>followMessage.actor).toString();
      // const followDocRef = collection.doc(actorID.replace(/\//g, "_"));
      // const followDoc = await followDocRef.get();

      // if (followDoc.exists) {
      //   console.log("Already Following")
      //   return res.end('already following');
      // }

      console.log("followMessage", followMessage);
      await save("followers", followMessage);

      const acceptRequest = {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: `https://${req.app.get("localDomain")}/${randomUUID()}`,
        type: "Accept",
        actor: `https://${req.app.get("localDomain")}/u/${req.params.username}`,
        object: followMessage,
      };

      // const accept = createAcceptActivity(
      //   `${req.params.username}@${req.app.get("localDomain")}`,
      //   req.body.target,
      //   "Follow"
      // );

      console.log("accept", acceptRequest);
      await save("accept", acceptRequest);

      res.send(acceptRequest);
    }

    // if (message.type == "Undo") {
    //   // Undo a follow.
    //   const undoObject: AP.Undo = <AP.Undo>message;
    //   if (undoObject == null || undoObject.id == null) return;
    //   if (undoObject.object == null) return;
    //   if ("actor" in undoObject.object == false && (<CoreObject>undoObject.object).type != "Follow") return;

    //   const docId = undoObject.actor.toString().replace(/\//g, "_");
    //   const res = await db.collection('followers').doc(docId).delete();

    //   console.log("Deleted", res)
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

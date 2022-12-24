import { AP } from "activitypub-core-types";
import { randomUUID } from "crypto";
import { Request, Response, Router } from "express";
import { Readable } from "stream";
import {
  search,
  getWebfinger,
  save,
  list,
  getActorInfo,
  sendSignedRequest,
} from "./utils";

export const actorFedRouter = Router();

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
    console.log("post inbox");
    const buf = await buffer(req);
    const rawBody = buf.toString("utf8");
    const message: AP.Activity = <AP.Activity>JSON.parse(rawBody);

    if (message.type == "Follow") {
      const followMessage: AP.Follow = <AP.Follow>message;
      if (followMessage.id == null) return;

      console.log("followMessage", followMessage);
      await save("followers", followMessage);

      const localDomain = req.app.get("localDomain");

      const accept = <AP.Accept>{};
      accept["@context"] = "https://www.w3.org/ns/activitystreams";
      accept.type = AP.ActivityTypes.ACCEPT;
      accept.id = new URL(`https://${localDomain}/${randomUUID()}`);
      accept.actor = new URL(`https://${localDomain}/u/${req.params.username}`);
      accept.object = followMessage;

      console.log("accept", accept);
      await save("accept", JSON.parse(JSON.stringify(accept)));

      const actorInfo: any = await getActorInfo(
        (<URL>followMessage.actor).toString() + ".json"
      );

      console.log("localactorinfo", accept.actor.toString());
      const localActorInfo: any = await getActorInfo(accept.actor.toString());

      console.log("send signed request", actorInfo);
      const response = await sendSignedRequest(
        <URL>actorInfo.inbox,
        "POST",
        accept,
        localActorInfo.publicKey.id,
        localActorInfo.privateKey
      );
      console.log("response", response);
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

    res.end("inbox finish");
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

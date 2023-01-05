import { AP } from "activitypub-core-types";
import { randomUUID } from "crypto";
import { Request, Response, Router } from "express";
import { Readable } from "stream";
import {
  getActorInfo,
  list,
  save,
  search,
  sendSignedRequest,
} from "../../utils";
import { createAcceptActivity } from "../../utils-json";

export const userFedRouter = Router();
const router = Router();
userFedRouter.use("/u", router);

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

router.get("/:username", async (req: Request, res: Response) => {
  const isJson = req.params.username.endsWith(".json");
  const username = isJson
    ? req.params.username.slice(0, -5)
    : req.params.username;

  const result = await search("actor", "preferredUsername", username);
  if (!result.length) res.send({ error: "no account found" });
  else {
    if (isJson) {
      res.send(result[0]);
    } else {
      res.sendFile("user.html", { root: "src/view" }, (err) => {
        if (err) res.send(err);
      });
    }
  }
});

router.get("/:username/followers", async (req: Request, res: Response) => {
  res.send(
    await search(
      "followers",
      "object",
      `https://middle-fed.onrender.com/u/${req.params.username}`
    )
  );
});

router.get("/:username/inbox", async (req: Request, res: Response) => {
  res.send(await list("inbox"));
});

router.post("/:username/inbox", async (req: Request, res: Response) => {
  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");
  const message: AP.Activity = <AP.Activity>JSON.parse(rawBody);

  if (message.type == AP.ActivityTypes.FOLLOW) {
    const followMessage: AP.Follow = <AP.Follow>message;
    if (followMessage.id == null) return;

    console.log("followMessage", followMessage);
    await save("followers", followMessage);

    const localDomain = req.app.get("localDomain");

    const accept = createAcceptActivity(
      req.params.username,
      localDomain,
      followMessage
    );

    console.log("accept", accept);
    await save("accept", JSON.parse(JSON.stringify(accept)));

    const userInfo = await getActorInfo(
      (<URL>followMessage.actor).toString() + ".json"
    );

    const localUserInfo: any = await getActorInfo(
      accept.actor.toString() + ".json"
    );
    console.log("LOCAL USER INFO", localUserInfo);

    console.log("send signed request", userInfo);
    const response = await sendSignedRequest(
      <URL>userInfo.inbox,
      "POST",
      accept,
      localUserInfo.publicKey.id,
      localUserInfo.privateKey
    );
    console.log("response", response);
  }

  // if (message.type == "Undo") {
  //   // Undo a follow.
  //   const undoObject: AP.Undo = <AP.Undo>message;
  //   if (undoObject == null || undoObject.id == null) return;
  //   if (undoObject.object == null) return;
  //   if ("user" in undoObject.object == false && (<CoreObject>undoObject.object).type != "Follow") return;

  //   const docId = undoObject.user.toString().replace(/\//g, "_");
  //   const res = await db.collection('followers').doc(docId).delete();

  //   console.log("Deleted", res)

  res.end("inbox finish");
});

router.get("/:username/outbox", (req: Request, res: Response) => {
  res.send({ outbox: req.params.username });
});

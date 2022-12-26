import { AP } from "activitypub-core-types";
import { randomUUID } from "crypto";
import { Request, Response, Router } from "express";
import { Readable } from "stream";
import { getUserInfo, list, save, search, sendSignedRequest } from "../utils";

export const userFedRouter = Router();

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

userFedRouter.get("/u/:username", async (req: Request, res: Response) => {
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

userFedRouter.get("/u/:username.json", async (req: Request, res: Response) => {
  const result = await search(
    "actor",
    "preferredUsername",
    req.params.username
  );
  if (result.length) res.send(result[0]);
  else res.send({ error: "no account found json" });
});

userFedRouter.get("/u/:username/followers", (req: Request, res: Response) => {
  res.send({ dvklsn: req.params.username });
});

userFedRouter.get("/u/:username/inbox", async (req: Request, res: Response) => {
  res.send(await list("inbox"));
});

userFedRouter.post(
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

      const userInfo: any = await getUserInfo(
        (<URL>followMessage.actor).toString() + ".json"
      );

      console.log("localuserinfo", accept.actor.toString());
      const localUserInfo: any = await getUserInfo(accept.actor.toString());

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
  }
);

userFedRouter.get("/u/:username/outbox", (req: Request, res: Response) => {
  res.send({ outbox: req.params.username });
});

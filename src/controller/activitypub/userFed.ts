import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import { Readable } from "stream";
import {
  getActorInfo,
  list,
  removeActivity,
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

/**
 * Gets user's page or info as JSON
 * @param username
 */
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

/**
 * Gets user's followers list
 * @param username
 */
router.get("/:username/followers", async (req: Request, res: Response) => {
  res.send(
    await search(
      "followers",
      "object",
      `https://middle-fed.onrender.com/u/${req.params.username}`
    )
  );
});

/**
 * Gets user's inbox
 * @param username
 */
router.get("/:username/inbox", async (req: Request, res: Response) => {
  res.send(await list("inbox"));
});

/**
 * Posts on the user's inbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/inbox", async (req: Request, res: Response) => {
  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");
  const message: AP.Activity = <AP.Activity>JSON.parse(rawBody);

  switch (message.type) {
    case AP.ActivityTypes.FOLLOW:
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
      break;

    case AP.ActivityTypes.UNDO:
      const undoActivity: AP.Undo = <AP.Undo>message;
      if (undoActivity == null || undoActivity.id == null) return;
      if (undoActivity.object == null) return;

      console.log("undoActivity", undoActivity);
      await removeActivity(undoActivity);

      res.end("inbox finish");
      break;
  }
});

router.get("/:username/outbox", (req: Request, res: Response) => {
  res.send({ outbox: req.params.username });
});

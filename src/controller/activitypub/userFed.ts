import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import { Readable } from "stream";
import {
  activityAlreadyExists,
  getActorInfo,
  list,
  removeActivity,
  save,
  searchByField,
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

  const result = await searchByField("actor", "preferredUsername", username);
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
    await searchByField(
      "followers",
      "object",
      `https://middle-fed.onrender.com/u/${req.params.username}`
    )
  );
});

/**
 * Gets user's following list
 * @param username
 */
router.get("/:username/following", async (req: Request, res: Response) => {
  res.send(
    await searchByField(
      "following",
      "actor",
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
  const activity: AP.Activity = <AP.Activity>JSON.parse(rawBody);

  switch (activity.type) {
    case AP.ActivityTypes.UNDO:
      const undoActivity: AP.Undo = <AP.Undo>activity;
      if (
        undoActivity == null ||
        undoActivity.id == null ||
        undoActivity.object == null
      )
        return;

      await removeActivity(undoActivity);

      break;

    default:
      if (activity.id == null) return;

      if (await activityAlreadyExists(activity)) {
        res.end("follow activity already exist");
        return;
      }

      await save(activity.type.toString(), activity);

      const accept = createAcceptActivity(
        req.params.username,
        req.app.get("localDomain"),
        activity
      );

      await save("accept", JSON.parse(JSON.stringify(accept)));

      const userInfo = await getActorInfo(
        (<URL>activity.actor).toString() + ".json"
      );

      const localUserInfo: any = await getActorInfo(
        accept.actor.toString() + ".json"
      );

      await sendSignedRequest(
        <URL>userInfo.inbox,
        "POST",
        accept,
        localUserInfo.publicKey.id,
        localUserInfo.privateKey
      );
      break;
  }
});

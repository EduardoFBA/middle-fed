import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import { Readable } from "stream";
import {
  activityAlreadyExists,
  getActorInfo,
  Query,
  remove,
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
      AP.ActivityTypes.FOLLOW,
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
      AP.ActivityTypes.FOLLOW,
      "actor",
      `https://middle-fed.onrender.com/u/${req.params.username}`
    )
  );
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

  if (activity == null || activity.id == null) {
    res.sendStatus(400);
    return;
  }

  switch (activity.type) {
    case AP.ActivityTypes.FOLLOW:
      if (await activityAlreadyExists(activity)) {
        res.status(409).send("Activity already exists");
        return;
      }

      await save(activity.type.toString(), activity);

      const localDomain = req.app.get("localDomain");
      const username = req.params.username;
      const accept = createAcceptActivity(username, localDomain, activity);

      const userInfo = await getActorInfo(
        (<URL>activity.actor).toString() + ".json"
      );

      sendSignedRequest(
        <URL>userInfo.inbox,
        "POST",
        accept,
        localDomain,
        username
      )
        .then(() => res.sendStatus(200))
        .catch(() => {
          remove(AP.ActivityTypes.FOLLOW, [new Query(activity.id)]);
          res.sendStatus(500);
        });
      break;

    case AP.ActivityTypes.UNDO:
      const undoActivity: AP.Undo = <AP.Undo>activity;
      if (undoActivity.actor == null || undoActivity.object == null) {
        res.status(400).send("Activity missing required fields");
        return;
      }

      removeActivity(undoActivity).then(() => res.sendStatus(200));

      break;

    default:
      if (await activityAlreadyExists(activity)) {
        res.status(409).send("Activity already exists");
        return;
      }

      save(activity.type.toString(), activity).then(() => res.sendStatus(200));

      break;
  }
});

import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  getActorInfo,
  Query,
  remove,
  save,
  searchByField,
  sendSignedRequest,
} from "../../utils";
import {
  createDislikeActivity,
  createLikeActivity,
  createNoteObject,
  createUndoActivity,
  wrapObjectInActivity,
} from "../../utils-json";

export const activityFedRouter = Router();
const router = Router();
activityFedRouter.use("/activity", router);

/**
 * Undoes an activity
 * @param username - name of current user
 * @param activityId - id of the activity to undo
 * @param activityType - type of activity
 */
router.delete(
  "/:username/undo/:activityId/:activityType",
  async (req: Request, res: Response) => {
    // FIXME: this should be in activityApi
    // refactor this whole endpoint
    const localDomain = req.app.get("localDomain");
    const result = <AP.Activity[]>(
      await searchByField(
        AP.ActivityTypes.FOLLOW,
        "id",
        `https://${localDomain}/activity/Follow/${req.params.activityId}`
      )
    );

    if (!result.length) {
      res.send("nothin");
      return;
    }
    switch (result[0].type) {
      case AP.ActivityTypes.FOLLOW:
        const follow = <AP.Follow>result[0];
        const objectActor = follow.object as any;
        const actorUrl = objectActor.id ? objectActor.id : objectActor;
        const targetInfo = await getActorInfo(actorUrl);
        const username = req.params.username;

        const undo = await createUndoActivity(username, localDomain, follow);

        const response = await sendSignedRequest(
          <URL>targetInfo.inbox,
          "POST",
          undo,
          localDomain,
          username
        );

        if (response.ok) {
          remove(AP.ActivityTypes.FOLLOW, new Query(follow.id));
          res.send("finished");
        }
        break;
      default:
        res.send("default");
        break;
    }
  }
);

/**
 * Gets an activity
 * @param {AP.ActivityType} activityType - type of activity
 * @param activityId - id of the activity to get
 */
router.get(
  "/:activityType/:activityId",
  async (req: Request, res: Response) => {
    let activity = <AP.Activity[]>(
      await searchByField(req.params.activityType, "id", req.params.activityId)
    );

    if (activity.length) res.send(activity[0]);
    else res.send("activity not found");
  }
);

/**
 * Creates, saves and sends a note activity
 * @param username - name of current user
 * @param target - username and domain of the target user to follow (@username@domain)
 */
router.post("/create/note/:username/", async (req: Request, res: Response) => {
  const localDomain = req.app.get("localDomain");
  const content: string = req.body.content;
  const name: string = req.body.name;
  const addressedTo: string[] = req.body.addressedTo;
  const username = req.params.username;

  const note = createNoteObject(name, content, username, localDomain);
  const create = await wrapObjectInActivity(
    AP.ActivityTypes.CREATE,
    note,
    username,
    localDomain
  );

  for (let inbox of addressedTo) {
    const response = await sendSignedRequest(
      new URL(inbox),
      "POST",
      create,
      localDomain,
      req.params.username
    );

    if (response.ok) {
      await save(AP.ActivityTypes.CREATE, JSON.parse(JSON.stringify(create)));
    } else {
      console.log("error", await response.text());
    }
  }

  res.sendStatus(200);
});

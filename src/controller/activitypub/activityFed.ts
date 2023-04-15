import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  getActorInfo,
  Query,
  remove,
  removeActivity,
  searchByField,
  sendSignedRequestByAccount,
} from "../../utils";
import { createUndoActivity } from "../../utils-json";

export const activityFedRouter = Router();
const router = Router();
activityFedRouter.use("/activity", router);

/**
 * Deletes an activity
 *
 * @requestParam activityId - id of the activity to delete
 */
router.delete("/:activityType/:uuid", async (req: Request, res: Response) => {
  const activity = await searchByField(
    req.params.activityType,
    "id",
    `https://middle-fed.onrender.com${req.originalUrl}`
  );

  removeActivity(activity[0] as AP.Activity).then(() => res.sendStatus(202));
});

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

        const response = await sendSignedRequestByAccount(
          <URL>targetInfo.inbox,
          "POST",
          undo,
          localDomain,
          username
        );

        if (response.ok) {
          remove(AP.ActivityTypes.FOLLOW, new Query(follow.id));
          res.sendStatus(200);
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

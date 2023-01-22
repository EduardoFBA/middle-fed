import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import { getNotes } from "../../service/timeline.service";
import { getFollowers } from "../../service/user.service";
import { extractHandles, Query } from "../../utils";

export const timelineApiRouter = Router();
const router = Router();
timelineApiRouter.use("/timeline", router);

/**
 * Gets an activity
 * @param {AP.ActivityType} activityType - type of activity
 * @param activityId - id of the activity to get
 */
router.get("/user/:account", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);
  const userQuery = new Query(`https://${domain}/u/${username}`);
  userQuery.fieldPath = "actor";

  res.send(await getNotes(userQuery));
});

/**
 * Gets an activity
 * @param {AP.ActivityType} activityType - type of activity
 * @param activityId - id of the activity to get
 */
router.get("/following/:account", async (req: Request, res: Response) => {
  const [username, _] = extractHandles(req.params.account);
  const followers = await getFollowers(username);
  const queries: Query[] = [];

  for (const follower of followers) {
    const query = new Query(follower.id.toString());
    query.fieldPath = "actor";
    queries.push(query);
  }

  res.send(await getNotes(...queries));
});

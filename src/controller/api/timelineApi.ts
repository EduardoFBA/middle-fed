import { Request, Response, Router } from "express";
import { getFollowers } from "../../service/user.service";
import { sendSignedRequest } from "../../utils";

export const timelineFedRouter = Router();
const router = Router();
timelineFedRouter.use("/timeline", router);

/**
 * Gets an activity
 * @param {AP.ActivityType} activityType - type of activity
 * @param activityId - id of the activity to get
 */
router.get("/following/:username", async (req: Request, res: Response) => {
  //   const followers = await getFollowers(req.params.username);
  //   const outboxes:URL[] = followers.map(x=>x.outbox as URL);
  //   for (const outbox of outboxes) {
  //     sendSignedRequest(inbox, "GET")
  //   }

  return [];
});

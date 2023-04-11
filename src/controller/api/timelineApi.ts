import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import { getNotes } from "../../service/timeline.service";
import { getFollowers, getFollowings } from "../../service/user.service";
import { extractHandles, Query, search } from "../../utils";

export const timelineApiRouter = Router();
const router = Router();
timelineApiRouter.use("/timeline", router);

/**
 * Gets user's posts
 * @param account - account to filter (@username@domain)
 */
router.get("/user/:account", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);

  const query = new Query(`https://${domain}/u/${username}`);
  query.fieldPath = "actor.id";

  res.send(await getNotes(AP.ActivityTypes.CREATE, query));
});

/**
 * Gets user's following's posts
 * @param account - account to filter (@username@domain)
 */
router.get("/following/:account", async (req: Request, res: Response) => {
  const [username, _] = extractHandles(req.params.account);
  const followers = await getFollowings(username);
  const queries: Query[] = [];

  if (followers.length == 0) {
    res.send([]);
    return;
  }

  const followerQuery = [];
  followers.forEach((f) => {
    followerQuery.push(f.id.toString());
  });

  const query = new Query(followerQuery);
  query.fieldPath = "actor.id";
  query.opStr = "in";

  res.send(await getNotes(AP.ActivityTypes.CREATE, query));
});

/**
 * Gets user's followers's posts
 * @param account - account to filter (@username@domain)
 */
router.get("/followers/:account", async (req: Request, res: Response) => {
  const [username, _] = extractHandles(req.params.account);
  const followers = await getFollowers(username);

  if (followers.length == 0) {
    res.send([]);
    return;
  }

  const followerQuery = [];
  followers.forEach((f) => {
    followerQuery.push(f.id.toString());
  });

  const query = new Query(followerQuery);
  query.fieldPath = "actor.id";
  query.opStr = "in";

  res.send(await getNotes(AP.ActivityTypes.CREATE, query));
});

/**
 * Gets posts liked by user
 * @param account - account to filter (@username@domain)
 */
router.get("/liked/:account", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);

  const likeQuery = new Query(`https://${domain}/u/${username}`);
  likeQuery.fieldPath = "actor.id";

  const likes = await search(AP.ActivityTypes.LIKE, likeQuery);

  if (likes.length == 0) {
    res.send([]);
    return;
  }

  const query = new Query(likes.map((l) => l.object.id));
  query.fieldPath = "object.id";
  query.opStr = "in";

  res.send(await getNotes(AP.ActivityTypes.CREATE, query));
});

/**
 * Gets local posts
 */
router.get("/local", async (req: Request, res: Response) => {
  const localQuery = new Query(null);
  localQuery.fieldPath = "actor.account";
  localQuery.opStr = "!=";
  res.send(await getNotes(AP.ActivityTypes.CREATE, localQuery));
});

/**
 * Gets public posts
 * @param account - account to filter (@username@domain)
 */
router.get("/public", async (req: Request, res: Response) => {
  const query = new Query(["https://www.w3.org/ns/activitystreams#Public"]);
  query.fieldPath = "object.to";
  res.send(await getNotes(AP.ActivityTypes.CREATE, query));
});

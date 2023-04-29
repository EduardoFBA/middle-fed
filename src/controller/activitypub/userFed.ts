import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  getFollowers,
  getFollowersActivity,
  getFollowings,
  inbox,
  outbox,
} from "../../service/user.service";
import { searchByField } from "../../utils";

export const userFedRouter = Router();
const router = Router();
userFedRouter.use("/u", router);

/**
 * Gets user's page or info as JSON
 * @param username
 */
router.get("/:username", async (req: Request, res: Response) => {
  const isJson =
    req.headers.accept?.includes("application/activity+json") ||
    req.headers.accept?.includes("application/ld+json") ||
    req.headers["content-type"]?.includes("application/activity+json") ||
    req.headers["content-type"]?.includes("application/ld+json");

  const result = await searchByField(
    AP.ActorTypes.PERSON,
    "account",
    `${req.params.username}@${req.app.get("localDomain")}`
  );
  if (!result.length) res.send({ error: "no account found" });
  else {
    if (isJson) {
      res.send(result[0]);
    } else {
      // TODO should be user's redirect uri
      // res.redirect(result[0].url);
      res.sendStatus(404);
    }
  }
});

/**
 * Gets user's followers list
 * @param username
 */
router.get("/:username/followers", async (req: Request, res: Response) => {
  const follows = await getFollowers(req.params.username);
  const dat = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `https://middle-fed.onrender.com/${req.params.username}/followers`,
    type: "OrderedCollection",
    totalItems: follows.length,
    items: follows,
  };

  res.send(dat);
});

/**
 * Gets user's following list
 * @param username
 */
router.get("/:username/following", async (req: Request, res: Response) => {
  const follows = await getFollowings(req.params.username);
  const dat = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `https://middle-fed.onrender.com/${req.params.username}/following`,
    type: "OrderedCollection",
    totalItems: follows.length,
    items: follows,
  };

  res.send(dat);
});

/**
 * Posts on the user's inbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/inbox", async (req: Request, res: Response) => {
  console.log(req.params.username, "inbox");
  inbox(req, res);
});

/**
 * Gets the user's outbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/outbox", async (req: Request, res: Response) => {
  console.log(req.params.username, "outbox");
  outbox(req, res);
});

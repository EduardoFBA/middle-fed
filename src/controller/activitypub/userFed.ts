import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  getFollowersActivity,
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
  res.send(await getFollowersActivity(req.params.username));
});

/**
 * Posts on the user's inbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/inbox", async (req: Request, res: Response) => {
  inbox(req, res);
});

/**
 * Gets the user's outbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/inbox", async (req: Request, res: Response) => {
  outbox(req, res);
});

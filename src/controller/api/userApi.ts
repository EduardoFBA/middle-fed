import * as crypto from "crypto";
import { Request, Response, Router } from "express";
import { getFollowers } from "../../service/user.service";
import { extractHandles, save } from "../../utils";
import { createUser, createWebfinger } from "../../utils-json";

export const userApiRouter = Router();
const router = Router();
userApiRouter.use("/u", router);

/**
 * Gets list of user's followers
 * @param account - account to filter (@username@domain)
 */
router.get("/followers/:account", async (req: Request, res: Response) => {
  const [username, _] = extractHandles(req.params.account);
  res.send(await getFollowers(username));
});

/**
 * Creates a new actor for user
 */
router.post("/", (req: Request, res: Response) => {
  const account = req.body.account;
  if (account === undefined) {
    return res
      .status(400)
      .send(
        'Bad request. Please make sure "account" is a property in the POST body.'
      );
  }
  // create keypair
  crypto.generateKeyPair(
    "rsa",
    {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    },
    (err, publicKey, privateKey) => {
      const domain = req.app.get("localDomain");
      const userRecord = createUser(account, domain, publicKey, privateKey);
      const webfingerRecord = createWebfinger(account, domain);
      const apikey = crypto.randomBytes(16).toString("hex");
      save("user", userRecord);
      save("webfinger", webfingerRecord);
      res.status(200).json({ msg: "ok", apikey });
    }
  );
});

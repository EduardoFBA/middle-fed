import { AP } from "activitypub-core-types";
import { generateKeyPair, randomBytes } from "crypto";
import { Request, Response, Router } from "express";
import { getFollowers, updateActor } from "../../service/user.service";
import {
  extractHandles,
  getFromStorage,
  getMimeByBase64,
  Query,
  save,
  search,
  searchByField,
  uploadToStorage,
} from "../../utils";
import { createUser, createWebfinger } from "../../utils-json";

export const userApiRouter = Router();
const router = Router();
userApiRouter.use("/u", router);

/**
 * Gets user's info
 * @param account - account to filter (@username@domain)
 */
router.get("/:account", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);
  const u = await searchByField(
    AP.ActorTypes.PERSON,
    "id",
    `https://${domain}/u/${username}`
  );
  res.send(u[0]);
});

/**
 * Gets list of user's followers
 * @param account - account to filter (@username@domain)
 */
router.get("/followers/:account", async (req: Request, res: Response) => {
  const [username, _] = extractHandles(req.params.account);
  res.send(await getFollowers(username));
});

/**
 * Gets user's icon url
 * @param account - account to filter (@username@domain)
 */
router.get("/icon/:account", async (req: Request, res: Response) => {
  const filename = "icon/" + req.params.account;

  const readable = await getFromStorage(filename);
  //HACK:
  readable.on("data", async (data) => {
    res
      .status(200)
      .send(
        `https://firebasestorage.googleapis.com/v0/b/middle-fed.appspot.com/o/${encodeURIComponent(
          data.metadata.name
        )}?alt=media&token=${
          data.metadata.metadata.firebaseStorageDownloadTokens
        }`
      );
  });
});

/**
 * Sends user's icon
 * @param account - account to filter (@username@domain)
 */
router.post("/icon/:account", async (req: Request, res: Response) => {
  const filename = "icon/" + req.params.account;

  const base64 = req.body.file;
  const base64Str = base64.includes(",") ? base64.split(",")[1] : base64;
  const mime = getMimeByBase64(base64Str);
  const url = await uploadToStorage(base64Str, filename, mime);

  const [username, domain] = extractHandles(req.params.account);
  const user = <AP.Person>(
    (
      await searchByField(
        AP.ActorTypes.PERSON,
        "account",
        `${username}@${domain}`
      )
    )[0]
  );
  console.log([username, domain], url);
  const icon = user.icon as any;
  icon.mediaType = mime.fullType;
  icon.url = url;

  updateActor(user);

  res.sendStatus(200);
});

/**
 * Creates a new actor for user
 */
router.post("/", (req: Request, res: Response) => {
  //FIXME: this endpoint needs to be improved on. Needs to be a sign in instead of just creating a user actor
  const account = req.body.account;
  if (account === undefined) {
    return res
      .status(400)
      .send(
        'Bad request. Please make sure "account" is a property in the POST body.'
      );
  }
  // create keypair
  generateKeyPair(
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
      const apikey = randomBytes(16).toString("hex");
      save(AP.ActorTypes.PERSON, userRecord);
      save("webfinger", webfingerRecord);
      res.status(200).json({ msg: "ok", apikey });
    }
  );
});

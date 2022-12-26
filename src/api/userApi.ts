import { Request, Response, Router } from "express";
import * as crypto from "crypto";
import { save } from "../utils";
import { createUser, createWebfinger } from "../utils-json";

export const userApiRouter = Router();

userApiRouter.get("/u", (req: Request, res: Response) => {
  res.sendFile("user.html", { root: "src/view" }, (err) => {
    if (err) res.send(err);
  });
});

userApiRouter.post("/user/", (req: Request, res: Response) => {
  const account = req.body.account;
  if (account === undefined) {
    return res.status(400).json({
      msg: 'Bad request. Please make sure "account" is a property in the POST body.',
    });
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

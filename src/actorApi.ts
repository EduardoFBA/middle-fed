import { Request, Response, Router } from "express";
import * as crypto from "crypto";
import { save } from "./utils";
import { createActor, createWebfinger } from "./utils-json";

export const actorApiRouter = Router();

actorApiRouter.get("/actor/", (req: Request, res: Response) => {
  res.send({ dvklsn: 333333333333333 });
  // res.sendFile("app.html", { root: "dist" }, (err) => {
  //   res.end();

  //   if (err) throw err;
  // });
});

actorApiRouter.post("/actor/", (req: Request, res: Response) => {
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
      const actorRecord = createActor(account, domain, publicKey);
      const webfingerRecord = createWebfinger(account, domain);
      const apikey = crypto.randomBytes(16).toString("hex");
      save("actor", actorRecord);
      save("webfinger", webfingerRecord);
      res.status(200).json({ msg: "ok", apikey });
    }
  );
});

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actorApiRouter = void 0;
const express_1 = require("express");
const crypto = __importStar(require("crypto"));
const utils_1 = require("./utils");
exports.actorApiRouter = (0, express_1.Router)();
exports.actorApiRouter.get("/actor/", (req, res) => {
    res.send({ dvklsn: 333333333333333 });
    // res.sendFile("app.html", { root: "dist" }, (err) => {
    //   res.end();
    //   if (err) throw err;
    // });
});
exports.actorApiRouter.post("/actor/", (req, res) => {
    const account = req.body.account;
    if (account === undefined) {
        return res.status(400).json({
            msg: 'Bad request. Please make sure "account" is a property in the POST body.',
        });
    }
    // create keypair
    crypto.generateKeyPair("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "spki",
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
        },
    }, (err, publicKey, privateKey) => {
        const domain = req.app.get("localDomain");
        const actorRecord = createActor(account, domain, publicKey);
        const webfingerRecord = createWebfinger(account, domain);
        const apikey = crypto.randomBytes(16).toString("hex");
        console.log(apikey);
        (0, utils_1.save)("actor", actorRecord);
        (0, utils_1.save)("webfinger", webfingerRecord);
        res.status(200).json({ msg: "ok", apikey });
    });
});
function createActor(name, domain, pubkey) {
    return {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
        ],
        id: `https://${domain}/u/${name}`,
        type: "Person",
        preferredUsername: `${name}`,
        followers: `https://${domain}/u/${name}/followers`,
        following: `https://${domain}/u/${name}/following`,
        inbox: `https://${domain}/u/${name}/inbox`,
        outbox: `https://${domain}/u/${name}/outbox`,
        publicKey: {
            id: `https://${domain}/u/${name}#main-key`,
            owner: `https://${domain}/u/${name}`,
            publicKeyPem: pubkey,
        },
    };
}
function createWebfinger(name, domain) {
    return {
        subject: `acct:${name}@${domain}`,
        links: [
            {
                rel: "self",
                type: "application/activity+json",
                href: `https://${domain}/u/${name}`,
            },
        ],
    };
}
//# sourceMappingURL=actorApi.js.map
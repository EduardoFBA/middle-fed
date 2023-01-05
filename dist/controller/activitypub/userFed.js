"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFedRouter = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const express_1 = require("express");
const utils_1 = require("../../utils");
const utils_json_1 = require("../../utils-json");
exports.userFedRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.userFedRouter.use("/u", router);
function buffer(readable) {
    var readable_1, readable_1_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const chunks = [];
        try {
            for (readable_1 = __asyncValues(readable); readable_1_1 = yield readable_1.next(), !readable_1_1.done;) {
                const chunk = readable_1_1.value;
                chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (readable_1_1 && !readable_1_1.done && (_a = readable_1.return)) yield _a.call(readable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Buffer.concat(chunks);
    });
}
router.get("/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isJson = req.params.username.endsWith(".json");
    const username = isJson
        ? req.params.username.slice(0, -5)
        : req.params.username;
    const result = yield (0, utils_1.search)("actor", "preferredUsername", username);
    if (!result.length)
        res.send({ error: "no account found" });
    else {
        if (isJson) {
            res.send(result[0]);
        }
        else {
            res.sendFile("user.html", { root: "src/view" }, (err) => {
                if (err)
                    res.send(err);
            });
        }
    }
}));
router.get("/:username/followers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, utils_1.search)("followers", "object", `https://middle-fed.onrender.com/u/${req.params.username}`));
}));
router.get("/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, utils_1.list)("inbox"));
}));
router.post("/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const buf = yield buffer(req);
    const rawBody = buf.toString("utf8");
    const message = JSON.parse(rawBody);
    if (message.type == activitypub_core_types_1.AP.ActivityTypes.FOLLOW) {
        const followMessage = message;
        if (followMessage.id == null)
            return;
        console.log("followMessage", followMessage);
        yield (0, utils_1.save)("followers", followMessage);
        const localDomain = req.app.get("localDomain");
        const accept = (0, utils_json_1.createAcceptActivity)(req.params.username, localDomain, followMessage);
        console.log("accept", accept);
        yield (0, utils_1.save)("accept", JSON.parse(JSON.stringify(accept)));
        const userInfo = yield (0, utils_1.getActorInfo)(followMessage.actor.toString() + ".json");
        const localUserInfo = yield (0, utils_1.getActorInfo)(accept.actor.toString());
        console.log("LOCAL USER INFO", localUserInfo);
        console.log("send signed request", userInfo);
        const response = yield (0, utils_1.sendSignedRequest)(userInfo.inbox, "POST", accept, localUserInfo.publicKey.id, localUserInfo.privateKey);
        console.log("response", response);
    }
    // if (message.type == "Undo") {
    //   // Undo a follow.
    //   const undoObject: AP.Undo = <AP.Undo>message;
    //   if (undoObject == null || undoObject.id == null) return;
    //   if (undoObject.object == null) return;
    //   if ("user" in undoObject.object == false && (<CoreObject>undoObject.object).type != "Follow") return;
    //   const docId = undoObject.user.toString().replace(/\//g, "_");
    //   const res = await db.collection('followers').doc(docId).delete();
    //   console.log("Deleted", res)
    res.end("inbox finish");
}));
router.get("/:username/outbox", (req, res) => {
    res.send({ outbox: req.params.username });
});
//# sourceMappingURL=userFed.js.map
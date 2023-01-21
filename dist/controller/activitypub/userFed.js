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
/**
 * Gets user's page or info as JSON
 * @param username
 */
router.get("/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isJson = req.params.username.endsWith(".json");
    const username = isJson
        ? req.params.username.slice(0, -5)
        : req.params.username;
    const result = yield (0, utils_1.searchByField)("actor", "preferredUsername", username);
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
/**
 * Gets user's followers list
 * @param username
 */
router.get("/:username/followers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, "object", `https://middle-fed.onrender.com/u/${req.params.username}`));
}));
/**
 * Gets user's following list
 * @param username
 */
router.get("/:username/following", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, "actor", `https://middle-fed.onrender.com/u/${req.params.username}`));
}));
/**
 * Posts on the user's inbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const buf = yield buffer(req);
    const rawBody = buf.toString("utf8");
    const activity = JSON.parse(rawBody);
    if (activity == null || activity.id == null) {
        res.sendStatus(400);
        return;
    }
    switch (activity.type) {
        case activitypub_core_types_1.AP.ActivityTypes.FOLLOW:
            if (yield (0, utils_1.activityAlreadyExists)(activity)) {
                res.status(409).send("Activity already exists");
                return;
            }
            yield (0, utils_1.save)(activity.type.toString(), activity);
            const localDomain = req.app.get("localDomain");
            const username = req.params.username;
            const accept = (0, utils_json_1.createAcceptActivity)(username, localDomain, activity);
            const userInfo = yield (0, utils_1.getActorInfo)(activity.actor.toString() + ".json");
            (0, utils_1.sendSignedRequest)(userInfo.inbox, "POST", accept, localDomain, username)
                .then(() => res.sendStatus(200))
                .catch(() => {
                (0, utils_1.remove)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, [new utils_1.Query(activity.id)]);
                res.sendStatus(500);
            });
            break;
        case activitypub_core_types_1.AP.ActivityTypes.UNDO:
            const undoActivity = activity;
            if (undoActivity.actor == null || undoActivity.object == null) {
                res.status(400).send("Activity missing required fields");
                return;
            }
            (0, utils_1.removeActivity)(undoActivity).then(() => res.sendStatus(200));
            break;
        default:
            if (yield (0, utils_1.activityAlreadyExists)(activity)) {
                res.status(409).send("Activity already exists");
                return;
            }
            (0, utils_1.save)(activity.type.toString(), activity).then(() => res.sendStatus(200));
            break;
    }
}));
//# sourceMappingURL=userFed.js.map
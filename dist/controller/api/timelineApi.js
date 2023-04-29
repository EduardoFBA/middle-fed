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
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineApiRouter = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const express_1 = require("express");
const timeline_service_1 = require("../../service/timeline.service");
const user_service_1 = require("../../service/user.service");
const utils_1 = require("../../utils");
exports.timelineApiRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.timelineApiRouter.use("/timeline", router);
/**
 * Gets user's posts
 * @param account - account to filter (@username@domain)
 */
router.get("/user/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const query = new utils_1.Query(`https://${domain}/u/${username}`);
    query.fieldPath = "actor.id";
    res.send(yield (0, timeline_service_1.getNotes)(activitypub_core_types_1.AP.ActivityTypes.CREATE, query));
}));
/**
 * Gets user's following's posts
 * @param account - account to filter (@username@domain)
 */
router.get("/following/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, _] = (0, utils_1.extractHandles)(req.params.account);
    const followers = yield (0, user_service_1.getFollowings)(username);
    if (followers.length == 0) {
        res.send([]);
        return;
    }
    const followerQuery = [];
    followers.forEach((f) => {
        followerQuery.push(f.id.toString());
    });
    const query = new utils_1.Query(followerQuery);
    query.fieldPath = "actor.id";
    query.opStr = "in";
    res.send(yield (0, timeline_service_1.getNotes)(activitypub_core_types_1.AP.ActivityTypes.CREATE, query));
}));
/**
 * Gets user's followers's posts
 * @param account - account to filter (@username@domain)
 */
router.get("/followers/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, _] = (0, utils_1.extractHandles)(req.params.account);
    const followers = yield (0, user_service_1.getFollowers)(username);
    if (followers.length == 0) {
        res.send([]);
        return;
    }
    const followerQuery = [];
    followers.forEach((f) => {
        followerQuery.push(f.id.toString());
    });
    const query = new utils_1.Query(followerQuery);
    query.fieldPath = "actor.id";
    query.opStr = "in";
    res.send(yield (0, timeline_service_1.getNotes)(activitypub_core_types_1.AP.ActivityTypes.CREATE, query));
}));
/**
 * Gets posts liked by user
 * @param account - account to filter (@username@domain)
 */
router.get("/liked/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const likeQuery = new utils_1.Query(`https://${domain}/u/${username}`);
    likeQuery.fieldPath = "actor.id";
    const likes = yield (0, utils_1.search)(activitypub_core_types_1.AP.ActivityTypes.LIKE, likeQuery);
    if (likes.length == 0) {
        res.send([]);
        return;
    }
    const query = new utils_1.Query(likes.map((l) => l.object.id));
    query.fieldPath = "object.id";
    query.opStr = "in";
    res.send(yield (0, timeline_service_1.getNotes)(activitypub_core_types_1.AP.ActivityTypes.CREATE, query));
}));
/**
 * Gets local posts
 */
router.get("/local", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const localQuery = new utils_1.Query(null);
    localQuery.fieldPath = "actor.account";
    localQuery.opStr = "!=";
    res.send(yield (0, timeline_service_1.getNotes)(activitypub_core_types_1.AP.ActivityTypes.CREATE, localQuery));
}));
/**
 * Gets public posts
 * @param account - account to filter (@username@domain)
 */
router.get("/public", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = new utils_1.Query(["https://www.w3.org/ns/activitystreams#Public"]);
    query.fieldPath = "object.to";
    res.send(yield (0, timeline_service_1.getNotes)(activitypub_core_types_1.AP.ActivityTypes.CREATE, query));
}));
//# sourceMappingURL=timelineApi.js.map
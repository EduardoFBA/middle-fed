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
exports.activityApiRouter = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const express_1 = require("express");
const utils_1 = require("../../utils");
const utils_json_1 = require("../../utils-json");
exports.activityApiRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.activityApiRouter.use("/activity", router);
/**
 * Creates, saves and sends a follow activity
 *
 * @param account - username and domain of the user
 * @param
 */
router.post("/:account/follow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const targetId = req.body.targetId;
    const targetInfo = yield (0, utils_1.getActorInfo)(targetId);
    const follow = (0, utils_json_1.createFollowActivity)(username, domain, new URL(targetId));
    const response = yield (0, utils_1.sendSignedRequest)(targetInfo.inbox, "POST", follow, domain, username);
    if (response.ok) {
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)));
        res.sendStatus(200);
    }
    else
        res.sendStatus(500);
}));
//# sourceMappingURL=activityApi.js.map
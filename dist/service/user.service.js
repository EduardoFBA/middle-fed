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
exports.getFollowersActivity = exports.getFollowers = exports.updateActor = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const utils_1 = require("../utils");
function updateActor(actor) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, utils_1.update)("actor", actor, actor.id.toString());
        return "";
    });
}
exports.updateActor = updateActor;
function getFollowers(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const actors = [];
        const follows = yield getFollowersActivity(username);
        for (const follow of follows) {
            try {
                const actorInfo = yield (0, utils_1.getActorInfo)(follow.object.toString());
                actors.push(actorInfo);
            }
            catch (e) {
                console.log(e);
            }
        }
        return actors;
    });
}
exports.getFollowers = getFollowers;
function getFollowersActivity(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, "actor", `https://middle-fed.onrender.com/u/${username}`);
    });
}
exports.getFollowersActivity = getFollowersActivity;
//# sourceMappingURL=user.service.js.map
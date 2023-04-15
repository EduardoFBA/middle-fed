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
exports.sendToAll = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const utils_1 = require("../utils");
function sendToAll(domain, username, activity) {
    return __awaiter(this, void 0, void 0, function* () {
        const foreignActorQuery = new utils_1.Query(`https://${domain}/u/${username}`);
        foreignActorQuery.opStr = "!=";
        const actors = (yield (0, utils_1.search)(activitypub_core_types_1.AP.ActorTypes.PERSON, foreignActorQuery));
        const actorInfo = (yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActorTypes.PERSON, "account", `${username}@${domain}`))[0];
        for (const act of actors) {
            console.log("sendToAll", act.inbox);
            (0, utils_1.sendSignedRequest)(act.inbox, "POST", activity, actorInfo);
        }
    });
}
exports.sendToAll = sendToAll;
//# sourceMappingURL=activity.service.js.map
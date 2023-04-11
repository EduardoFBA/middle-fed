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
exports.getNotes = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const utils_1 = require("../utils");
function getNotes(collection, ...queries) {
    return __awaiter(this, void 0, void 0, function* () {
        const typeObjectQuery = new utils_1.Query(activitypub_core_types_1.AP.CoreObjectTypes.NOTE);
        typeObjectQuery.fieldPath = "object.type";
        const creates = yield (0, utils_1.search)(collection, ...queries, typeObjectQuery);
        const response = [];
        for (const create of creates) {
            const note = create;
            note.object.content = (0, utils_1.stripHtml)(note.object.content);
            response.push(note);
        }
        return response;
    });
}
exports.getNotes = getNotes;
//# sourceMappingURL=timeline.service%20copy.js.map
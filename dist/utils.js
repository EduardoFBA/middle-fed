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
exports.search = exports.save = void 0;
const firebase_admin_1 = require("firebase-admin");
const db = (0, firebase_admin_1.firestore)();
function save(collection, data) {
    db.collection(collection).doc().set(data);
}
exports.save = save;
function search(collection, field, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const collectionRef = db.collection(collection);
        const snapshot = yield collectionRef.where(field, "==", value).get();
        const docs = [];
        snapshot.forEach((doc) => {
            docs.push(doc.data());
        });
        return docs;
    });
}
exports.search = search;
//# sourceMappingURL=utils.js.map
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractHandles = exports.getWebfinger = exports.webfinger = exports.search = exports.save = void 0;
const firebase_admin_1 = require("firebase-admin");
const node_fetch_1 = __importDefault(require("node-fetch"));
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
function webfinger(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.query.resource) {
            const domain = req.app.get("localDomain");
            res.send(yield getWebfinger(req.query.resource, domain));
            return;
        }
        throw "No account provided";
    });
}
exports.webfinger = webfinger;
function getWebfinger(resource, localDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        const [username, domain] = extractHandles(resource);
        if (domain === localDomain) {
            const response = yield search("webfinger", "subject", `acct:${username}@${domain}`);
            if (response.length) {
                return response[0];
            }
            else
                throw "No account found";
        }
        else {
            const promise = yield (0, node_fetch_1.default)(`https://${domain}/.well-known/webfinger?resource=acct:${username}@${domain}`);
            return yield promise.json();
        }
    });
}
exports.getWebfinger = getWebfinger;
function extractHandles(resource) {
    const string = resource.startsWith("acct:") ? resource.slice(5) : resource;
    return string.startsWith("@")
        ? [string.split("@")[1], string.split("@")[2]]
        : [string.split("@")[0], string.split("@")[1]];
}
exports.extractHandles = extractHandles;
//# sourceMappingURL=utils.js.map
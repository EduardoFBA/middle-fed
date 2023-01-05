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
exports.sendSignedRequest = exports.extractHandles = exports.getWebfinger = exports.getActorInfo = exports.getActorId = exports.removeActivity = exports.remove = exports.search = exports.save = exports.list = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const firebase_admin_1 = require("firebase-admin");
const crypto = __importStar(require("crypto"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const db = (0, firebase_admin_1.firestore)();
function list(collection) {
    return __awaiter(this, void 0, void 0, function* () {
        const collectionRef = db.collection(collection);
        const snapshot = yield collectionRef.get();
        const docs = [];
        snapshot.forEach((doc) => {
            docs.push(doc.data());
        });
        return docs;
    });
}
exports.list = list;
function save(collection, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db.collection(collection).doc().set(data);
    });
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
function remove(collection, field, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const collectionRef = db.collection(collection);
        collectionRef.doc("").delete();
        const snapshot = yield collectionRef.where(field, "==", value).get();
        33493158;
        const docs = [];
        snapshot.forEach((doc) => {
            docs.push(doc.data());
        });
        return docs;
    });
}
exports.remove = remove;
function removeActivity(undoActivity) {
    return __awaiter(this, void 0, void 0, function* () {
        const targetActivity = undoActivity.object;
        switch (targetActivity.type) {
            case activitypub_core_types_1.AP.ActivityTypes.FOLLOW:
                yield remove("followers", "id", targetActivity.id.toString());
                break;
            default:
                return "ActivityType not supported or doesn't exist";
        }
        return "";
    });
}
exports.removeActivity = removeActivity;
function getActorId(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const promise = yield (0, node_fetch_1.default)(userId);
        return yield promise.json();
    });
}
exports.getActorId = getActorId;
function getActorInfo(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const promise = yield (0, node_fetch_1.default)(userId);
        return yield promise.json();
    });
}
exports.getActorInfo = getActorInfo;
function getWebfinger(resource) {
    return __awaiter(this, void 0, void 0, function* () {
        const [username, domain] = extractHandles(resource);
        const promise = yield (0, node_fetch_1.default)(`https://${domain}/.well-known/webfinger?resource=acct:${username}@${domain}`);
        return yield promise.json();
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
function sendSignedRequest(endpoint, method, object, publicKeyId, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const activity = JSON.stringify(object);
        const requestHeaders = {
            host: endpoint.hostname,
            date: new Date().toUTCString(),
            digest: `SHA-256=${crypto
                .createHash("sha256")
                .update(activity)
                .digest("base64")}`,
        };
        // Generate the signature header
        const signature = sign(endpoint, method, requestHeaders, publicKeyId, privateKey);
        return yield (0, node_fetch_1.default)(endpoint, {
            method,
            body: activity,
            headers: Object.assign(Object.assign({ "content-type": "application/activity+json", accept: "application/activity+json" }, requestHeaders), { signature: signature }),
        });
    });
}
exports.sendSignedRequest = sendSignedRequest;
function sign(url, method, headers, publicKeyId, privateKey) {
    const { host, pathname, search } = new URL(url);
    const target = `${pathname}${search}`;
    headers.date = headers.date || new Date().toUTCString();
    headers.host = headers.host || host;
    const headerNames = ["host", "date", "digest"];
    const stringToSign = getSignString(target, method, headers, headerNames);
    const signature = signSha256(privateKey, stringToSign).toString("base64");
    return `keyId="${publicKeyId}",headers="${headerNames.join(" ")}",signature="${signature.replace(/"/g, '\\"')}",algorithm="rsa-sha256"`;
}
function getSignString(target, method, headers, headerNames) {
    const requestTarget = `${method.toLowerCase()} ${target}`;
    headers = Object.assign(Object.assign({}, headers), { "(request-target)": requestTarget });
    return headerNames
        .map((header) => `${header.toLowerCase()}: ${headers[header]}`)
        .join("\n");
}
function signSha256(privateKey, stringToSign) {
    const signer = crypto.createSign("sha256");
    signer.update(stringToSign);
    const signature = signer.sign(privateKey);
    signer.end();
    return signature;
}
//# sourceMappingURL=utils.js.map
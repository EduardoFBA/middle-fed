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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSignedRequest = exports.sendSignedRequestByAccount = exports.sendSignedRequestById = exports.buffer = exports.stripHtml = exports.extractHandles = exports.getWebfinger = exports.getActorInfo = exports.activityAlreadyExists = exports.removeActivity = exports.update = exports.remove = exports.search = exports.searchByField = exports.save = exports.list = exports.uploadToStorage = exports.getFromStorage = exports.getMimeByBase64 = exports.MimeTypes = exports.Query = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const firebase_admin_1 = require("firebase-admin");
const crypto_1 = require("crypto");
const node_fetch_1 = __importDefault(require("node-fetch"));
const stream_1 = require("stream");
const activity_service_1 = require("./service/activity.service");
const utils_json_1 = require("./utils-json");
const db = (0, firebase_admin_1.firestore)();
const bucket = (0, firebase_admin_1.storage)().bucket();
class Query {
    constructor(value) {
        this.fieldPath = "id";
        this.opStr = "==";
        this.value = value;
    }
}
exports.Query = Query;
class MimeTypes {
}
exports.MimeTypes = MimeTypes;
MimeTypes.GIF = {
    base64Prefix: "R0lGOD",
    fileSuffix: ".gif",
    fullType: "image/gif",
};
MimeTypes.PNG = {
    base64Prefix: "iVBORw0KG",
    fileSuffix: ".png",
    fullType: "image/png",
};
MimeTypes.JPG = {
    base64Prefix: "/9j/4",
    fileSuffix: ".jpg",
    fullType: "image/jpg",
};
function getMimeByBase64(base64Str) {
    if (base64Str.startsWith(MimeTypes.GIF.base64Prefix))
        return MimeTypes.GIF;
    if (base64Str.startsWith(MimeTypes.PNG.base64Prefix))
        return MimeTypes.PNG;
    if (base64Str.startsWith(MimeTypes.JPG.base64Prefix))
        return MimeTypes.JPG;
    console.log("error", base64Str.slice(0, 25));
    return;
}
exports.getMimeByBase64 = getMimeByBase64;
function getFromStorage(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        return bucket.getFilesStream({ prefix: filename });
    });
}
exports.getFromStorage = getFromStorage;
function uploadToStorage(base64Str, filename, mime) {
    return __awaiter(this, void 0, void 0, function* () {
        bucket.deleteFiles({ prefix: filename });
        const file = bucket.file(filename + mime.fileSuffix);
        var bufferStream = new stream_1.PassThrough();
        bufferStream.end(Buffer.from(base64Str, "base64"));
        const uuid = (0, crypto_1.randomUUID)();
        bufferStream.pipe(file.createWriteStream({
            metadata: {
                contentType: mime.fullType,
                metadata: {
                    firebaseStorageDownloadTokens: uuid,
                },
            },
            public: true,
            validation: "md5",
        }));
        return `https://firebasestorage.googleapis.com/v0/b/middle-fed.appspot.com/o/${encodeURIComponent(filename + mime.fileSuffix)}?alt=media&token=${uuid}`;
    });
}
exports.uploadToStorage = uploadToStorage;
function list(collection, limit = 100) {
    return __awaiter(this, void 0, void 0, function* () {
        const collectionRef = db.collection(collection).limit(limit);
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
        yield db.collection(collection).doc().set(data);
    });
}
exports.save = save;
function searchByField(collection, field, value) {
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
exports.searchByField = searchByField;
function search(collection, ...queries) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("search", queries);
        const colRef = db.collection(collection);
        let query;
        for (let i = 0; i < queries.length; i++) {
            query =
                i == 0
                    ? colRef.where(queries[i].fieldPath, queries[i].opStr, queries[i].value)
                    : query.where(queries[i].fieldPath, queries[i].opStr, queries[i].value);
        }
        const snapshot = yield query.get();
        const docs = [];
        snapshot.forEach((doc) => {
            docs.push(doc.data());
        });
        return docs;
    });
}
exports.search = search;
function remove(collection, ...queries) {
    const colRef = db.collection(collection);
    let query;
    for (let i = 0; i < queries.length; i++) {
        query =
            i == 0
                ? colRef.where(queries[i].fieldPath, queries[i].opStr, queries[i].value)
                : query.where(queries[i].fieldPath, queries[i].opStr, queries[i].value);
    }
    query.onSnapshot((snapshot) => snapshot.forEach((result) => result.ref.delete()));
}
exports.remove = remove;
function update(collection, object, objectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const colRef = db.collection(collection);
        const snapshot = yield colRef.where("id", "==", objectId).get();
        snapshot.forEach((result) => __awaiter(this, void 0, void 0, function* () { return yield result.ref.set(object); }));
    });
}
exports.update = update;
function removeActivity(activity) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (activity.type) {
            case activitypub_core_types_1.AP.ActivityTypes.CREATE:
                const [username, domain] = extractHandles(activity.actor.account);
                const undo = yield (0, utils_json_1.createDeleteActivity)(username, domain, activity);
                (0, activity_service_1.sendToAll)(domain, username, undo).then(() => remove(activity.type, new Query(activity.id.toString())));
                break;
            case activitypub_core_types_1.AP.ActivityTypes.FOLLOW:
                remove(activity.type, new Query(activity.id.toString()));
                break;
            default:
                return "ActivityType not supported or doesn't exist";
        }
        return "";
    });
}
exports.removeActivity = removeActivity;
function activityAlreadyExists(activity) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (activity.type) {
            case activitypub_core_types_1.AP.ActivityTypes.FOLLOW:
                const follow = activity;
                const queryFollow1 = new Query(follow.actor.id);
                queryFollow1.fieldPath = "actor.id";
                const queryFollow2 = new Query(follow.object.id);
                queryFollow2.fieldPath = "object.id";
                const followSearch = yield search(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, queryFollow1, queryFollow2);
                return !!followSearch.length;
            case activitypub_core_types_1.AP.ActivityTypes.LIKE:
            case activitypub_core_types_1.AP.ActivityTypes.DISLIKE:
                const like = activity;
                const queryLike = new Query(like.object.id);
                queryLike.fieldPath = "object.id";
                const likeSearch = yield search(activity.type, queryLike);
                return !!likeSearch.length;
            default:
                const result = yield search(activity.type, new Query(activity.id.toString()));
                return !!result.length;
        }
    });
}
exports.activityAlreadyExists = activityAlreadyExists;
function getActorInfo(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const promise = yield (0, node_fetch_1.default)(userId, {
            headers: {
                Accept: "application/activity+json",
            },
        });
        return yield promise.json();
    });
}
exports.getActorInfo = getActorInfo;
function getWebfinger(resource) {
    return __awaiter(this, void 0, void 0, function* () {
        const [username, domain] = extractHandles(resource);
        const account = `acct:${username}@${domain}`;
        const promise = yield searchByField("webfinger", "subject", account);
        if (promise.length)
            return promise[0];
        else {
            const response = yield (0, node_fetch_1.default)(`https://${domain}/.well-known/webfinger?resource=${account}`);
            return response.json();
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
function stripHtml(input) {
    return input.replace(/(<([^>]+)>)/gi, "");
}
exports.stripHtml = stripHtml;
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
exports.buffer = buffer;
function sendSignedRequestById(endpoint, method, object, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const actorInfo = (yield searchByField(activitypub_core_types_1.AP.ActorTypes.PERSON, "id", id))[0];
        return sendSignedRequest(endpoint, method, object, actorInfo);
    });
}
exports.sendSignedRequestById = sendSignedRequestById;
function sendSignedRequestByAccount(endpoint, method, object, domain, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const actorInfo = (yield searchByField(activitypub_core_types_1.AP.ActorTypes.PERSON, "account", `${username}@${domain}`))[0];
        return sendSignedRequest(endpoint, method, object, actorInfo);
    });
}
exports.sendSignedRequestByAccount = sendSignedRequestByAccount;
function sendSignedRequest(endpoint, method, object, actorInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const activity = JSON.stringify(object);
        const requestHeaders = {
            host: endpoint.hostname,
            date: new Date().toUTCString(),
            digest: `SHA-256=${(0, crypto_1.createHash)("sha256").update(activity).digest("base64")}`,
        };
        // Generate the signature header
        const signature = sign(endpoint, method, requestHeaders, actorInfo.publicKey.id, actorInfo.privateKey);
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
    const signer = (0, crypto_1.createSign)("sha256");
    signer.update(stringToSign);
    const signature = signer.sign(privateKey);
    signer.end();
    return signature;
}
//# sourceMappingURL=utils.js.map
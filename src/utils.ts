import { AP } from "activitypub-core-types";
import { firestore } from "firebase-admin";
import * as crypto from "crypto";
import fetch from "node-fetch";

const db = firestore();
export async function list(collection: string): Promise<any[]> {
  const collectionRef = db.collection(collection);
  const snapshot = await collectionRef.get();

  const docs = [];
  snapshot.forEach((doc) => {
    docs.push(doc.data());
  });

  return docs;
}

export async function save(
  collection: string,
  data: any
): Promise<firestore.WriteResult> {
  return await db.collection(collection).doc().set(data);
}

export async function search(
  collection: string,
  field: string,
  value: string
): Promise<any[]> {
  const collectionRef = db.collection(collection);
  const snapshot = await collectionRef.where(field, "==", value).get();

  const docs = [];
  snapshot.forEach((doc) => {
    docs.push(doc.data());
  });

  return docs;
}

export async function remove(
  collection: string,
  field: string,
  value: string
): Promise<any[]> {
  const collectionRef = db.collection(collection);
  collectionRef.doc("").delete();
  const snapshot = await collectionRef.where(field, "==", value).get();
  33493158;
  const docs = [];
  snapshot.forEach((doc) => {
    docs.push(doc.data());
  });

  return docs;
}

export async function getActorId(userId: string): Promise<AP.Actor> {
  const promise = await fetch(userId);
  return await promise.json();
}

export async function getActorInfo(userId: string): Promise<AP.Actor> {
  const promise = await fetch(userId);
  return await promise.json();
}

export async function getWebfinger(resource: string) {
  const [username, domain] = extractHandles(resource);
  const promise = await fetch(
    `https://${domain}/.well-known/webfinger?resource=acct:${username}@${domain}`
  );
  return await promise.json();
}

export function extractHandles(resource: string): string[] {
  const string = resource.startsWith("acct:") ? resource.slice(5) : resource;

  return string.startsWith("@")
    ? [string.split("@")[1], string.split("@")[2]]
    : [string.split("@")[0], string.split("@")[1]];
}

export async function sendSignedRequest(
  endpoint: URL,
  method: string,
  object: AP.Activity,
  publicKeyId: string,
  privateKey: string
): Promise<Response> {
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
  const signature = sign(
    endpoint,
    method,
    requestHeaders,
    publicKeyId,
    privateKey
  );

  return await fetch(endpoint, {
    method,
    body: activity,
    headers: {
      "content-type": "application/activity+json",
      accept: "application/activity+json",
      ...requestHeaders,
      signature: signature,
    },
  });
}

function sign(
  url: URL,
  method: string,
  headers: any,
  publicKeyId: string,
  privateKey: string
) {
  const { host, pathname, search } = new URL(url);
  const target = `${pathname}${search}`;
  headers.date = headers.date || new Date().toUTCString();
  headers.host = headers.host || host;

  const headerNames = ["host", "date", "digest"];

  const stringToSign = getSignString(target, method, headers, headerNames);

  const signature = signSha256(privateKey, stringToSign).toString("base64");

  return `keyId="${publicKeyId}",headers="${headerNames.join(
    " "
  )}",signature="${signature.replace(/"/g, '\\"')}",algorithm="rsa-sha256"`;
}

function getSignString(target, method, headers, headerNames) {
  const requestTarget = `${method.toLowerCase()} ${target}`;
  headers = {
    ...headers,
    "(request-target)": requestTarget,
  };
  return headerNames
    .map((header) => `${header.toLowerCase()}: ${headers[header]}`)
    .join("\n");
}

function signSha256(privateKey: string, stringToSign: string) {
  const signer: crypto.Sign = crypto.createSign("sha256");
  signer.update(stringToSign);
  const signature: Buffer = signer.sign(privateKey);
  signer.end();
  return signature;
}

import { firestore } from "firebase-admin";
import { Request, Response } from "express";
import fetch from "node-fetch";
import { app } from "./app";

const db = firestore();
export function save(collection: string, data: any) {
  db.collection(collection).doc().set(data);
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

export async function webfinger(req: Request, res: Response) {
  if (req.query.resource) {
    const domain = req.app.get("localDomain");
    res.send(await getWebfinger(req.query.resource as string, domain));
    return;
  }

  throw "No account provided";
}

export async function getWebfinger(resource: string, localDomain: string) {
  const [username, domain] = extractHandles(resource);
  if (domain === localDomain) {
    const response: string[] = await search(
      "webfinger",
      "subject",
      `acct:${username}@${domain}`
    );
    if (response.length) {
      return response[0];
    } else throw "No account found";
  } else {
    const promise = await fetch(
      `https://${domain}/.well-known/webfinger?resource=acct:${username}@${domain}`
    );
    return await promise.json();
  }
}

export function extractHandles(resource: string): string[] {
  const string = resource.startsWith("acct:") ? resource.slice(5) : resource;

  return string.startsWith("@")
    ? [string.split("@")[1], string.split("@")[2]]
    : [string.split("@")[0], string.split("@")[1]];
}

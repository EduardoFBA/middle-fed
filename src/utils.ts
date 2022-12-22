import { firestore } from "firebase-admin";
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

import { firestore } from "firebase-admin";

const db = firestore();
export function save(collection: string, data: any) {
  db.collection(collection).doc().set(data);
}

export async function search(collection: string, field: string, value: string) {
  const collectionRef = db.collection(collection);
  const snapshot = await collectionRef.where(field, "==", value).get();

  const docs = [];
  snapshot.forEach((doc) => {
    docs.push(doc.data());
  });

  return docs;
}

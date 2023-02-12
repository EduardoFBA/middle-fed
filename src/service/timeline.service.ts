import { AP } from "activitypub-core-types";
import { Query, search, stripHtml } from "../utils";

export async function getNotes(collection: string, ...queries: Query[]) {
  const typeObjectQuery = new Query(AP.CoreObjectTypes.NOTE);
  typeObjectQuery.fieldPath = "object.type";

  const creates = await search(collection, ...queries, typeObjectQuery);

  const response: any[] = [];
  for (const create of creates) {
    const note = create as any;
    note.object.content = stripHtml(note.object.content);
    response.push(note);
  }

  return response;
}

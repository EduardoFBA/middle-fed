import { AP } from "activitypub-core-types";
import { Query, search, stripHtml } from "../utils";

export async function getNotes(...queries: Query[]) {
  const typeObjectQuery = new Query(AP.CoreObjectTypes.NOTE);
  typeObjectQuery.fieldPath = "object.type";

  const creates = await search(
    AP.ActivityTypes.CREATE,
    ...queries,
    typeObjectQuery
  );

  return creates.map((create) => {
    const note = create.object as AP.Note;
    note.content = stripHtml(note.content);
    return note;
  });
}

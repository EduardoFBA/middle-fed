import { AP } from "activitypub-core-types";
import { Query, search, searchByField, sendSignedRequest } from "../utils";

export async function sendToAll(id: string, activity: AP.Activity) {
  const foreignActorQuery = new Query(id);
  foreignActorQuery.opStr = "!=";

  const actors = <AP.Person[]>(
    await search(AP.ActorTypes.PERSON, foreignActorQuery)
  );
  const actorInfo = (await searchByField(AP.ActorTypes.PERSON, "id", id))[0];

  for (const act of actors) {
    console.log("sendToAll", act.inbox);
    sendSignedRequest(act.inbox as URL, "POST", activity, actorInfo);
  }
}

import { AP } from "activitypub-core-types";
import { Query, search, sendSignedRequestById } from "../utils";

export async function sendToAll(
  url: string | URL,
  actor: AP.Actor,
  activity: AP.Activity
) {
  const foreignActorQuery = new Query(null);
  foreignActorQuery.fieldPath = "account";
  foreignActorQuery.opStr = "==";

  const actors = <AP.Person[]>(
    await search(AP.ActorTypes.PERSON, foreignActorQuery)
  );

  for (const actor of actors) {
    console.log("sendAll", actor);
    sendSignedRequestById(new URL(url), "POST", activity, actor.id);
  }
}

import { AP } from "activitypub-core-types";
import { Query, search, searchByField, sendSignedRequest } from "../utils";

export async function sendToAll(
  domain: string,
  username: string,
  activity: AP.Activity
) {
  const foreignActorQuery = new Query(`https://${domain}/u/${username}`);
  foreignActorQuery.opStr = "!=";

  const actors = <AP.Person[]>(
    await search(AP.ActorTypes.PERSON, foreignActorQuery)
  );
  const actorInfo = (
    await searchByField(
      AP.ActorTypes.PERSON,
      "account",
      `${username}@${domain}`
    )
  )[0];

  for (const act of actors) {
    console.log("sendToAll", act.inbox);
    sendSignedRequest(act.inbox as URL, "POST", activity, actorInfo);
  }
}

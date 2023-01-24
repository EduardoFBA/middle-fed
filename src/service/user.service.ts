import { AP } from "activitypub-core-types";
import { getActorInfo, update, searchByField } from "../utils";

export async function updateActor(actor: AP.Person): Promise<string> {
  await update("actor", actor, actor.id.toString());
  return "";
}

export async function getFollowers(
  username: string
): Promise<(AP.Person | AP.Follow)[]> {
  const actors: (AP.Person | AP.Follow)[] = [];
  const follows = await getFollowersActivity(username);

  for (const follow of follows) {
    try {
      const actorInfo = await getActorInfo(follow.object.toString());
      actors.push(actorInfo as AP.Person);
    } catch (e) {
      console.log(e);
    }
  }

  return actors;
}

export async function getFollowersActivity(
  username: string
): Promise<AP.Follow[]> {
  return await searchByField(
    AP.ActivityTypes.FOLLOW,
    "actor",
    `https://middle-fed.onrender.com/u/${username}`
  );
}

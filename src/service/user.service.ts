import { AP } from "activitypub-core-types";
import { getActorInfo, searchByField } from "../utils";

export async function getFollowers(username: string): Promise<AP.Person[]> {
  const actors: AP.Person[] = [];
  const follows = await getFollowersActivity(username);

  for (const follow of follows) {
    actors.push(
      (await getActorInfo(follow.object.toString() + ".json")) as AP.Person
    );
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

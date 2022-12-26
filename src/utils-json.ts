export function createUser(name, domain, pubkey, prikey) {
  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],

    id: `https://${domain}/u/${name}`,
    type: "Person",
    preferredUsername: `${name}`,
    followers: `https://${domain}/u/${name}/followers`,
    following: `https://${domain}/u/${name}/following`,
    inbox: `https://${domain}/u/${name}/inbox`,
    outbox: `https://${domain}/u/${name}/outbox`,

    publicKey: {
      id: `https://${domain}/u/${name}#main-key`,
      owner: `https://${domain}/u/${name}`,
      publicKeyPem: pubkey,
    },
    privateKey: prikey,
  };
}

export function createWebfinger(name, domain) {
  return {
    subject: `acct:${name}@${domain}`,

    links: [
      {
        rel: "self",
        type: "application/activity+json",
        href: `https://${domain}/u/${name}`,
      },
    ],
  };
}

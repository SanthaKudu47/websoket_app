const subscribers = new Map();

export function subscribeToMatch(matchId, socket) {
  if (!matchId || !socket) {
    return;
  }
  //check for match id in map
  if (subscribers.has(socket)) {
    const client = subscribers.get(socket);
    client.add(matchId);
  } else {
    //create
    subscribers.set(socket, new Set([matchId])); //add zero matchIds set
  }
}

export function unsubscribe(matchId, socket) {
  if (!matchId || !socket) {
    return;
  }
  if (subscribers.has(socket)) {
    const client = subscribers.get(socket);
    client.delete(matchId);

    //remove from memory better for performance
    if (client.size === 0) {
      subscribers.delete(socket);
    }
  }
}

export function clearWhenClose(socket) {
  if (!socket) {
    return;
  }

  //check for socket
  if (subscribers.has(socket)) {
    //remove all match ids of client and client itself
    subscribers.delete(socket);
  }
}

export function clearAllSubscribers() {
  subscribers.clear();
}

export function isSubscribed(socket, matchId) {
  return subscribers.has(socket) && subscribers.get(socket).has(matchId);
}

export function getAllSubscribersOfMatch(matchId) {
  let sockets = [];
  if (!matchId) {
    return sockets;
  }
  subscribers.forEach((matchIds, socket) => {
    if (matchIds.has(matchId)) sockets.push(socket);
  });
  return sockets;
}

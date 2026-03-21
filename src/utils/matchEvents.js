import { EventEmitter } from "events";

const emitter = new EventEmitter();

const MATCH_CREATED = "match_created";
const MATCH_UPDATED = "match_updated";

function registerBroadCastFunc(broadcast) {
  emitter.on(MATCH_CREATED, function (match) {
    broadcast(match);
  });
}

function registerMulticastFunc(multicast) {
  emitter.on(MATCH_UPDATED, function (matchId,timeLineEvent) {
    multicast(matchId,timeLineEvent);
  });
}

function raiseMatchCreateEvent(matchEventDoc) {
  emitter.emit(MATCH_CREATED, matchEventDoc);
}

function raiseMatchUpdateEvent(matchId,timeLineEvent) {
  emitter.emit(MATCH_UPDATED, matchId,timeLineEvent);
}
export { raiseMatchCreateEvent, registerBroadCastFunc, raiseMatchUpdateEvent,registerMulticastFunc };

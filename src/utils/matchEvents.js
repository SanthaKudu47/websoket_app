import { EventEmitter } from "events";

const emitter = new EventEmitter();

const MATCH_CREATED = "match_created";

function registerBroadCastFunc(broadcast) {
  emitter.on(MATCH_CREATED, function (match) {
    broadcast(match);
  });
}

function raiseMatchCreateEvent(matchEventDoc) {
  emitter.emit(MATCH_CREATED, matchEventDoc);
}

export { raiseMatchCreateEvent, registerBroadCastFunc };

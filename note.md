real time data retrieval
http
polling-each time have to sent full request.overhead and inefficient.
difficult to manage many connecting and disconnecting requests.
wakes up the mobile each and every time.bad for battery.

websocket
better for realtime.support 2 way connection connections keeps open.full duplex both side can talk same time.more easier to handle many connects connections.better for mobile.but few or single open connections easier on battery.

WEBSOCKET HANDSHAKE.
..starts as normal http/s connection.
..then browser ask with special header

Connection:Upgrade
Upgrade:websocket
Sec-Websocket-Version:13
Sec-Websocket-Key:key

both ends need to be supported to websocket protocol.
...if server supports then

HTTP101
Switching
Protocols

then done
http will turns to websocket

now we have websocket tunnel
open persistent real-time

for http websocket mode is ws:// unencrypted
for https websocket mode is wss:// encrypted secure

after connected
life cycle of websocket

1 - connect from client side
const socket = new WebSocket('wss://localhost:8080');
as a result browser sends the above header for asking an upgrade

2-upgrade request or the switch
if server ok then http 101:Switching protocols will sent by server

established connections.

3-state
http is stateless as default.
no memory of previous requests.

websockets stateful
keeps active ref in memory of the connection.

ghost connections
if client side do not close the connections properly(battery dead wifi issue or any).
server thinks connection is still on and keep that ref in memory these are ghost connections.
if we do not clean them up then it will effected to server.

fix-

use heartbeat - >ping ping
periodic ping message /pong messages will make sure the active connection.
server send ping request time to time.and client replies as pong.if server dose not get any pongs it will automatically remove the connection and handler in the memory.

this is different that poling in http we have to send entire header and etc for each time.
in ws its more lighter and happen though established connection less overhead

data transfer

test{json},binary-row data,

json
socket.send(
JSON.stringify(data)
);

//binerry array buffer or blob

//in lower level ws uses opcode to identify the data type

back pressure

life cycle
1-connecting -> hardhack is happening no data sharing now
2-open ->live we can sent
3-closing-
3-closed

server side events
connection
wss.on('connection',(socket,request)=>{
console.log('Client joined  ')
})

message -incoming as buffer
socket.on('message',(row)=>{
    
})
error
socket.on('error')

//client
open event
message event
close event

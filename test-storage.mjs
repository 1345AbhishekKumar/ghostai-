import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
const LIVEBLOCKS_SECRET_KEY = process.env.LIVEBLOCKS_SECRET_KEY;
fetch(`https://api.liveblocks.io/v2/rooms`, {
  headers: { Authorization: `Bearer ${LIVEBLOCKS_SECRET_KEY}` }
})
.then(res => res.json())
.then(data => {
  const roomId = data.data?.[0]?.id;
  if (!roomId) return console.log("No rooms found");
  return fetch(`https://api.liveblocks.io/v2/rooms/${roomId}/storage`, {
    headers: { Authorization: `Bearer ${LIVEBLOCKS_SECRET_KEY}` }
  });
})
.then(res => res && res.json())
.then(json => json && console.log(JSON.stringify(json, null, 2)))
.catch(console.error);

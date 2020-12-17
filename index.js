import { parse, simplify } from 'https://raw.githubusercontent.com/mcbobby123/nbt-parser/master/index.ts';

const queue = [];
const seen = new Set();

const key = Deno.readTextFileSync('./key.txt');

const queueUp = uuid => {
  if(seen.has(uuid)) return;
  queue.push(uuid);
  seen.add(uuid);
}

queueUp('6f01c975fe6f4b188fbbc128242d64e7');

let lastNew = Date.now();

const inventories = ['item_stash', 'inv_armor', 'inv_contents', 'inv_enderchest', 'mystic_well_item','mystic_well_pants'];

const rate = 2; // players per second

const result = {};
const save = () => Deno.writeTextFileSync('./mystics.json', JSON.stringify(result, null, 2));

const saveLoop = setInterval(save, 60e3);

const processInv = inv => {
  if(!inv) return;
  const items = simplify(parse(new Uint8Array(inv.data))).i;
  for(const item of items){
    const enchantLores = item?.tag?.display?.Lore?.join('\n')?.split('\n\n')?.map(l => l.split('\n'))?.slice(1);
    const enchants = item?.tag?.ExtraAttributes?.CustomEnchants;
    if(!enchantLores || !enchants) continue;
    for(let i = 0; i < enchants.length; i++){
      const level = enchants[i].Level;
      const version = enchants[i].Version || 0;
      const key = enchants[i].Key;
      if(result[key]?.[version]?.[level]) continue;
      const description = enchantLores[i];
      if(!result[key]) result[key] = {};
      if(!result[key][version]) result[key][version] = {};
      result[key][version][level] = description;
      lastNew = Date.now();
      console.log(`Found ${key} tier: ${level} version: ${version}`)
    }
  }
}

while(lastNew + 300e5 > Date.now()){
  if(queue.length) {
    (async()=>{
      const current = queue.pop();
      console.log(`searching ${current}`)
      const { success, player } = await fetch(`https://api.hypixel.net/player?key=${key}&uuid=${current}`).then(r => r.json());
      if(!success) return;
      const pit = player?.stats?.Pit?.profile;
      if(!pit) return;
      inventories.forEach(inv => processInv(pit[inv]));
      if(pit.prestiges?.length >= 10){
        const { success, records } = await fetch(`https://api.hypixel.net/friends?key=${key}&uuid=${current}`).then(r => r.json());
        if(!success) return;
        records.map(r => r.uuidReceiver !== current ? r.uuidReceiver : r.uuidSender).forEach(queueUp);
      }
    })();
  }
  await new Promise(r => setTimeout(r, 1e3 / rate))
}

clearInterval(saveLoop);
save();

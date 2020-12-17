# MysticDescriptionLoader
Grabs mystic descriptions from Pit

It will create a file called `mystics.json`

the general format of the file is like this:
```json
{
  "enchant key":{
    "version":{
      "tier": [
        "enchant name", 
        "description line 1", 
        "description line 2", 
        "description line n"
      ]
    }
  }
}
```

# Set Up
You will need to create a file in the same directory called `key.txt` and place your api key inside.

# Running
`Deno run --allow-net --allow-write index.js`

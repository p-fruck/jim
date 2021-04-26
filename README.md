# JIM - Jitsi Integrated Musicbot

Say hello to Jim, the Jitsi Integrated Musicbot. He will assist you bringing good music to your jitsi party :tada:

## Commands

* !add <url|searchTerm> - Add track to queue
* !clear - Clear the queue
* !help - Print the help menu
* !list - Show tracks in queue
* !ping - Ping me!
* !play <url|searchTerm> - Play track now, or resume if no params were given
* !vol - Retrieve current volume level
* !vol <+|-|[0-100]> - increment/decrement/set volume level

## How to deploy

You have to create a `.env` file inside this repository containing the following variables:

```config
ROOM=<YourJitsiMeeting>
BOT_EXECUTABLE=/usr/bin/chromium-browser
BOT_HEADLESS=true
BOT_NAME=DJ Jim
PLAYLIST_MAX_SIZE=100
VOLUME_INITIAL_VALUE=20
VOLUME_STEP_SIZE=10
```

Afterwards you can simply enter `npm run start` and you should see Jim appear in your meeting!

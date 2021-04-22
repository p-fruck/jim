# JIM - Jitsi Integrated Musicbot

Say hello to Jim, the Jitsi Integrate Musicbot. He will assist you bringing good music to your jitsi party :tada:

## How to deploy

You have to create a `.env` file inside this repository containing the following variables:

```config
ROOM=<YourJitsiMeeting>
BOT_EXECUTABLE=/usr/bin/chromium-browser
BOT_HEADLESS=true
BOT_NAME=DJ Jim
```

Afterwards you can simply enter `npm run start` and you should see Jim appear in your meeting!

<h1 align="center">
  <br />
  <img src="https://raw.githubusercontent.com/p-fruck/jim/master/src/assets/logo.svg" alt="JIM" width="200"></a>
  <br />
  Hi, I'm JIM!
  <br />
</h1>

<h4 align="center">A small music bot for your meeting in <a href="https://jitsi.org/" target="_blank">Jitsi</a>.</h4>

<p align="center">
  <a href="https://github.com/p-fruck/jim/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/p-fruck/jim" />
  </a>
  <a href="https://github.com/p-fruck/jim/stargazers">
      <img src="https://img.shields.io/github/stars/p-fruck/jim" />
  </a>
  <a href="https://github.com/p-fruck/jim/issues">
    <img src="https://img.shields.io/github/issues/p-fruck/jim" />
  </a>
  <a href="https://meet.jit.si/">
    <img src="https://img.shields.io/badge/Build%20for-Jitsi%20Meet-5e87d4" />
  </a>
</p>

<p align="center">
  <a href="#tada-key-features">Key Features</a> •
  <a href="#desktop_computer-commands">Commands</a> •
  <a href="#rocket-how-to-deploy">How to deploy</a> •
  <a href="#blue_book-license">License</a>
</p>

# :robot: Who is JIM?

Hi, I am JIM! Your Jitsi Integrated Musicbot.

## :tada: Key Features

You would like to know what my key features are? - I will assist you bringing good music to your Jitsi Meet party!

## :desktop_computer: Commands

| Command                   | Function                                          |
| ------------------------- | ------------------------------------------------- |
| `!add <url\|searchTerm>`  | Add track to queue                                |
| `!clear`                  | Clear the queue                                   |
| `!help`                   | Print the help menu                               |
| `!list`                   | Show tracks in queue                              |
| `!ping`                   | Ping me!                                          |
| `!play <url\|searchTerm>` | Play track now, or resume if no params were given |
| `!skip`                   | Skip current track and play next                  |
| `!vol`                    | Retrieve current volume level                     |
| `!vol <+\|-\|[0-100]>`    | Increment, decrement or set volume level          |


## :rocket: How to deploy

You have to create a `.env` file inside this repository containing the following variables

```config
ROOM=<YourJitsiMeeting>
BOT_EXECUTABLE=/usr/bin/chromium-browser
BOT_HEADLESS=true
BOT_NAME=DJ Jim
BOT_AVATAR_URL=https://raw.githubusercontent.com/p-fruck/jim/master/src/assets/logo.svg
PLAYLIST_MAX_SIZE=100
VOLUME_INITIAL_VALUE=20
VOLUME_STEP_SIZE=10
```

There is just one thing to do for you before JIM is ready. Set the `ROOM` to the name of your meeting.

Change the other values so that it fits your preferences.

If you would like to give JIM some other profile image, set the `BOT_AVATAR_URL`. This must be some kind of URL available for public read. While JIM plays music, it displays the thumbnail of the video and not the profile image.

Afterwards you can simply enter `npm run start` and you should see JIM appear in your meeting!

## :blue_book: License

JIM is licensed under `GNU Affero General Public License v3.0`!  

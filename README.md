<h1 align="center">
  <br />
  <img src="https://raw.githubusercontent.com/p-fruck/jim/master/src/assets/logo.svg" alt="JIM" width="200"></a>
  <br />
  Hi, I'm JIM!
  <br />
</h1>
<div align="center">
    <small>Built with ❤️ and 🍺 by
        <a href="https://github.com/piuswalter">Pius</a>,
        <a href="https://github.com/tjarbo">Tjark</a>,
        <a href="https://github.com/p-fruck">Philipp</a> and
        <a href="https://github.com/p-fruck/jim/graphs/contributors">contributors</a>
    </small>
</div>

---

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

| Command | Description |
| ------- | ----------- |
|`!add`|\<url\|searchTerm\> - Add track to queue|
|`!clear`|Clear the queue|
|`!help`|Display the help menu|
|`!list`|Show tracks in queue|
|`!pause`|Pause the current track|
|`!ping`|Emits a life signal|
|`!play`|\<url\|searchTerm\> - Play track now, or resume if no params were given|
|`!skip`|Skip current track and play next one|
|`!track`|Get information about the current track, or fast forward and rewind using eg. ++ / --- or +40 / -120|
|`!vol`|Retrieve the current volume level if no params where given or adjust it to your needs by setting a volume level between 0 and 100, or bysetting a variable amount of + or -|


## :rocket: How to deploy

You can simply build and deploy jim as a container using

```sh
docker build -t jim https://github.com/p-fruck/jim.git --squash
docker run --rm -d --init --cap-add=SYS_ADMIN --name=jim -e ROOM=YourJitsiRoom jim
```

You can even mount a .env file to store your environment variables by adding `-v .env:.env` to the docker command.

Alternatively, you can start the bot without any sort of container-technology, using
`npm ci && npm run start`.

Again, you have to create a `.env` file containing your environment variables. A list off all available variables can be found below, but only `ROOM` is required:

| Variable               | Example Value        | Description |
| ---------------------- | -------------------- | ----------- |
| `ROOM`                 | ExampleJitsiRoom1234 | Name of the room to join |
| `BOT_HEADLESS`         | false                | Whether or not the bot should be launched in headless mode    |
| `BOT_NAME`             | DJ Jim               | This is the display name of your bot |
| `BOT_AVATAR_URL`       | https://domain/logo  | A link to a publicly accesible profile picture for the jim |
| `PLAYLIST_MAX_SIZE`    | 100                  | The maximum amount of songs that can be added to a playlist |
| `VOLUME_INITIAL_VALUE` | 20                   | The initial music volume in percent
| `VOLUME_STEP_SIZE`     | 10                   | Default step size in percent, utilized by eg `vol ++` |
| `TRACK_STEP_SIZE`      | 10                   | Default step size in seconds to fast forward (or rewind) a track |

## :blue_book: License

JIM is licensed under `GNU Affero General Public License v3.0`!

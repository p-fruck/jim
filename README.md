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

<h4 align="center">:lock: Monitored by SonarQube</h4>

<p align="center">
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=ncloc" />
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=sqale_rating" />
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=alert_status" />
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=reliability_rating" />
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=security_rating" />
</p>

<p align="center">
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=bugs" />
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=code_smells" />
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=duplicated_lines_density" />
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=sqale_index" />
  <img src="https://sonar.p-fruck.de/api/project_badges/measure?project=p-fruck%3Ajim&metric=vulnerabilities" />
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

| Command                    	| Description                                                                                                                                      	|
|----------------------------	|--------------------------------------------------------------------------------------------------------------------------------------------------	|
| `!add <url\|searchTerm\>`  	| Add track or pick the first result from search term to queue                                                                                     	|
| `!clear`                   	| Clear the queue                                                                                                                                  	|
| `!help`                    	| Display the help menu                                                                                                                            	|
| `!joke`                    	| Try to make you laugh :laughing:                                                                                                                 	|
| `!list`                    	| Show tracks in queue                                                                                                                             	|
| `!pause`                   	| Pause the current track                                                                                                                          	|
| `!ping`                    	| Emits a life signal                                                                                                                              	|
| `!play <url\|searchTerm\>` 	| Play track or first result from search term now! Resume if no parameter is provided                                                              	|
| `!skip`                    	| Skip current track and play next one                                                                                                             	|
| `!track <value>`           	| If no `value` is provided, get information about the current track. Use e.g. `++`/`---` or `+40` / `-120` to fast forward and rewind             	|
| `!vol <value>`             	| If no `value` is provided, retrieve the current volume level. Use a number from `0` to `100` or a variable amount of `+` or `-` to adjust volume 	|


## :rocket: How to deploy

You can simply build and deploy JIM as a container using

```sh
docker build -t jim https://github.com/p-fruck/jim.git --squash
docker run --rm -d --init --cap-add=SYS_ADMIN --name=jim -e ROOM_NAME=YourJitsiRoom jim
```

You can even mount a `.env` file to store your environment variables by adding `-v .env:.env` to the docker command.

Alternatively, you can start the bot without any sort of container-technology, using
`npm ci && npm run start`.

Again, you have to create a `.env` file containing your environment variables. A list off all available variables can be found below, but only `ROOM_NAME` is required (=❗):

|        Variable        	|   Default   	| Description                                                                      	|
|------------------------	|:-----------:	|----------------------------------------------------------------------------------	|
| `BOT_AVATAR_URL`       	| Logo of JIM 	| A link to a publicly accessible profile picture for JIM                          	|
| `BOT_HEADLESS`         	|    `true`   	| Whether or not the bot should be launched in headless mode                       	|
| `BOT_NAME`             	|   `DJ JIM`  	| Defines the display name of your bot                                             	|
| `JOKE_DELAY`           	|    `2500`   	| Sets the delay in ms between setup and delivery of the joke                      	|
| `JOKE_FILTER`          	|    `Any`    	| Sets filter the joke API ([documentation](https://sv443.net/jokeapi/v2/#try-it)) 	|
| `LOG_LEVEL`            	|    `info`   	| Defines the minimum log level. Choose `error`, `warn`, `info` or `debug`         	|
| `PLAYLIST_MAX_SIZE`    	|    `100`    	| Defines the maximum amount of songs that can be added to a playlist              	|
| `TRACK_STEP_SIZE`      	|     `10`    	| Defines the default step size in sec. to fast forward (or rewind) a track        	|
| `ROOM_NAME`            	|      ❗      	| Name of the room to join                                                         	|
| `ROOM_PASSWORD`        	|             	| Password of the jitsi room (if any)                                              	|
| `VOLUME_INITIAL_VALUE` 	|     `20`    	| Sets the initial music volume in % (`0` to `100`)                                	|
| `VOLUME_STEP_SIZE`     	|     `10`    	| Default step size in %, utilized by eg `!vol +++`                            	|

## :blue_book: License

JIM is licensed under `GNU Affero General Public License v3.0`!

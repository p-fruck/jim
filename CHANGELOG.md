# Development

# v2.1.3

### Bug Fixes
* Fixed issue that bot would not unmute when music is getting played

# v2.1.2

### Security Fixes
* Updated vulnerable dependencies

# v2.1.1

### Security Fixes
* Updated vulnerable dependencies

# v2.1.0

### Bug Fixes
* Fixed sending messages on older Jitsi instances

### Features
* Added support for self-hosted instances

# v2.0.0

### Bug Fixes
* Fixed some problems with private/public messages
* Disabled some unwanted stuff in frontend

### Performance Improvements
* Significantly improved chat delay

### Features
* Added track command
* Added joke command
* Added support for rooms with lobby enabled
* Added support for password protected rooms
* Implemented logger

## Breaking changes
* Adapted to Jitsi API changes, see [here](https://github.com/jitsi/jitsi-meet/issues/9098)
* Changed naming of environment variables `ROOM` -> `ROOM_NAME`

# v1.1.0
* Added dynamic command system
* Added private/public chat support
* General bugfixes

# v1.0.0
* Initial Release
* Audio playback and simple playlist support
* Simple CHat support

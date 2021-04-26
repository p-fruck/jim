export interface IIncomingMessage {
  from: string, // The id of the user that sent the message
  nick: string, // the nickname of the user that sent the message
  privateMessage: boolean, // whether this is a private or group message
  message: string // the text of the message
}

export interface IParticipantKickedOut {
  kicked: {
    id: string, // the id of the participant removed from the room
    local: boolean // whether or not the participant is the local particiapnt
  },
  kicker: {
    id: string // the id of the participant who kicked out the other participant
  }
}

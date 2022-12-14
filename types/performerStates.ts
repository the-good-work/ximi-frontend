export type Room = {
  room: string;
  participants: number;
} | null;

export type InputTypes = "voice" | "line";

export type Screens =
  | "room-list-screen"
  | "select-connection-input-screen"
  | "enter-passcode-screen"
  | "enter-name-screen"
  | "stage-screen";

export type UpdateStateActions =
  | {
      type: "back-to-list";
    }
  | {
      type: "back-to-connection-input";
    }
  | {
      type: "back-to-enter-name";
    }
  | {
      type: "select-room";
      properties: { room: Room };
    }
  | {
      type: "select-connection-mode";
      properties: {
        inputType: InputTypes;
      };
    }
  | {
      type: "submit-name";
      properties: {
        name: string;
      };
    }
  | {
      type: "submit-passcode";
      properties: {
        token: string;
      };
    }
  | { type: "mute-audio" }
  | { type: "unmute-audio" };

export type RoomStateInit = {
  screen: "room-list-screen";
};

export type RoomStateSelectConnectionInput = {
  screen: "select-connection-input-screen";
  properties: {
    room: Room;
  };
};

export type RoomStateEnterName = {
  screen: "enter-name-screen";
  properties: {
    room: Room;
    inputType: InputTypes;
    name: string;
  };
};

export type RoomStateEnterPasscode = {
  screen: "enter-passcode-screen";
  properties: {
    room: Room;
    inputType: InputTypes;
    name: string;
  };
};

export type RoomStateStage = {
  screen: "stage-screen";
  properties: {
    room: Room;
    inputType: InputTypes;
    name: string;
    token: string;
  };
};

export type ReducerStates =
  | RoomStateInit
  | RoomStateSelectConnectionInput
  | RoomStateEnterName
  | RoomStateEnterPasscode
  | RoomStateStage;

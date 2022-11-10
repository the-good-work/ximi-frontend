import React, {
  Dispatch,
  useEffect,
  useState,
  useReducer,
  SetStateAction,
} from "react";
import StageSidebar from "../components/StageSidebar";
import {
  RoomStateStage,
  UpdateStateActions,
} from "../../../../types/controlStates";
import {
  PanelStates,
  Preset,
  PresetAction,
} from "../../../../types/stageStates";
import { useRoom } from "@livekit/react-core";
import { styled } from "ui/theme/theme";
import { UpdateStatePayload } from "@thegoodwork/ximi-types";
import {
  DataPacket_Kind,
  Participant,
  RemoteParticipant,
  RoomEvent,
} from "livekit-client";
import { Root, Scrollbar, Viewport } from "@radix-ui/react-scroll-area";
import AudioMixCard from "../components/AudioMixCard";
import Text from "ui/Texts/Text";
import { Sad } from "react-ionicons";
import VideoPanel from "../components/VideoPanel";

const decoder = new TextDecoder();

const StyledStage = styled("div", {
  display: "flex",
  width: "100%",
  height: "100%",
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row",
});

const StyledAudioPanel = styled("div", {
  height: "100%",
  width: "100%",
  color: "white",
  gridGap: "$md",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
});

const StyledEmptyState = styled("div", {
  height: "100%",
  width: "100%",
  color: "white",
  display: "flex",
  opacity: "0.8",
  gap: "$sm",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  ".icon": {
    path: {
      fill: "$text",
    },
  },
});

const StyledRoot = styled(Root, {
  height: "100%",
  width: "100%",
  overflow: "hidden",
});

const StyledViewport = styled(Viewport, {
  height: "100%",
  width: "100%",
  paddingRight: "$lg",
  boxSizing: "border-box",
});

function StagePanel({
  activePanel,
  participants,
  roomName,
}: {
  activePanel: PanelStates;
  participants: Participant[];
  roomName: string;
}) {
  if (activePanel === "audio") {
    if (participants.length <= 0) {
      return (
        <StyledEmptyState>
          <div className="icon" aria-hidden="true">
            <Sad width="32px" height="32px" />
          </div>
          <Text>There is no one in this room</Text>
        </StyledEmptyState>
      );
    } else
      return (
        <StyledRoot>
          <StyledViewport>
            <StyledAudioPanel>
              {participants.map((p: any) => {
                return (
                  <AudioMixCard
                    roomName={roomName}
                    type={JSON.parse(p.metadata).type.toLowerCase()}
                    participant={p}
                    participants={participants}
                  />
                );
              })}
            </StyledAudioPanel>
          </StyledViewport>
          <Scrollbar orientation="vertical" />
        </StyledRoot>
      );
  } else
    return (
      <StyledRoot>
        <StyledViewport>
          <VideoPanel
            participants={participants}
            currentParticipant={
              participants.length >= 2 ? participants[1] : participants[0]
            }
          />
        </StyledViewport>
        <Scrollbar orientation="vertical" />
      </StyledRoot>
    );
}

export default function Stage({
  state,
  updateState,
  setControllerName,
}: {
  updateState: Dispatch<UpdateStateActions>;
  state: RoomStateStage;
  setControllerName: Dispatch<SetStateAction<string>>;
}) {
  const initialState = Array.apply(null, Array(12)).map((_a, i) => {
    return {
      name: `SLOT${i < 9 ? `0${i + 1}` : i + 1}`,
      saved: false,
      index: i,
    };
  });
  const { connect, room, error, participants } = useRoom();

  const [presets, setPresets] = useReducer(reducer, initialState);
  const [activePanel, setActivePanel] = useState<PanelStates>("audio");

  function reducer(_state: Preset[], action: PresetAction) {
    if (action.type === "update-preset") {
      const updatedPreset = {
        name: action.name,
        saved: action.saved,
        index: action.index,
      };
      _state.splice(action.index, 1, updatedPreset);
      const __state = _state.slice();
      return __state;
    } else return initialState;
  }

  useEffect(() => {
    // loop thru participants and subscribe/unsubscribe to audio track accordingly
    // state will indiciate which are the ones on mute (i.e. to unsub)
    //
    //
    // every time audioMixMute changes (from Zahid's send data)

    participants.forEach((participant) => {
      if (participant) {
        console.log(participant.audioTracks);
        if (participant.isLocal) {
          return;
        }
        if (participant.metadata) {
          try {
            const metadata = JSON.parse(participant.metadata);
            if (metadata.type === "PERFORMER") {
              (participant as RemoteParticipant).audioTracks.forEach(
                (publication) => {
                  const shouldSubscribe = true; // some sort of logic determining whether we should be listening to this participant's audio
                  if (publication.isSubscribed !== true && shouldSubscribe) {
                    publication.setSubscribed(true);
                    console.log(publication.subscriptionStatus);
                  } else if (
                    publication.isSubscribed === true &&
                    !shouldSubscribe
                  ) {
                    publication.setSubscribed(false);
                  }
                }
              );
            }
          } catch (err) {
            return;
          }
        }
      }
    });
  }, [participants, state]);

  useEffect(() => {
    connect(`${process.env.REACT_APP_LIVEKIT_HOST}`, state.token)
      .then((rm) => {
        if (rm) {
          setControllerName(rm?.localParticipant.identity || "");
          rm.on(
            RoomEvent.DataReceived,
            (
              payload: Uint8Array,
              participant?: RemoteParticipant,
              kind?: DataPacket_Kind
            ) => {
              const string = decoder.decode(payload);
              try {
                const json: UpdateStatePayload = JSON.parse(
                  string
                ) as UpdateStatePayload;
                console.log(json);
                // updateState({
                //   type: "update-from-server",
                //   payload: room,
                // });
              } catch (err) {
                console.log(err);
                return;
              }
              /*
               * const obj = JSON.parse(strData);
               * if (obj.type === "___") {
               * ___
               * }
               */
            }
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // useEffect(() => {
  //   if (room) {
  //     if (room.localParticipant) {
  //       // console.log(room, participants, room.localParticipant);
  //     }
  //   }
  // }, [room]);

  if (error) {
    console.log(error);
  }

  return (
    <div className="content noscroll">
      <StyledStage>
        <StagePanel
          roomName={room?.name || ""}
          activePanel={activePanel}
          participants={participants}
        />
        <StageSidebar
          presets={presets}
          setPresets={setPresets}
          updateState={updateState}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
      </StyledStage>
    </div>
  );
}

import React, { Dispatch, useEffect, useState, SetStateAction } from "react";
import {
  RoomStateStage,
  UpdateStateActions,
} from "../../../../types/controlStates";
import { PanelStates } from "../../../../types/stageStates";
import { useRoom } from "@livekit/react-core";
import { styled } from "ui/theme/theme";

import {
  RoomUpdatePayload,
  PerformerUpdatePayload,
  ParticipantControl,
  ServerUpdate,
  ParticipantPerformer,
  Preset,
} from "@thegoodwork/ximi-types/src/room";
import { Participant, Room, RoomEvent } from "livekit-client";
import { Root, Scrollbar, Viewport } from "@radix-ui/react-scroll-area";
import AudioMixCard from "../components/AudioMixCard";
import Text from "ui/Texts/Text";
import {
  ChatboxSharp,
  ExitSharp,
  VideocamSharp,
  VolumeHighSharp,
} from "react-ionicons";
import VideoPanel from "../components/VideoPanel";
import PanelButton from "../components/PanelButton";
import Button from "ui/Buttons/Button";
import Presets from "../components/Presets";
import AudioLayout from "../components/AudioLayout";

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

const StyledSidebar = styled("div", {
  display: "flex",
  width: "250px",
  flexDirection: "column",
  boxSizing: "border-box",
  alignItems: "start",
  justifyContent: "start",
  height: "100%",
  color: "$text",

  ".topSpacer": {
    borderLeft: "2px solid $brand",
    boxSizing: "border-box",
    padding: "0",
  },

  ".controls": {
    borderLeft: "2px solid $brand",
    height: "100%",
    width: "100%",
    padding: "$sm",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
    gap: "$sm",

    "> div": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "$sm",
    },
  },
});

function StagePanel({
  room,
  activePanel,
  participantsSettings,
  roomName,
  participants,
}: {
  room?: Room;
  activePanel: PanelStates;
  participantsSettings: RoomUpdatePayload["update"]["participants"];
  roomName: string;
  participants: Participant[];
}) {
  if (participantsSettings) {
    if (activePanel === "audio") {
      if (participantsSettings.length <= 0) {
        return (
          <StyledEmptyState>
            <Text>Loading...</Text>
          </StyledEmptyState>
        );
      } else {
        return (
          <StyledRoot>
            <StyledViewport>
              <StyledAudioPanel>
                {participants

                  .sort((a, b) => (a.identity > b.identity ? 1 : -1))
                  .sort((a, b) => {
                    try {
                      const typeA = JSON.parse(a.metadata || "")?.type;
                      const typeB = JSON.parse(b.metadata || "")?.type;
                      if (typeA === "PERFORMER" && typeB === "CONTROL") {
                        return -1;
                      } else if (typeA === "CONTROL" && typeB === "PERFORMER") {
                        return 1;
                      } else {
                        return 0;
                      }
                    } catch (_err) {
                      return 0;
                    }
                  })
                  .map((p: Participant) => {
                    const participantSettings = participantsSettings.find(
                      (_p) => _p.name === p.identity
                    );

                    if (participantSettings?.type === "OUTPUT") {
                      return false;
                    }

                    const meta = JSON.parse(p.metadata || "{}");

                    return (
                      <AudioMixCard
                        key={p.sid}
                        thisParticipant={p}
                        passcode={`00000`}
                        participants={participants}
                        roomName={roomName}
                        type={meta.type}
                        audioMixMute={participantSettings?.audioMixMute || []}
                        audioDelay={
                          participantSettings?.type === "PERFORMER"
                            ? participantSettings?.audioOutDelay
                            : 0
                        }
                      />
                    );
                  })}
              </StyledAudioPanel>
            </StyledViewport>
            <Scrollbar orientation="vertical" />
          </StyledRoot>
        );
      }
    } else {
      return (
        <StyledRoot>
          <StyledViewport>
            <VideoPanel
              room={room}
              participants={participants}
              participantsSettings={
                participantsSettings.filter(
                  (p) => p.type === "PERFORMER"
                ) as ParticipantPerformer[]
              }
            />
          </StyledViewport>
          <Scrollbar orientation="vertical" />
        </StyledRoot>
      );
    }
  } else return <></>;
}

function StageSidebar({
  activePanel,
  setActivePanel,
  updateState,
  stageSettings,
  room,
}: {
  activePanel: PanelStates;
  setActivePanel: Dispatch<SetStateAction<PanelStates>>;
  updateState: Dispatch<UpdateStateActions>;
  stageSettings: RoomUpdatePayload["update"];
  room?: Room;
}) {
  return (
    <StyledSidebar>
      <div className="topSpacer" />
      <PanelButton
        onClick={() => {
          setActivePanel("audio");
        }}
        active={activePanel === "audio"}
        icon={<VolumeHighSharp />}
        css={{
          ".icon": {
            span: {
              svg: {
                color: activePanel === "audio" ? "$accent" : "$text",
              },
              "path:not(:last-child)": {
                fill: "none",
              },
            },
          },
        }}
      >
        Audio
      </PanelButton>
      <PanelButton
        onClick={() => {
          setActivePanel("video");
        }}
        active={activePanel === "video"}
        icon={<VideocamSharp />}
      >
        Video
      </PanelButton>
      <div className="controls">
        <div>
          <Button
            size="sm"
            icon={<ChatboxSharp />}
            css={{
              alignItems: "center",
              justifyContent: "center",
              textTransform: "uppercase",
              ".icon": {
                span: {
                  path: { fill: "$text" },
                },
              },
            }}
          >
            Message
          </Button>
          <Presets stageSettings={stageSettings} room={room} />
        </div>
        <Button
          size="sm"
          css={{
            alignItems: "center",
            justifyContent: "center",
            textTransform: "uppercase",
          }}
          icon={<ExitSharp />}
          type="negative"
          onClick={async () => {
            if (room) {
              await room.disconnect();

              window.setTimeout(() => {
                updateState({
                  type: "back-to-list",
                });
              }, 200);
            }
          }}
        >
          Exit
        </Button>
      </div>
    </StyledSidebar>
  );
}

export default function Stage({
  state,
  updateState,
}: {
  updateState: Dispatch<UpdateStateActions>;
  state: RoomStateStage;
}) {
  const [audioMixMute, setAudioMixMute] = useState<
    PerformerUpdatePayload["update"]["audioMixMute"]
  >([]);

  const [stageSettings, setStageSettings] =
    useState<(ServerUpdate & { type: "room-update" })["update"]>();

  const { connect, room, error, participants } = useRoom();

  const [activePanel, setActivePanel] = useState<PanelStates>("audio");

  useEffect(() => {
    connect(`${process.env.REACT_APP_LIVEKIT_HOST}`, state.token, {
      autoSubscribe: false,
    })
      .then((rm) => {
        console.log("connected");
        if (rm) {
          updateState({
            type: "set-control-name",
            name: rm.localParticipant.identity,
          });
          rm.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
            const string = decoder.decode(payload);
            try {
              const json = JSON.parse(string) as ServerUpdate;

              if (!json.type) {
                return;
              }
              if (json.type === "room-update") {
                setStageSettings(() => json.update);

                const thisParticipant = rm.localParticipant;
                const thisParticipantSettings = json.update?.participants?.find(
                  (p) =>
                    p.name === thisParticipant.identity && p.type === "CONTROL"
                ) as ParticipantControl;

                if (thisParticipantSettings) {
                  setAudioMixMute(thisParticipantSettings.audioMixMute);
                }
              }
            } catch (err) {
              console.log(err);
              return;
            }
          });

          rm.on(RoomEvent.TrackPublished, (publication) => {
            publication.setSubscribed(true);
            publication.setEnabled(false);
          });

          rm.on(RoomEvent.TrackUnpublished, (publication) => {
            publication.setSubscribed(false);
          });
        }
      })
      .catch((err) => {
        console.log("connect error");
        console.log(err);
      });
  }, []);

  if (error) {
    console.log(error);
  }

  return (
    <div className="content noscroll smallpadding">
      <StyledStage>
        <AudioLayout audioMixMute={audioMixMute} participants={participants} />
        <StagePanel
          roomName={room?.name || ""}
          participants={participants}
          activePanel={activePanel}
          participantsSettings={stageSettings?.participants || []}
          room={room}
        />
        {stageSettings && (
          <StageSidebar
            stageSettings={stageSettings}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            room={room}
            updateState={updateState}
          />
        )}
      </StyledStage>
    </div>
  );
}

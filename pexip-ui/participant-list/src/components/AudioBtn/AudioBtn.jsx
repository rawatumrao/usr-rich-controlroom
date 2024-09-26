import "./AudioBtn.css";
import "../ParticipantsListBtn/ParticipantsListBtn.css";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../contexts/context";
import { participantsPostFetch } from "../../utils/fetchRequests";
import {
  API_CALLS,
  ALT_TAGS,
  EVENTS,
  LABEL_NAMES,
  YOUR_VB_UUID,
  SHOW_VB_MSG,
} from "../../contexts/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faPhone,
  faPhoneSlash,
} from "@fortawesome/free-solid-svg-icons";

const AudioBtn = ({
  isMuted,
  uuid,
  roleStatus,
  is_audio_only_call,
  pexipBroadCastChannel,
}) => {
  const Data = useContext(AppContext);
  const [muteStatus, setMuteStatus] = useState(isMuted);
  const redBgClassName = muteStatus ? "redBg" : "";

  useEffect(() => {
    setMuteStatus(isMuted);
  }, [isMuted]);

  const muteOrUnmute = () => {
    const call = muteStatus ? API_CALLS.unmute : API_CALLS.mute;

    participantsPostFetch({
      uuid: uuid,
      token: Data.current.token,
      call: call,
    })
      .then((result) => {
        if (result) {
          if (muteStatus && YOUR_VB_UUID !== uuid) {
            pexipBroadCastChannel.postMessage({
              event: EVENTS.sendMsg,
              info: {
                uuid: uuid,
                msg: LABEL_NAMES.unMutedAudioBtnPressMsg,
                buttonType: LABEL_NAMES.audio,
                status: API_CALLS.unmute,
              },
            });
          } else if (muteStatus) {
            SHOW_VB_MSG(LABEL_NAMES.yourAudioUnmuteMsg);
          }

          setMuteStatus((prevState) => !prevState);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const hostIcon = is_audio_only_call ? (
    <FontAwesomeIcon icon={muteStatus ? faPhoneSlash : faPhone} />
  ) : (
    <FontAwesomeIcon icon={muteStatus ? faMicrophoneSlash : faMicrophone} />
  );

  const guestIcon = is_audio_only_call
    ? muteStatus && (
        <FontAwesomeIcon
          icon={faPhoneSlash}
          className="icon redIcon guestIcon"
          title={ALT_TAGS.audioOff}
          alt={ALT_TAGS.audioOff}
        />
      )
    : muteStatus && (
        <FontAwesomeIcon
          icon={faMicrophoneSlash}
          className="icon redIcon guestIcon"
          title={ALT_TAGS.audioOff}
          alt={ALT_TAGS.audioOff}
        />
      );

  return (
    <>
      {roleStatus ? (
        <button
          onClick={muteOrUnmute}
          className={`button ${redBgClassName}`}
          alt={muteStatus ? ALT_TAGS.audioOn : ALT_TAGS.audioOff}
          title={muteStatus ? ALT_TAGS.audioOn : ALT_TAGS.audioOff}
        >
          {hostIcon}
        </button>
      ) : (
        <>{guestIcon}</>
      )}
    </>
  );
};

export default AudioBtn;

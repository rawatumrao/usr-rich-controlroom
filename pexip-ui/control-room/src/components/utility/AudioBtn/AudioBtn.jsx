import "./AudioBtn.css";
import "../ParticipantsListBtn/ParticipantsListBtn.css";
import { useState, useEffect } from "react";
import { ALT_TAGS } from "../../../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophoneSlash,
  faPhoneSlash,
} from "@fortawesome/free-solid-svg-icons";

const AudioBtn = ({ isMuted, is_audio_only_call }) => {
  const [muteStatus, setMuteStatus] = useState(isMuted);

  useEffect(() => {
    setMuteStatus(isMuted);
  }, [isMuted]);

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

  return <>{guestIcon}</>;
};

export default AudioBtn;

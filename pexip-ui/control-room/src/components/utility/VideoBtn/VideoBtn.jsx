import "./VideoBtn.css";
import "../ParticipantsListBtn/ParticipantsListBtn.css";
import { useState, useEffect } from "react";

import { ALT_TAGS } from "../../../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideoSlash } from "@fortawesome/free-solid-svg-icons";

const VideoBtn = ({ isCameraMuted }) => {
  const [videoMuteStatus, SetvideoMuteStatus] = useState(isCameraMuted);

  useEffect(() => {
    SetvideoMuteStatus(isCameraMuted);
  }, [isCameraMuted]);

  const guestIcon = videoMuteStatus && (
    <FontAwesomeIcon
      className="icon redIcon guestIcon"
      icon={faVideoSlash}
      title={ALT_TAGS.videoOff}
      alt={ALT_TAGS.videoOff}
    />
  );

  return <>{guestIcon}</>;
};

export default VideoBtn;

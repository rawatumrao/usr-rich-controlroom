import "./VideoBtn.css";
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
import { faVideo, faVideoSlash } from "@fortawesome/free-solid-svg-icons";

const VideoBtn = ({
  isCameraMuted,
  uuid,
  roleStatus,
  pexipBroadCastChannel,
}) => {
  const Data = useContext(AppContext);
  const [videoMuteStatus, SetvideoMuteStatus] = useState(isCameraMuted);
  const redBgClassName = videoMuteStatus ? "redBg" : "";

  useEffect(() => {
    SetvideoMuteStatus(isCameraMuted);
  }, [isCameraMuted]);

  const videoMuteOrUnmute = () => {
    const call = videoMuteStatus
      ? API_CALLS.video_unmuted
      : API_CALLS.video_muted;

    participantsPostFetch({
      uuid: uuid,
      token: Data.current.token,
      call: call,
    })
      .then((result) => {
        if (result) {
          if (YOUR_VB_UUID !== uuid) {
            if (videoMuteStatus) {
              pexipBroadCastChannel.postMessage({
                event: EVENTS.sendMsg,
                info: {
                  uuid: uuid,
                  msg: LABEL_NAMES.unMutedBtnVideoPressMsg,
                  buttonType: LABEL_NAMES.video,
                  status: API_CALLS.video_unmuted,
                },
              });
            } else {
              pexipBroadCastChannel.postMessage({
                event: EVENTS.sendMsg,
                info: {
                  uuid: uuid,
                  msg: LABEL_NAMES.muteBtnVideoPressMsg,
                  buttonType: LABEL_NAMES.video,
                  status: API_CALLS.video_muted,
                },
              });
            }
          } else {
            if (videoMuteStatus) {
              SHOW_VB_MSG(LABEL_NAMES.yourUnMuteBtnVideoMsg);
            } else {
              SHOW_VB_MSG(LABEL_NAMES.yourMuteBtnVideosMsg);
            }
          }

          SetvideoMuteStatus((prevState) => !prevState);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const hostIcon = (
    <button
      onClick={videoMuteOrUnmute}
      className={`button ${redBgClassName}`}
      alt={videoMuteStatus ? ALT_TAGS.videoOn : ALT_TAGS.videoOff}
      title={videoMuteStatus ? ALT_TAGS.videoOn : ALT_TAGS.videoOff}
    >
      <FontAwesomeIcon icon={videoMuteStatus ? faVideoSlash : faVideo} />
    </button>
  );

  const guestIcon = videoMuteStatus && (
    <FontAwesomeIcon
      className="icon redIcon guestIcon"
      icon={faVideoSlash}
      title={ALT_TAGS.videoOff}
      alt={ALT_TAGS.videoOff}
    />
  );

  return <>{roleStatus ? hostIcon : guestIcon}</>;
};

export default VideoBtn;

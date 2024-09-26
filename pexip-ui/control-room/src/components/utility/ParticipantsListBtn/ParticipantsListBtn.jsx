import "./ParticipantsListBtn.css";
import AudioBtn from "../AudioBtn/AudioBtn";
import VideoBtn from "../VideoBtn/VideoBtn";

import { BUTTON_NAMES } from "../../../constants/constants";

const ParticipantsListBtn = ({ attr, ...props }) => {
  let btn = "";
  let key = `${attr}_${props.uuid.split("-")[0]}`;

  if (attr === BUTTON_NAMES.audio) btn = <AudioBtn key={key} {...props} />;
  else if (attr === BUTTON_NAMES.video) btn = <VideoBtn key={key} {...props} />;
  return btn;
};

export default ParticipantsListBtn;

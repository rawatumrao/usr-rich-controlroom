import "./ParticipantsListBtn.css";
import AudioBtn from "../AudioBtn/AudioBtn";
import VideoBtn from "../VideoBtn/VideoBtn";
import SpotlightBtn from "../SpotlightBtn/SpotlightBtn";
import AdmitBtn from "../AdmitBtn/AdmitBtn";
import DenyBtn from "../DenyBtn/DenyBtn";
import { BUTTON_NAMES } from "../../contexts/constants";

const ParticipantsListBtn = ({ attr, ...props }) => {
  let btn = "";
  let key = `${attr}_${props.uuid.split("-")[0]}`;

  if (attr === BUTTON_NAMES.audio) btn = <AudioBtn key={key} {...props} />;
  else if (attr === BUTTON_NAMES.video) btn = <VideoBtn key={key} {...props} />;
  else if (attr === BUTTON_NAMES.spotlight)
    btn = <SpotlightBtn key={key} {...props} />;
  else if (attr === BUTTON_NAMES.admit) btn = <AdmitBtn key={key} {...props} />;
  else if (attr === BUTTON_NAMES.deny) btn = <DenyBtn key={key} {...props} />;
  return btn;
};

export default ParticipantsListBtn;

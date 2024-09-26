import "./DtmfBtn.css";
import { ALT_TAGS, BUTTON_NAMES, YOUR_VB_UUID } from "../../contexts/constants";

const DtmfBtn = ({
  openOrCloseDialogBg,
  openDtmf,
  uuid,
  is_audio_only_call,
}) => {
  const openKeypad = () => {
    openOrCloseDialogBg();
    openDtmf();
  };

  return (
    <button
      onClick={openKeypad}
      className={`${
        uuid === YOUR_VB_UUID || is_audio_only_call
          ? "actionButton roundUpperCorners"
          : "actionButton"
      }`}
      alt={ALT_TAGS.openDtmf}
    >
      {BUTTON_NAMES.openDTMFKeypad}
    </button>
  );
};

export default DtmfBtn;

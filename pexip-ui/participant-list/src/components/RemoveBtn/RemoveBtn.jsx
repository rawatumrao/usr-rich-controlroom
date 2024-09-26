import "./RemoveBtn.css";
import { ALT_TAGS, BUTTON_NAMES } from "../../contexts/constants";

const RemoveBtn = ({
  openOrCloseRemoveDialog,
  openOrCloseDialogBg,
  rtmpStream,
}) => {
  const removeParticipant = () => {
    openOrCloseRemoveDialog();
    openOrCloseDialogBg();
  };

  return (
    <>
      <button
        className="actionButton removeBtn"
        alt={ALT_TAGS.remove}
        onClick={removeParticipant}
      >
        {rtmpStream ? BUTTON_NAMES.removeStream : BUTTON_NAMES.removePresenter}
      </button>
    </>
  );
};

export default RemoveBtn;

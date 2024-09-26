import "./RemoveDialog.css";
import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../../contexts/context";
import { participantsPostFetch } from "../../utils/fetchRequests";
import {
  API_CALLS,
  ALT_TAGS,
  BUTTON_NAMES,
  LABEL_NAMES,
} from "../../contexts/constants";

const RemoveDialog = ({
  uuid,
  overlayText,
  openOrCloseRemoveDialog,
  refrence,
}) => {
  const defaultLabelMsg = `${LABEL_NAMES.removeDialog1} ${overlayText} ${LABEL_NAMES.removeDialog2}`;
  const Data = useContext(AppContext);
  const [labelMsg, setLabelMsg] = useState(defaultLabelMsg);

  const handleRemoveBtn = () => {
    participantsPostFetch({
      uuid: uuid,
      token: Data.current.token,
      call: API_CALLS.disconnect,
    })
      .then((result) => {
        if (result) {
          openOrCloseRemoveDialog();
          setLabelMsg(defaultLabelMsg);
        } else {
          setLabelMsg(
            `${LABEL_NAMES.removeDialogErrorMsg1} ${overlayText} ${LABEL_NAMES.removeDialogErrorMsg2}`
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCancelBtn = () => {
    openOrCloseRemoveDialog();
    setLabelMsg(defaultLabelMsg);
  };

  return createPortal(
    <dialog className="removeDialog dialogs lightBg" ref={refrence}>
      <label>{labelMsg}</label>
      <div className="buttonContainer">
        <button
          className="removeDialogBtn dialogBtnLight roundedConers"
          alt={ALT_TAGS.cancel}
          onClick={handleCancelBtn}
        >
          {BUTTON_NAMES.cancel}
        </button>
        <button
          className="removeDialogBtn remove dialogBtn roundedConers"
          alt={ALT_TAGS.remove}
          onClick={handleRemoveBtn}
        >
          {BUTTON_NAMES.remove}
        </button>
      </div>
    </dialog>,
    document.getElementById("modal")
  );
};

export default RemoveDialog;

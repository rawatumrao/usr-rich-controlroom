import "./DtmfDialog.css";
import { useContext, useState } from "react";
import { AppContext } from "../../contexts/context";
import { participantsPostWithBody } from "../../utils/fetchRequests";
import { API_CALLS, HEADERS } from "../../contexts/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/pro-light-svg-icons";
import { createPortal } from "react-dom";

const DtmfDialog = ({ uuid, refrence, openOrCloseDtmf }) => {
  const Data = useContext(AppContext);
  const [inputValue, setInputValue] = useState("");
  const dtmfButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"];

  const closeDTMFandSetBlankTxtVal = () => {
    openOrCloseDtmf();
    setInputValue("");
  };

  const handleChange = (value) => {
    sendDtmfPost(value);
  };

  const sendDtmfPost = (value) => {
    participantsPostWithBody({
      uuid: uuid,
      token: Data.current.token,
      call: API_CALLS.dtmf,
      body: { digits: `${value}` },
    })
      .then((result) => {
        if (result) {
          if (inputValue.length > 21) setInputValue("");
          setInputValue((prevValue) => `${prevValue}${value}`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const dtmfDialogBtns = dtmfButtons.map((btn, index) => (
    <button
      key={index}
      className="dtmfBtn dialogBtn"
      alt={`${btn} button`}
      onClick={() => handleChange(btn)}
    >
      {btn}
    </button>
  ));

  return createPortal(
    <dialog
      ref={refrence}
      id="dtmfDialog"
      className="dtmfDialog dialogs lightBg"
    >
      <div className="closeBtnDiv">
        <h3 className="header">{HEADERS.dtmfHeader}</h3>
        <FontAwesomeIcon icon={faX} onClick={closeDTMFandSetBlankTxtVal} />
      </div>
      <input
        className="dtmfInput roundedConers"
        type="text"
        defaultValue={inputValue}
        readOnly
      />
      <div className="dialogBtns">{dtmfDialogBtns}</div>
    </dialog>,
    document.getElementById("modal")
  );
};

export default DtmfDialog;

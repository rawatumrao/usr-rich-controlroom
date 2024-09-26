import "./EditPresenterProfileDialog.css";
import { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../../contexts/context";
import { participantsPostWithBody } from "../../utils/fetchRequests";
import {
  API_CALLS,
  ALT_TAGS,
  HEADERS,
  LABEL_NAMES,
  BUTTON_NAMES,
  ROLES,
} from "../../contexts/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/pro-light-svg-icons";

const EditPresenterProfileDialog = ({
  uuid,
  uri,
  refrence,
  rtmpStream,
  overlayText,
  role,
  protocol,
  startAt,
  openOrCloseEditPresenterProfile,
}) => {
  console.log;
  const Data = useContext(AppContext);
  const [inputValue, setInputValue] = useState(overlayText);

  useEffect(() => {
    setInputValue(overlayText);
  }, [overlayText]);

  const changeOverlayText = (evt) => {
    if (inputValue.length === 0) return;
    evt.preventDefault();
    openOrCloseEditPresenterProfile();
    participantsPostWithBody({
      uuid: uuid,
      token: Data.current.token,
      call: API_CALLS.overlaytext,
      body: { text: `${inputValue}` },
    });
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return createPortal(
    <dialog
      ref={refrence}
      id="editProfileDialog"
      className="editProfileDialog dialogs roundedConers lightBg"
    >
      <div className="closeBtnDiv">
        <h3 className="header">
          {rtmpStream ? HEADERS.streamProfile : HEADERS.presenterProfile}
        </h3>
        <FontAwesomeIcon icon={faX} onClick={openOrCloseEditPresenterProfile} />
      </div>
      <div id="editProfileDiv" className="editProfileDiv">
        <label htmlFor="editName">{LABEL_NAMES.profileEditName}</label>
        <div className="editProfileTxtContainer">
          <form>
            <input
              type="text"
              id="name"
              className="updateProfileTxt fontSize"
              name="editName"
              value={inputValue}
              onChange={handleChange}
              required
            />
            <button
              onClick={changeOverlayText}
              className="updateProfileBtn dialogBtn roundedConers fontSize"
              alt={ALT_TAGS.submitNewOverlayName}
            >
              {BUTTON_NAMES.update}
            </button>
          </form>
        </div>

        <div className="editProfileLabelContainer">
          <div className="editProfileLeftSide fontSize">
            <label className="updateProfileLabel">{LABEL_NAMES.role}</label>
            <label className="updateProfileLabel">{LABEL_NAMES.joined}</label>
            <label className="updateProfileLabel">{LABEL_NAMES.protocol}</label>
            <label className="updateProfileLabel">{LABEL_NAMES.id}</label>
          </div>
          <div className="editProfileRightSide fontSize">
            <label>
              {role === ROLES.chair
                ? ROLES.upperCaseHost
                : ROLES.upperCaseGuest}
            </label>
            <label>{startAt}</label>
            <label>{protocol ?? LABEL_NAMES.unknown}</label>
            <label className="editProfileName">
              {uri ?? LABEL_NAMES.unknown}
            </label>
          </div>
        </div>
      </div>
    </dialog>,
    document.getElementById("modal")
  );
};

export default EditPresenterProfileDialog;

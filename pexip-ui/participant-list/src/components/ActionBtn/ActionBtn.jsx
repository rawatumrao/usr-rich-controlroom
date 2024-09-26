import "./ActionBtn.css";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import MakeHostBtn from "../MakeHostBtn/MakeHostBtn";
import RemoveBtn from "../RemoveBtn/RemoveBtn";
import HandBtn from "../HandBtn/HandBtn";
import ScreenShareBtn from "../ScreenShareBtn/ScreenShareBtn";
import DtmfBtn from "../DtmfBtn/DtmfBtn";
import DtmfDialog from "../DtmfDialog/DtmfDialog";
import EditPresenterProfile from "../EditPresenterProfile/EditPresenterProfile";
import EditPresenterProfileDialog from "../EditPresenterProfileDialog/EditPresenterProfileDialog";
import RemoveDialog from "../RemoveDialog/RemoveDialog";
import { ALT_TAGS, YOUR_VB_UUID } from "../../contexts/constants";

const ActionBtn = ({ ...props }) => {
  const dtmfDialog = useRef();
  const actionBtnRef = useRef();
  const removeDialog = useRef();
  const editProfileDialog = useRef();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [location, setLocation] = useState();
  const buttonHeight = 29;
  const fullDrawerHeight = 174; //TODO: Fix this wtih dynamic value
  const drawMargin = 10;

  //TODO: make these functions pass refs instead of calling each
  // Edit Presenter Profile Dialog
  const openOrCloseEditPresenterProfile = () => {
    if (editProfileDialog.current.classList.contains("open")) {
      editProfileDialog.current.classList.remove("open");
      setDialogOpen(false);
    } else {
      editProfileDialog.current.classList.add("open");
      setDialogOpen(true);
    }

    editProfileDialog.current.focus();
  };

  // DTMF Dialog
  const openOrCloseDtmf = () => {
    if (dtmfDialog.current.classList.contains("open")) {
      dtmfDialog.current.classList.remove("open");
      setDialogOpen(false);
    } else {
      dtmfDialog.current.classList.add("open");
      setDialogOpen(true);
    }

    dtmfDialog.current.focus();
  };

  // Opeon or Close Dialog
  const openOrCloseRemoveDialog = () => {
    if (removeDialog.current.classList.contains("openFlex")) {
      removeDialog.current.classList.remove("openFlex");
      setDialogOpen(false);
    } else {
      removeDialog.current.classList.add("openFlex");
      setDialogOpen(true);
    }

    removeDialog.current.focus();
  };

  // Close all dialogs
  const closeAllDialogs = () => {
    if (removeDialog.current.classList.contains("openFlex"))
      removeDialog.current.classList.remove("openFlex");
    else if (dtmfDialog.current.classList.contains("open"))
      dtmfDialog.current.classList.remove("open");
    else if (editProfileDialog.current.classList.contains("open"))
      editProfileDialog.current.classList.remove("open");
  };

  // Open or CLose Dialog BG
  const openOrCloseDialogBg = () => {
    if (dialogOpen) {
      closeAllDialogs();
      setDialogOpen(!dialogOpen);
    } else if (openDrawer) setOpenDrawer(!openDrawer);
  };

  // Action Button Drawer
  const openDropdown = () => {
    getPosition();
    openDrawer ? setOpenDrawer(false) : setOpenDrawer(true);
  };

  const getPosition = () => {
    if (actionBtnRef.current === null) return;
    let top = 0;
    let extraHeightforMe = 0;
    if (props.uuid === YOUR_VB_UUID)
      extraHeightforMe = props.raisedHand ? 0 : buttonHeight;

    if (actionBtnRef.current.offsetTop) {
      // top
      if (
        window.innerHeight <
        actionBtnRef.current.offsetTop +
          actionBtnRef.current.offsetHeight +
          fullDrawerHeight +
          drawMargin
      ) {
        let value = props.rtmpStream
          ? buttonHeight * 2 + 20
          : buttonHeight + extraHeightforMe - 7;
        if (props.is_audio_only_call) value += buttonHeight * 2;

        top =
          actionBtnRef.current.offsetTop -
          actionBtnRef.current.offsetHeight -
          fullDrawerHeight +
          value +
          buttonHeight -
          3; //TOOD: FIX ME to be dynamic value
        setLocation(top);
      } else {
        // bottom
        top =
          actionBtnRef.current.offsetTop +
          actionBtnRef.current.offsetHeight +
          drawMargin -
          drawMargin / 2;
        setLocation(top);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("resize", getPosition);
  }, []);

  const dialogs = (
    <>
      <EditPresenterProfileDialog
        refrence={editProfileDialog}
        openOrCloseEditPresenterProfile={openOrCloseEditPresenterProfile}
        {...props}
      ></EditPresenterProfileDialog>
      <DtmfDialog
        refrence={dtmfDialog}
        openOrCloseDtmf={openOrCloseDtmf}
        {...props}
      ></DtmfDialog>
      <RemoveDialog
        refrence={removeDialog}
        openOrCloseRemoveDialog={openOrCloseRemoveDialog}
        openDropdown={openDropdown}
        {...props}
      ></RemoveDialog>
    </>
  );

  const drawerBtns = (
    <>
      {props.rtmpStream ? null : (
        <>
          {YOUR_VB_UUID === props.uuid || props.is_audio_only_call ? null : (
            <MakeHostBtn closeDrawer={openDropdown} {...props} />
          )}

          <DtmfBtn
            openOrCloseDialogBg={openOrCloseDialogBg}
            openDtmf={openOrCloseDtmf}
            {...props}
          />
        </>
      )}
      <EditPresenterProfile
        openOrCloseDialogBg={openOrCloseDialogBg}
        openEditProfile={openOrCloseEditPresenterProfile}
        {...props}
      ></EditPresenterProfile>
      {props.is_audio_only_call ? null : (
        <ScreenShareBtn closeDrawer={openDropdown} {...props} />
      )}
      {props.raisedHand && <HandBtn closeDrawer={openDropdown} {...props} />}
      <RemoveBtn
        openOrCloseRemoveDialog={openOrCloseRemoveDialog}
        {...props}
        openOrCloseDialogBg={openOrCloseDialogBg}
      />
    </>
  );

  return (
    <>
      {dialogs}
      <button
        onClick={openDropdown}
        ref={actionBtnRef}
        className="button ellipsisBtn"
        title={ALT_TAGS.openActionMenu}
        alt={ALT_TAGS.openActionMenu}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </button>
      <div
        className={`${
          openDrawer || dialogOpen
            ? "dropDownHiddenBgOpen"
            : "dropDownHiddenBgClosed"
        }`}
        onClick={openOrCloseDialogBg}
      ></div>
      <div
        className={`dropdown lightBg roundedConers ${
          openDrawer ? "dropDownOpen" : "dropDownClosed"
        }`}
        style={{ top: location, right: "15px" }}
      >
        {drawerBtns}
      </div>
    </>
  );
};

export default ActionBtn;

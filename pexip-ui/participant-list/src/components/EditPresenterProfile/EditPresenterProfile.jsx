import "./EditPresenterProfile.css";
import { ALT_TAGS, BUTTON_NAMES, PROTOCOLS } from "../../contexts/constants";

const EditPresenterProfile = ({
  openOrCloseDialogBg,
  openEditProfile,
  rtmpStream,
  protocol,
}) => {
  const openProfile = () => {
    openOrCloseDialogBg();
    openEditProfile();
  };

  return (
    <button
      onClick={openProfile}
      className={`${
        protocol === PROTOCOLS.rtmp
          ? "actionButton roundUpperCorners"
          : "actionButton"
      }`}
      alt={ALT_TAGS.editProfile}
    >
      {rtmpStream ? BUTTON_NAMES.editStreamProfile : BUTTON_NAMES.editProfile}
    </button>
  );
};

export default EditPresenterProfile;

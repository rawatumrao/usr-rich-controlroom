import "./ScreenShareBtn.css";
import { useContext } from "react";
import { AppContext } from "../../contexts/context";
import { participantsPostFetch } from "../../utils/fetchRequests";
import {
  API_CALLS,
  ALT_TAGS,
  SHOW_VB_MSG,
  LABEL_NAMES,
} from "../../contexts/constants";

const ScreenShareBtn = ({ rxPresentation, uuid, closeDrawer, overlayText }) => {
  const Data = useContext(AppContext);

  const screenShareAllowOrDeny = () => {
    closeDrawer();
    const screenShareCall = rxPresentation
      ? API_CALLS.denyShares
      : API_CALLS.allowShares;

    participantsPostFetch({
      uuid: uuid,
      token: Data.current.token,
      call: screenShareCall,
    })
      .then((result) => {
        if (result)
          SHOW_VB_MSG(
            `${overlayText} ${
              rxPresentation
                ? LABEL_NAMES.contentshareDisabled
                : LABEL_NAMES.contentshareEnabled
            }`
          );
        else
          SHOW_VB_MSG(
            `${
              rxPresentation
                ? LABEL_NAMES.errorContentshareDisabled1
                : LABEL_NAMES.errorContentshareEnabled1
            } ${overlayText} ${
              rxPresentation
                ? LABEL_NAMES.errorContentshareDisabled2
                : LABEL_NAMES.errorContentshareEnabled2
            }`
          );
      })
      .catch((err) => {
        SHOW_VB_MSG(
          `${
            rxPresentation
              ? LABEL_NAMES.errorContentshareDisabled1
              : LABEL_NAMES.errorContentshareEnabled1
          } ${overlayText} ${
            rxPresentation
              ? LABEL_NAMES.errorContentshareDisabled2
              : LABEL_NAMES.errorContentshareEnabled2
          }`
        );
        console.log(err);
      });
  };

  return (
    <button
      onClick={screenShareAllowOrDeny}
      className="actionButton"
      alt={rxPresentation ? ALT_TAGS.denyShares : ALT_TAGS.allowShares}
    >
      {rxPresentation ? ALT_TAGS.denyShares : ALT_TAGS.allowShares}
    </button>
  );
};

export default ScreenShareBtn;

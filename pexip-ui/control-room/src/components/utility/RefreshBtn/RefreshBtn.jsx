import "./RefreshBtn.css";
import { useContext } from "react";
import { AppContext } from "../../../contexts/context";
import { EVENTS } from "../../../constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";

const RefreshBtn = ({ pexipBroadCastChannel }) => {
  const { voiceActivated, presenterLayout, showRefresh } =
    useContext(AppContext);

  const onClickHandle = async () => {
    // updated default variables videobridge.jsp
    await pexipBroadCastChannel.postMessage({
      event: EVENTS.controlRoomRefresh,
      info: {
        voiceActivated: voiceActivated,
        presenterLayout: presenterLayout,
        // showRefresh: false,
      },
    });

    window.location.reload();
  };

  return (
    <>
      {showRefresh && (
        <button className="refreshBtn" onClick={onClickHandle}>
          <span className="refreshSpan">Reload Latest</span>
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
      )}
    </>
  );
};

export default RefreshBtn;

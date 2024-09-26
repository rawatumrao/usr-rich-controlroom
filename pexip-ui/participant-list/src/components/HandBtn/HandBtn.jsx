import "./HandBtn.css";
import { useContext } from "react";
import { AppContext } from "../../contexts/context";
import { participantsPostFetch } from "../../utils/fetchRequests";
import { API_CALLS, ALT_TAGS } from "../../contexts/constants";

const HandBtn = ({ raisedHand, uuid, closeDrawer }) => {
  const Data = useContext(AppContext);

  const raiseOrLowerHand = () => {
    closeDrawer();
    const handPosition = raisedHand ? API_CALLS.lowerHand : API_CALLS.raiseHand;

    participantsPostFetch({
      uuid: uuid,
      token: Data.current.token,
      call: handPosition,
    });
  };

  return (
    <button
      onClick={raiseOrLowerHand}
      className="actionButton"
      alt={raisedHand ? ALT_TAGS.loweredHand : ALT_TAGS.raiseHand}
    >
      {raisedHand ? ALT_TAGS.loweredHand : ALT_TAGS.raiseHand}
    </button>
  );
};

export default HandBtn;

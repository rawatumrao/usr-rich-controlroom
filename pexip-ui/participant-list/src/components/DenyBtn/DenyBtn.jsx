import "./DenyBtn.css";
import "../ParticipantsListBtn/ParticipantsListBtn.css";
import { useContext } from "react";
import { AppContext } from "../../contexts/context";
import { participantsPostFetch } from "../../utils/fetchRequests";
import { API_CALLS, ALT_TAGS } from "../../contexts/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

const DenyBtn = ({ uuid }) => {
  const Data = useContext(AppContext);

  const deny = () => {
    participantsPostFetch({
      uuid: uuid,
      token: Data.current.token,
      call: API_CALLS.disconnect,
    });
  };

  return (
    <button
      onClick={deny}
      className="button redBg"
      alt={ALT_TAGS.deny}
      title={ALT_TAGS.deny}
    >
      <FontAwesomeIcon icon={faX} />
    </button>
  );
};

export default DenyBtn;

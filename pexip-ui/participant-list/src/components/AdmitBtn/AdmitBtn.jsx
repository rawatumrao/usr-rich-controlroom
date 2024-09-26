import "./AdmitBtn.css";
import "../ParticipantsListBtn/ParticipantsListBtn.css";
import { useContext } from "react";
import { AppContext } from "../../contexts/context";
import { participantsPostFetch } from "../../utils/fetchRequests";
import { API_CALLS, ALT_TAGS } from "../../contexts/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";

const AdmitBtn = ({ uuid }) => {
  const Data = useContext(AppContext);

  const admit = () => {
    participantsPostFetch({
      uuid: uuid,
      token: Data.current.token,
      call: API_CALLS.unlock,
    });
  };

  return (
    <button
      onClick={admit}
      className="button greenBg"
      alt={ALT_TAGS.admit}
      title={ALT_TAGS.admit}
    >
      <FontAwesomeIcon icon={faPhone} />
    </button>
  );
};

export default AdmitBtn;

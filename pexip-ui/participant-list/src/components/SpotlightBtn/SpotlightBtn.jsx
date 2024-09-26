import "./SpotlightBtn.css";
import "../ParticipantsListBtn/ParticipantsListBtn.css";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../contexts/context";
import { participantsPostFetch } from "../../utils/fetchRequests";
import { API_CALLS, ALT_TAGS } from "../../contexts/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStarSharp } from "@fortawesome/pro-light-svg-icons";

const SpotlightBtn = ({ spotlightOrder, uuid, roleStatus }) => {
  const Data = useContext(AppContext);
  const [spotlightStatus, setSpotlightStatus] = useState(spotlightOrder);

  useEffect(() => {
    setSpotlightStatus(spotlightOrder);
  }, [spotlightOrder]);

  const spotLightOnOrOff = () => {
    const call = spotlightStatus
      ? API_CALLS.spotlightoff
      : API_CALLS.spotlighton;

    participantsPostFetch({
      uuid: uuid,
      token: Data.current.token,
      call: call,
    })
      .then((result) => {
        if (result) setSpotlightStatus((prevState) => !prevState);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const hostIcon = (
    <button
      onClick={spotLightOnOrOff}
      className="button"
      alt={spotlightStatus ? ALT_TAGS.spotlightOff : ALT_TAGS.spotlightOn}
      title={spotlightStatus ? ALT_TAGS.spotlightOff : ALT_TAGS.spotlightOn}
    >
      <FontAwesomeIcon
        icon={spotlightStatus ? faStar : faStarSharp}
        className={spotlightStatus ? "highlighted" : null}
      />
    </button>
  );

  const guestIcon = spotlightStatus ? (
    <FontAwesomeIcon
      icon={faStar}
      className={"highlighted icon guestIcon"}
      alt={ALT_TAGS.spotlightOn}
      title={ALT_TAGS.spotlightOn}
    />
  ) : null;

  return <>{roleStatus ? hostIcon : guestIcon}</>;
};

export default SpotlightBtn;

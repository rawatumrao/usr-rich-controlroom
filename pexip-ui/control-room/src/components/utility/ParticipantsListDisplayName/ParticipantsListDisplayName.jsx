import "./ParticipantsListDisplayName.css";
import { ROLES, YOUR_VB_UUID, HEADERS } from "../../../constants/constants";

const ParticipantsListDisplayName = ({ role, overlayText, uuid, header }) => {
  const name =
    YOUR_VB_UUID === uuid ? (
      <span className="meBold">{overlayText} </span>
    ) : (
      <span>{overlayText} </span>
    );

  const hostOrNot =
    role === ROLES.chair && header !== HEADERS.streams
      ? ROLES.hostSlashString
      : null;

  return (
    <div className="displayName">
      <span className="displayNameSpan">
        {name}
        <span className="hostColor">{hostOrNot}</span>
      </span>
    </div>
  );
};

export default ParticipantsListDisplayName;

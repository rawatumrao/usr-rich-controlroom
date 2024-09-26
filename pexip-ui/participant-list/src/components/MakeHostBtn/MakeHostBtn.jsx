import "./MakeHostBtn.css";
import { useContext } from "react";
import { AppContext } from "../../contexts/context";
import { participantsPostWithBody } from "../../utils/fetchRequests";
import {
  API_CALLS,
  ALT_TAGS,
  ROLES,
  BUTTON_NAMES,
} from "../../contexts/constants";

const MakeHostBtn = ({ role, uuid, closeDrawer }) => {
  const Data = useContext(AppContext);

  const makeHostOrGuest = () => {
    closeDrawer();
    const roleCall = role === ROLES.chair ? ROLES.guest : ROLES.chair;

    participantsPostWithBody({
      uuid: uuid,
      token: Data.current.token,
      call: API_CALLS.role,
      body: { role: `${roleCall}` },
    });
  };

  return (
    <button
      onClick={makeHostOrGuest}
      className="actionButton makeHostBtn"
      alt={role === ROLES.chair ? ALT_TAGS.makeguest : ALT_TAGS.makeHost}
    >
      {role === ROLES.chair ? BUTTON_NAMES.makeguest : BUTTON_NAMES.makeHost}
    </button>
  );
};

export default MakeHostBtn;

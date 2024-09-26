import { useState, useRef, useEffect } from "react";
import "./App.css";
import ParticipantList from "../ParticipantList/ParticipantList";
import {
  EVENTS,
  INITIAL_TOKEN,
  INITIAL_PARTICIPANT,
  ENV,
  ENVIRONMENT,
  HEADERS,
  PARTICIPANTS_LIST_PROTOCOLS,
  WAITING_TO_JOIN_LIST_SERVICE_TYPE,
  STREAM_LIST_PROTOCOLS,
  YOUR_VB_UUID,
  ROLE_STATUS,
} from "../../contexts/constants";
import { AppContext } from "../../contexts/context";
import { createData } from "../../utils/processJsonData";
import {
  findRoleOfUser,
  sortParticipantServiceType,
  sortParticipants,
} from "../../utils/categorizeFuncs";
import { fetchInitialParticipants } from "../../utils/fetchRequests";

const bc = new BroadcastChannel("pexip");

const App = () => {
  const [participantsArray, setParticipantsArray] = useState(
    createData(INITIAL_PARTICIPANT)
  );
  const [roleStatus, setRoleStatus] = useState(ROLE_STATUS);
  const [talkingPplArray, setTalkingPplArray] = useState([]);
  const Data = useRef({
    token: INITIAL_TOKEN,
  });

  useEffect(() => {
    if (ENV === ENVIRONMENT.prod) {
      if (participantsArray.length) {
        setRoleStatus(findRoleOfUser(participantsArray));
      } else {
        fetchInitialParticipants()
          .then((data) => {
            let updatedData = createData(data.result);
            setParticipantsArray(updatedData);
            setRoleStatus(findRoleOfUser(updatedData));
            return;
          })
          .catch((error) => console.error(error));
      }
    }

    // get server sent events on pexip broadcast channel
    bc.onmessage = (msg) => {
      if (msg?.data?.event === EVENTS.token_refresh) {
        if (msg?.data?.uuid === YOUR_VB_UUID) {
          Data.current.token = msg?.data?.info;
          console.log(msg.data);
        }
      } else if (msg.data.event === EVENTS.participants) {
        let updatedData = createData(msg?.data?.info?.participants);
        setParticipantsArray(updatedData);
        setRoleStatus(findRoleOfUser(updatedData));
        console.log(updatedData);
      } else if (msg.data.event === EVENTS.stage) {
        console.log(msg?.data?.info);
        const updatedData = createData(msg?.data?.info);
        setTalkingPplArray(updatedData);
      }
    };
  }, []);

  return (
    <AppContext.Provider value={Data}>
      {roleStatus && (
        <ParticipantList
          participantsArray={sortParticipantServiceType(
            participantsArray,
            WAITING_TO_JOIN_LIST_SERVICE_TYPE
          )}
          header={HEADERS.waitingToJoin}
          roleStatus={roleStatus}
          talkingPplArray={[]}
          pexipBroadCastChannel={bc}
        />
      )}

      <ParticipantList
        participantsArray={sortParticipants(
          participantsArray,
          PARTICIPANTS_LIST_PROTOCOLS,
          roleStatus,
          false
        )}
        header={HEADERS.presenters}
        roleStatus={roleStatus}
        talkingPplArray={talkingPplArray}
        pexipBroadCastChannel={bc}
      />

      <ParticipantList
        participantsArray={sortParticipants(
          participantsArray,
          STREAM_LIST_PROTOCOLS,
          roleStatus,
          true
        )}
        header={HEADERS.streams}
        roleStatus={roleStatus}
        talkingPplArray={[]}
        pexipBroadCastChannel={bc}
      />
    </AppContext.Provider>
  );
};

export default App;

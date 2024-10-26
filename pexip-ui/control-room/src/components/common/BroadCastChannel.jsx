import { useContext, useEffect } from "react";
import { AppContext } from "../../contexts/context";
import { useLocation } from "react-router-dom";
import { fetchInitialParticipants } from "../../services/fetchRequests";
import {
  ENV,
  ENVIRONMENT,
  YOUR_VB_UUID,
  EVENTS,
} from "../../constants/constants";
import { createData } from "../../utils/processJsonData";

const BroadCastChannel = () => {
  const {
    Data,
    participantsArray,
    setParticipantsArray,
    pexipBroadCastChannel,
    isLoaded,
    setIsLoaded,
    setCurentlayout,
    handlePresenterLayoutChange,
  } = useContext(AppContext);
  const location = useLocation();

  useEffect(() => {
    // console.log("useEffect");
    if (ENV === ENVIRONMENT.prod) {
      if (participantsArray.length < 1) {
        fetchInitialParticipants()
          .then((data) => {
            let updatedData = createData(data.result);
            setParticipantsArray(updatedData);
            return;
          })
          .catch((error) => console.error(error));
      }

      // turn off loading screen after 5 seconds if not already loaded
      setTimeout(() => {
        if (isLoaded === false) setIsLoaded(true);
      }, 5000);
    }

    // get server sent events on pexip broadcast channel
    pexipBroadCastChannel.onmessage = (msg) => {
      if (msg.data.event === EVENTS.token_refresh) {
        if (ENV === ENVIRONMENT.prod) {
          if (msg?.data?.uuid === YOUR_VB_UUID) {
            Data.current.token = msg?.data?.info;
          }
        } else {
          Data.current.token = msg?.data?.info;
        }
        // console.log(`New TOKEN:`);
        // console.log(msg.data);
      } else if (msg.data.event === EVENTS.participants) {
        let updatedData = createData(msg?.data?.info?.participants);
        setParticipantsArray(updatedData);
        // console.log(updatedData);
      } else if (msg.data.event === EVENTS.controlRoomisLoaded) {
        setIsLoaded(true);
      } else if (msg.data.event === EVENTS.controlRoomLayoutUpdate) {
        handlePresenterLayoutChange(msg?.data?.info?.presenterLayout);
        setCurentlayout(msg?.data?.info?.presenterLayout);
      } else if (msg.data.event === EVENTS.conntrolRoomReload) {
        window.location.reload();
      }
    };

    if (isLoaded === false) {
      pexipBroadCastChannel.postMessage({
        event: EVENTS.controlRoomIsLoaded,
        info: {},
      });
    }
  }, [location]);
};

export default BroadCastChannel;

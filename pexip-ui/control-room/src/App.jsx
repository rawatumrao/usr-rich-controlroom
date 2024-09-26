import "./App.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  EVENTS,
  INITIAL_TOKEN,
  INITIAL_PARTICIPANT,
  ENV,
  ENVIRONMENT,
  HEADERS,
  PARTICIPANTS_LIST_PROTOCOLS,
  ROLE_STATUS,
  CONTROL_ROOM_PRESENTER_LAYOUT,
  CONTROL_ROOM_MEDIA_LAYOUT,
  CONTROL_ROOM_VOICE_ACTIVATED,
  CONTROL_ROOM_SHOW_REFRESH,
  CONTROL_ROOM_IS_LOADED,
} from "./constants/constants.js";
import { AppContext } from "././contexts/context";
import { createData } from "././utils/processJsonData";
import { fetchInitialParticipants } from "./services/fetchRequests.js";
import { sortParticipants } from "./utils/categorizeFuncs.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/pro-light-svg-icons";
import ComponentWrapper from "./components/common/ComponentWrapper.jsx";
import ViewAllLayout from "./components/layout/presenterallview/viewalllayout.jsx";
import ViewAllMediaLayout from "./components/layout/mediaallview/viewallmeidalayout.jsx";

const pexipBroadCastChannel = new BroadcastChannel("pexip");

function App() {
  const [presenterLayout, setPresenterLayout] = useState(
    CONTROL_ROOM_PRESENTER_LAYOUT
  );
  const [presenterAllLayout, setPresenterAllLayout] = useState(
    CONTROL_ROOM_PRESENTER_LAYOUT
  );
  const [mediaLayout, setMediaLayout] = useState(CONTROL_ROOM_MEDIA_LAYOUT);
  const [voiceActivated, setVoiceActivated] = useState(
    CONTROL_ROOM_VOICE_ACTIVATED
  );
  const [participantsArray, setParticipantsArray] = useState(
    createData(INITIAL_PARTICIPANT)
  );
  const [roleStatus, setRoleStatus] = useState(ROLE_STATUS);
  const [currentLayout, setCurentlayout] = useState(
    CONTROL_ROOM_PRESENTER_LAYOUT
  );
  const [isLoaded, setIsLoaded] = useState(CONTROL_ROOM_IS_LOADED);
  const [showRefresh, setShowRefresh] = useState(CONTROL_ROOM_SHOW_REFRESH);
  const Data = useRef({ token: INITIAL_TOKEN });
  const prevMediaLayout = useRef();
  const savedPinValue = useRef(-1);
  const savedOnStageItems = useRef([]);
  const savedOffScreenItems = useRef([]);

  useEffect(() => {
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
        Data.current = {
          token: msg.data.info,
        };
        console.log(`New TOKEN:`);
        console.log(msg.data);
      } else if (msg.data.event === EVENTS.participants) {
        let updatedData = createData(msg?.data?.info?.participants);
        setParticipantsArray(updatedData);
        console.log(updatedData);
      } else if (msg.data.event === EVENTS.controlRoomisLoaded) {
        setIsLoaded(true);
      } else if (msg.data.event === EVENTS.controlRoomLayoutUpdate) {
        setPresenterLayout(msg?.data?.info?.presenterLayout);
        setPresenterAllLayout(msg?.data?.info?.presenterLayout);
      }
    };

    if (isLoaded === false) {
      pexipBroadCastChannel.postMessage({
        event: EVENTS.controlRoomIsLoaded,
        info: {},
      });
    }
  }, []);

  const handlePresenterLayoutChange = (layout) => {
    setPresenterLayout(layout);
    setPresenterAllLayout(layout);
  };
  const handlePresenterAllLayoutChange = (layout) => {
    setPresenterAllLayout(layout);
    setPresenterLayout(layout);
  };

  const handleMediaLayoutChange = (layout) => {
    try {
      if (mediaLayout !== null) prevMediaLayout.current = mediaLayout;
      setMediaLayout(layout);
    } catch (e) {
      console.log("Please select valid MediaLayout");
    }
  };

  const updatedShowRefreshVar = () => {
    pexipBroadCastChannel.postMessage({
      event: EVENTS.controlRoomShowRefresh,
      info: {
        showRefresh: true,
      },
    });
  };

  return (
    <>
      <AppContext.Provider
        value={{
          presenterLayout,
          setPresenterLayout,
          mediaLayout,
          setMediaLayout,
          participantsArray,
          setParticipantsArray,
          voiceActivated,
          setVoiceActivated,
          Data,
          showRefresh,
          setShowRefresh,
          updatedShowRefreshVar,
          currentLayout,
          setCurentlayout,
          pexipBroadCastChannel,
          prevMediaLayout,
          savedPinValue,
          savedOnStageItems,
          savedOffScreenItems,
        }}
      >
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                isLoaded ? (
                  <>
                    <ComponentWrapper
                      participantsArray={sortParticipants(
                        participantsArray,
                        PARTICIPANTS_LIST_PROTOCOLS,
                        roleStatus,
                        false
                      )}
                      pLayout={handlePresenterLayoutChange}
                      mLayout={handleMediaLayoutChange}
                      setParticipantsArray={setParticipantsArray}
                      header={HEADERS.presenters}
                      roleStatus={roleStatus}
                      talkingPplArray={[]}
                      pexipBroadCastChannel={pexipBroadCastChannel}
                      currMediaLayoutIndex={mediaLayout}
                      presenterLayout={presenterLayout}
                      setPresenterAllLayout={setPresenterAllLayout}
                    />
                  </>
                ) : (
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                )
              }
            />
            <Route
              path="/view-all"
              element={
                <ViewAllLayout
                  setPresenterAllLayout={handlePresenterAllLayoutChange}
                  pexipBroadCastChannel={pexipBroadCastChannel}
                  presenterLayout={presenterLayout}
                  setPresenterLayout={setPresenterLayout}
                />
              }
            />
            <Route
              path="/media-all-view"
              element={
                <ViewAllMediaLayout
                  pexipBroadCastChannel={pexipBroadCastChannel}
                  mLayout={handleMediaLayoutChange}
                  currMediaLayoutIndex={mediaLayout}
                />
              }
            />
          </Routes>
        </Router>
      </AppContext.Provider>
    </>
  );
}

export default App;

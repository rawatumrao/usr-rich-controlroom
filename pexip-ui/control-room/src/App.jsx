import "./App.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useRef, useMemo } from "react";
import {
  EVENTS,
  INITIAL_TOKEN,
  INITIAL_PARTICIPANT,
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
import { sortParticipants } from "./utils/categorizeFuncs.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/pro-light-svg-icons";
import ComponentWrapper from "./components/common/ComponentWrapper.jsx";
import ViewAllLayout from "./components/layout/presenterallview/viewalllayout.jsx";
import ViewAllMediaLayout from "./components/layout/mediaallview/viewallmeidalayout.jsx";
import BroadCastChannel from "./components/common/BroadCastChannel.jsx";

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
  const [currentLayout, setCurentlayout] = useState(null);
  const [isLoaded, setIsLoaded] = useState(CONTROL_ROOM_IS_LOADED);
  const [showRefresh, setShowRefresh] = useState(CONTROL_ROOM_SHOW_REFRESH);
  const Data = useRef({ token: INITIAL_TOKEN });
  // const prevMediaLayout = useRef(CONTROL_ROOM_MEDIA_LAYOUT);
  const savedPinValue = useRef(-1);
  const savedOnStageItems = useRef(-1);
  const savedOffScreenItems = useRef(-1);
  const savedSelectedMediaInitIndex = useRef(CONTROL_ROOM_MEDIA_LAYOUT);
  const pexipBroadCastChannel = useMemo(
    () => new BroadcastChannel("pexip"),
    []
  );

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
          // prevMediaLayout,
          savedPinValue,
          savedOnStageItems,
          savedOffScreenItems,
          isLoaded,
          setIsLoaded,
          setPresenterAllLayout,
          handlePresenterLayoutChange,
          savedSelectedMediaInitIndex,
        }}
      >
        <Router>
          <BroadCastChannel />
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
                      // setParticipantsArray={setParticipantsArray}
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

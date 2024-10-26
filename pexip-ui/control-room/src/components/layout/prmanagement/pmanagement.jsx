import "../media/mediaStyle.css";
import "./pmanagementStyle.css";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../contexts/context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faToggleOff,
  faToggleOn,
  faAngleDown,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  EVENTS,
  ALT_TAGS,
  CONTROL_ROOM_ON_STAGE,
  CONTROL_ROOM_OFF_SCREEN,
  // CONTROL_ROOM_VOICE_ACTIVATED,
} from "../../../constants/constants.js";
import {
  layoutNameToIndex,
  indexToLayoutName,
} from "../../../constants/imageConstants.js";
import ApplyBtn from "../ApplyBtn/ApplyBtn";
import VoiceActivated from "./voice-activated/voiceActivated.jsx";

const PManagement = ({
  participantsArray,
  // setParticipantsArray,
  header,
  roleStatus,
  talkingPplArray,
  pexipBroadCastChannel,
  layoutSize,
}) => {
  const {
    setVoiceActivated,
    setShowRefresh,
    showRefresh,
    updatedShowRefreshVar,
    voiceActivated,
    savedOnStageItems,
    savedOffScreenItems,
  } = useContext(AppContext);
  const [checked, setChecked] = useState(voiceActivated);
  const [expanded, setExpanded] = useState(true);
  const [onStageItems, setOnStageItems] = useState(
    savedOnStageItems.current.length > -1
      ? savedOnStageItems.current
      : CONTROL_ROOM_ON_STAGE
  );
  const [offScreenItems, setOffScreenItems] = useState(
    savedOffScreenItems.current.length > -1
      ? savedOffScreenItems.current
      : CONTROL_ROOM_OFF_SCREEN
  );

  useEffect(() => {
    let onStageAndOffStage = [...onStageItems, ...offScreenItems];

    if (
      ///////////////////////////////////////////
      // update when someone leaves conference //
      ///////////////////////////////////////////

      participantsArray.length < onStageAndOffStage.length
    ) {
      let updatedOnStageItems = [];
      let updatedOffScreenItems = [];

      // updating onStageItems
      participantsArray.forEach((item) => {
        onStageItems.forEach((elem) => {
          if (item.uuid === elem.uuid) {
            updatedOnStageItems.push(elem);
          }
        });
      });

      // reorder by layout_group
      updatedOnStageItems.sort(
        (a, b) =>
          layoutNameToIndex(a?.layout_group) -
          layoutNameToIndex(b?.layout_group)
      );

      // updating offScreenItems
      participantsArray.forEach((item) => {
        offScreenItems.forEach((elem) => {
          if (item.uuid === elem.uuid) updatedOffScreenItems.push(item);
        });
      });

      setOnStageItems(updatedOnStageItems);
      setOffScreenItems(updatedOffScreenItems);

      savedOnStageItems.current = updatedOnStageItems;
      savedOffScreenItems.current = updatedOffScreenItems;
    } else if (participantsArray.length === onStageAndOffStage.length) {
      ////////////////////////////////////////
      //    update list with any changes    //
      ////////////////////////////////////////

      const keysToUpdate = [
        "overlayText",
        "isCameraMuted",
        "isMuted",
        // "layout_group",
      ];
      let allPpl = [...onStageItems, ...offScreenItems];

      // update everyone items with new keys
      participantsArray.forEach((item) => {
        allPpl.forEach((elem) => {
          if (item.uuid === elem.uuid) {
            keysToUpdate.forEach((key) => {
              if (item[key] !== elem[key]) {
                elem[key] = item[key];
              }
            });
          }
        });
      });

      let onStage = allPpl.filter((item) => item.layout_group !== null);
      const offScreen = allPpl.filter((item) => item.layout_group === null);

      // sort ppl by layout group
      let sortedOnStagePpl = onStage.sort(
        (a, b) =>
          layoutNameToIndex(a?.layout_group) -
          layoutNameToIndex(b?.layout_group)
      );

      onStage = sortedOnStagePpl.map((item, index) => {
        return {
          ...item,
          layout_group: indexToLayoutName(index),
        };
      });

      // console.log([...onStage, ...offScreen]);

      setOnStageItems(onStage);
      setOffScreenItems(offScreen);

      savedOnStageItems.current = onStage;
      savedOffScreenItems.current = offScreen;
    } else if (
      onStageAndOffStage.length < participantsArray.length &&
      onStageAndOffStage.length
    ) {
      ///////////////////////////////////
      //  somone new joins conference  //
      ///////////////////////////////////

      const newParticipants = participantsArray.filter(
        (participant) =>
          !onStageAndOffStage.some((p) => p.uuid === participant.uuid)
      );

      if (newParticipants.length > 0) {
        const updatedOffScreenItems = [
          ...offScreenItems,
          ...newParticipants.filter(
            (participant) =>
              !onStageItems.some((p) => p.uuid === participant.uuid)
          ),
        ];

        setOffScreenItems(updatedOffScreenItems);

        savedOffScreenItems.current = updatedOffScreenItems;
      }
    }
  }, [participantsArray]);

  const handleChange = () => {
    let checkedStatus = !checked;
    setChecked(checkedStatus);
    setVoiceActivated(checkedStatus);

    pexipBroadCastChannel.postMessage({
      event: EVENTS.controlRoomVoiceActivated,
      info: checkedStatus,
      showRefreshStatus: true,
    });

    if (showRefresh === false) {
      setShowRefresh(true);
      updatedShowRefreshVar(true);
    }
  };

  const toggleExpandCollapse = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="expand-collapse-container presenterManagment">
      <div className="header">
        <span className="expand-button" onClick={toggleExpandCollapse}>
          <FontAwesomeIcon icon={expanded ? faAngleDown : faAngleRight} />
          {` Presenter Management`}
        </span>
      </div>
      {expanded && (
        <div className="voiceActivatedContainer">
          <div className="switch-container">
            <span className="switch-label">
              <span className="voiceActivatedSpan">Voice-Activated</span>
              <div className="toggle-container">
                <span className="toggle-label">OFF</span>
                <div
                  className="switch"
                  onClick={handleChange}
                  alt={checked ? ALT_TAGS.switchOn : ALT_TAGS.switchOff}
                  title={checked ? ALT_TAGS.switchOn : ALT_TAGS.switchOff}
                >
                  <FontAwesomeIcon
                    icon={checked ? faToggleOn : faToggleOff}
                    className="fa-lg"
                    color={checked ? "Aqua" : "white"}
                  />
                </div>
                <span className="toggle-label">ON</span>
              </div>
            </span>
          </div>

          <div>
            {!checked && (
              <VoiceActivated
                participantsArray={participantsArray}
                // setParticipantsArray={setParticipantsArray}
                header={header}
                roleStatus={roleStatus}
                talkingPplArray={talkingPplArray}
                pexipBroadCastChannel={pexipBroadCastChannel}
                layoutSize={layoutSize}
                onStageItems={onStageItems}
                setOnStageItems={setOnStageItems}
                offScreenItems={offScreenItems}
                setOffScreenItems={setOffScreenItems}
              />
            )}
          </div>
        </div>
      )}
      <ApplyBtn
        onStageItems={onStageItems}
        setOnStageItems={setOnStageItems}
        offScreenItems={offScreenItems}
        setOffScreenItems={setOffScreenItems}
        pexipBroadCastChannel={pexipBroadCastChannel}
      />
    </div>
  );
};

export default PManagement;

import "./ApplyBtn.css";
import { useContext, useRef } from "react";
import { AppContext } from "../../../contexts/context";
import { NetworkError, ValidationError } from "../../../utils/customErrors";
import {
  SHOW_VB_MSG,
  LABEL_NAMES,
  LAYOUT_PANEL_VIEWER,
  EVENTS,
  CONTROL_ROOM_PINS,
  YOUR_VB_UUID,
} from "../../../constants/constants";
import {
  transformLayout,
  setParticipantToLayoutGroup,
  clearParticipantFromLayoutGroup,
  clearPinningConfig,
  setPinningConfig,
  participantSpotlightOff,
} from "../../../services/fetchRequests";
import {
  getParticipantsNumber,
  getSelectedLayoutName,
  numberToWords,
  indexToLayoutName,
  getTotalCapacity,
} from "../../../constants/imageConstants.js";
import { getLayoutName } from "../../../utils/layoutFuncs.js";
const ApplyBtn = ({
  onStageItems,
  setOnStageItems,
  offScreenItems,
  setOffScreenItems,
  pexipBroadCastChannel,
}) => {
  const {
    Data,
    voiceActivated,
    presenterLayout,
    participantsArray,
    // setParticipantsArray,
    mediaLayout,
    currentLayout,
    setCurentlayout,
    // prevMediaLayout,
    showRefresh,
    setShowRefresh,
    savedPinValue,
    savedSelectedMediaInitIndex,
    savedOnStageItems,
    savedOffScreenItems,
  } = useContext(AppContext);
  const pinValue = useRef(
    savedPinValue.current > -1 ? savedPinValue.current : CONTROL_ROOM_PINS
  );

  const turnOffSpotlights = () => {
    participantsArray.forEach(async (item) => {
      if (item.spotlightOrder) {
        await participantSpotlightOff({
          token: Data.current.token,
          uuid: item.uuid,
        });
      }
    });
  };

  const applyTransformLayout = async (selectedLayout, voiceActivated) => {
    if (
      getTotalCapacity(selectedLayout) >= onStageItems.length ||
      voiceActivated
    ) {
      if (selectedLayout !== currentLayout) {
        try {
          await transformLayout({
            token: Data.current.token,
            body: { transforms: { layout: selectedLayout } },
          });
          setCurentlayout(selectedLayout);
        } catch (error) {
          console.error(`${LABEL_NAMES.applyTransformLayoutErrMsg} ${error}`);
        }
      } else {
        console.log(LABEL_NAMES.applyTransformLayoutSameLayout);
      }
    }
  };

  // Setting up presenter and media layout by clicking on apply button
  const handleApplyClick = async () => {
    try {
      let tempOffScreenItems = [];

      if (voiceActivated) {
        // console.log(`Voice Activated ${presenterLayout}`);

        /////////////////////////
        // Voice Activated ON //
        ////////////////////////

        // change layout
        applyTransformLayout(presenterLayout, voiceActivated);

        // clear pinning config
        if (pinValue.current > -1) {
          await clearPinningConfig({
            token: Data.current.token,
          });

          pinValue.current = 0;
          savedPinValue.current = 0;
        }

        let tempPartipantsArrayWithLayoutGroup = await participantsArray.filter(
          (item) => item.layout_group !== null
        );

        // clear participants with layout gorups
        tempPartipantsArrayWithLayoutGroup.forEach(async (item) => {
          await clearParticipantFromLayoutGroup({
            uuid: item.uuid,
            token: Data.current.token,
          });
        });

        // clear out onstage layout groups and add them to offScreen
        tempOffScreenItems = [
          ...offScreenItems,
          ...onStageItems.map((person) => {
            return { ...person, layout_group: null };
          }),
        ];

        // update the participants list and onStage and offScreen states
        setOnStageItems([]);
        setOffScreenItems([...tempOffScreenItems]);
        savedOnStageItems.current = [];
        savedOffScreenItems.current = [...tempOffScreenItems];
        // setParticipantsArray([[], ...tempOffScreenItems]);
      } else {
        // console.log("Not VoiceActivated");

        //////////////////////////
        // Voice Activated OFF  //
        //////////////////////////

        // Get the updated layout group pplz for offscreen and onStage
        let onStagePplWithUpdatedLayoutGroups = [];
        let offScreenPplWithUpdatedLayoutGroups = [];

        await onStageItems.forEach(async (item, index) => {
          let indexLayoutName = indexToLayoutName(index);

          await participantsArray.forEach((elem) => {
            if (
              elem.layout_group !== indexLayoutName &&
              item.uuid === elem.uuid
            )
              onStagePplWithUpdatedLayoutGroups.push({
                ...item,
                layout_group: indexLayoutName,
              });
          });
        });

        await offScreenItems.forEach(async (item) => {
          await participantsArray.forEach((elem) => {
            if (
              item.uuid === elem.uuid &&
              item.layout_group !== elem.layout_group &&
              elem.layout_group !== null
            ) {
              offScreenPplWithUpdatedLayoutGroups.push(item);
            }
          });
        });

        // Adaptive Layout only works for voice activated
        if (presenterLayout === "5:7") {
          const errorMessage = LABEL_NAMES.adaptiveLayoutErrMsg;
          throw new ValidationError(errorMessage);
        } else {
          // change layout
          applyTransformLayout(presenterLayout, voiceActivated);
        }

        let onStageLength = onStageItems.length;

        if (onStageLength > 0) {
          let layoutCapacity = getParticipantsNumber(presenterLayout);

          // display msg if too many ppl for the layout capacity
          if (onStageLength > layoutCapacity) {
            let removeNumber = onStageLength - layoutCapacity;
            const layoutName = getSelectedLayoutName(presenterLayout);
            const errorMessage = `${LABEL_NAMES.removePplErrMsg1} ${removeNumber} ${LABEL_NAMES.removePplErrMsg2} ${layoutName} ${LABEL_NAMES.removePplErrMsg3}`;
            throw new ValidationError(errorMessage);
          }

          // set new pin config if its differnt from current pin config
          if (onStageLength !== pinValue.current) {
            await setPinningConfig({
              token: Data.current.token,
              pinning_config: numberToWords(onStageLength),
            });

            pinValue.current = onStageLength;
            savedPinValue.current = onStageLength;
          } else {
            // console.log(LABEL_NAMES.pinIsTheSameValue);
          }

          // update the onStage ppl with updated layout groups
          Promise.all(
            onStagePplWithUpdatedLayoutGroups.map(
              async (participant) =>
                await setParticipantToLayoutGroup({
                  uuid: participant.uuid,
                  token: Data.current.token,
                  layoutgroup: participant.layout_group,
                })
            )
          );

          // update the offScreen ppl with updated layout groups
          if (offScreenPplWithUpdatedLayoutGroups.length > 0) {
            for (const participant of offScreenPplWithUpdatedLayoutGroups) {
              await clearParticipantFromLayoutGroup({
                uuid: participant.uuid,
                token: Data.current.token,
              });
            }
          }
        } else {
          // console.log("Not VoiceActivated & BLANK PIN CONFIG");

          /////////////////////////////////////////////
          // Voice Activated OFF & BLANK PIN CONFIG  //
          /////////////////////////////////////////////

          // set pin config to blank if noone is on stage
          if (onStageLength === 0) {
            await setPinningConfig({
              token: Data.current.token,
              pinning_config: LABEL_NAMES.blank,
            });

            pinValue.current = 0;
            savedPinValue.current = 0;
          }

          // change layout
          applyTransformLayout(presenterLayout, voiceActivated);

          // update the offScreen ppl with updated layout groups
          if (offScreenPplWithUpdatedLayoutGroups.length > 0) {
            for (const participant of offScreenPplWithUpdatedLayoutGroups) {
              await clearParticipantFromLayoutGroup({
                uuid: participant.uuid,
                token: Data.current.token,
              });
            }
          }
        }

        ////////////////////////////////
        //  Updated Particpants Array //
        ////////////////////////////////
        // setParticipantsArray([...onStageItems, ...offScreenItems]);
        // savedOnStageItems.current = [...onStageItems];
        // savedOffScreenItems.current = [...offScreenItems];

        /////////////////////////////
        // Turn off all Spotlights //
        /////////////////////////////
        turnOffSpotlights();
      }

      ////////////////////////////
      // changing Viewer Layout //
      ////////////////////////////
      if (
        mediaLayout !== null
        //&&
        // getLayoutName(savedSelectedMediaInitIndex.current) !==
        //   getLayoutName(prevMediaLayout.current)
      ) {
        try {
          LAYOUT_PANEL_VIEWER(
            getLayoutName(savedSelectedMediaInitIndex.current)
          );

          // savedSelectedMediaInitIndex.current = mediaLayout;
          // prevMediaLayout.current = mediaLayout;
        } catch (err) {
          console.log(`Error while setting up LAYOUT_PANEL_VIEWER: ${err}`);
        }
      }

      ///////////////////////////////////////////////
      // updated default variables videobridge.jsp //
      ///////////////////////////////////////////////
      await pexipBroadCastChannel.postMessage({
        event: EVENTS.controlRoomApply,
        info: {
          onStage: voiceActivated ? [] : onStageItems,
          offScreen: voiceActivated ? [...tempOffScreenItems] : offScreenItems,
          voiceActivated: voiceActivated,
          mediaLayout: getLayoutName(savedSelectedMediaInitIndex.current),
          presenterLayout: presenterLayout,
          showRefresh: false,
          pinning_config: pinValue.current,
        },
      });

      if (showRefresh) setShowRefresh(false);
      SHOW_VB_MSG(LABEL_NAMES.applyBtnSuccess);

      await pexipBroadCastChannel.postMessage({
        event: EVENTS.controlRoomUpdatedDefaults,
        info: {
          uuid: YOUR_VB_UUID,
          onStage: voiceActivated ? [] : onStageItems,
          offScreen: voiceActivated ? [...tempOffScreenItems] : offScreenItems,
          voiceActivated: voiceActivated,
          mediaLayout: getLayoutName(savedSelectedMediaInitIndex.current),
          presenterLayout: presenterLayout,
          showRefresh: false,
          pinning_config: pinValue.current,
          controlRoomUpdatedDefaults: true,
        },
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        SHOW_VB_MSG(error.message);
      } else if (error instanceof NetworkError) {
        SHOW_VB_MSG(error.message);
      } else {
        const errorMessage = `${LABEL_NAMES.applyChangesFailed}`;
        SHOW_VB_MSG(errorMessage);
      }
    }
  };

  const disabledApplyBtnPress = () => {
    SHOW_VB_MSG(LABEL_NAMES.controlRoomApplyDisabled);
  };

  return (
    <div id="applyBtnDiv" className="applyBtnDiv">
      {showRefresh ? (
        <button className="btn" onClick={handleApplyClick} alt="Apply button">
          Apply
        </button>
      ) : (
        <button
          className="btn"
          onClick={disabledApplyBtnPress}
          alt="Apply button disabled"
        >
          Apply
        </button>
      )}
    </div>
  );
};

export default ApplyBtn;

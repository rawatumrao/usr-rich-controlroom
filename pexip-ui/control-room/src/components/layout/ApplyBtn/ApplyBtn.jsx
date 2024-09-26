import "./ApplyBtn.css";
import { useContext, useCallback, useRef } from "react";
import { AppContext } from "../../../contexts/context";
import { NetworkError, ValidationError } from "../../../utils/customErrors";
import {
  SHOW_VB_MSG,
  LABEL_NAMES,
  LAYOUT_PANEL_VIEWER,
  EVENTS,
  CONTROL_ROOM_PINS,
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
}) => {
  const {
    Data,
    voiceActivated,
    presenterLayout,
    participantsArray,
    setParticipantsArray,
    mediaLayout,
    currentLayout,
    setCurentlayout,
    pexipBroadCastChannel,
    prevMediaLayout,
    showRefresh,
    setShowRefresh,
    savedPinValue,
  } = useContext(AppContext);
  const pinValue = useRef(
    CONTROL_ROOM_PINS ? CONTROL_ROOM_PINS : savedPinValue.current
  );

  // Setting up presenter and media layout by clicking on apply button
  const handleApplyClick = useCallback(async () => {
    try {
      const turnOffSpotlights = () => {
        participantsArray.forEach((item) => {
          if (item.spotlightOrder) {
            participantSpotlightOff({
              token: Data.current.token,
              uuid: item.uuid,
            });
          }
        });
      };

      const applyTransformLayout = async (selectedLayout) => {
        if (getTotalCapacity(selectedLayout) >= onStageItems.length) {
          if (selectedLayout !== currentLayout) {
            try {
              await transformLayout({
                token: Data.current.token,
                body: { transforms: { layout: selectedLayout } },
              });
              setCurentlayout(selectedLayout);
            } catch (error) {
              console.error(
                `${LABEL_NAMES.applyTransformLayoutErrMsg} ${error}`
              );
            }
          } else {
            console.log(LABEL_NAMES.applyTransformLayoutSameLayout);
          }
        }
      };

      // TODO: figure out what do with this
      let response = { ok: false };

      if (voiceActivated) {
        console.log(`Voice Activated ${presenterLayout}`);

        /////////////////////////
        // Voice Activated ON //
        ////////////////////////

        // clear pinning config
        if (pinValue.current > 0) {
          response = await clearPinningConfig({
            token: Data.current.token,
          });

          if (response.ok) {
            pinValue.current = 0;
            savedPinValue.current = 0;
          }
        }

        // change layout
        await applyTransformLayout(presenterLayout);

        // clear participants with layout gorups
        onStageItems.forEach(async (item) => {
          await clearParticipantFromLayoutGroup({
            uuid: item.uuid,
            token: Data.current.token,
          });
        });

        // clear out onstage layout groups and add them to offScreen
        const tempOffScreenItems = [
          ...offScreenItems,
          ...onStageItems.map((person) => {
            return { ...person, layout_group: null };
          }),
        ];

        // update the participants list and onStage and offScreen states
        setOnStageItems([]);
        setOffScreenItems([...tempOffScreenItems]);
      } else {
        console.log("Not VoiceActivated");

        //////////////////////////
        // Voice Activated OFF  //
        //////////////////////////

        // Get the updated layout group pplz for offscreen and onStage
        let onStagePplWithUpdatedLayoutGroups = [];
        let offScreenPplWithUpdatedLayoutGroups = [];

        onStageItems.forEach((item, index) => {
          let indexLayoutName = indexToLayoutName(index);

          participantsArray.forEach((elem) => {
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

        offScreenPplWithUpdatedLayoutGroups = offScreenItems.filter(
          (person) => {
            const participantWithOldDetails = participantsArray.find(
              (p) => p.uuid === person.uuid
            );
            return (
              person.layout_group !== participantWithOldDetails?.layout_group
            );
          }
        );

        // Adaptive Layout only works for voice activated
        if (presenterLayout === "5:7") {
          const errorMessage = LABEL_NAMES.adaptiveLayoutErrMsg;
          throw new ValidationError(errorMessage);
        } else {
          // change layout
          await applyTransformLayout(presenterLayout);
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
            console.log(LABEL_NAMES.pinIsTheSameValue);
          }

          // update the onStage ppl with updated layout groups
          await Promise.all(
            onStagePplWithUpdatedLayoutGroups.map((participant) =>
              setParticipantToLayoutGroup({
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
          console.log("Not VoiceActivated & BLANK PIN CONFIG");

          /////////////////////////////////////////////
          // Voice Activated OFF & BLANK PIN CONFIG  //
          /////////////////////////////////////////////

          // set pin config to blank if noone is on stage
          if (onStageLength === 0) {
            await setPinningConfig({
              token: Data.current.token,
              pinning_config: LABEL_NAMES.blank,
            });

            pinValue.current = LABEL_NAMES.blank;
            savedPinValue.current = LABEL_NAMES.blank;
          }

          // change layout
          await applyTransformLayout(presenterLayout);

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
        setParticipantsArray([...onStageItems, ...offScreenItems]);

        /////////////////////////////
        // Turn off all Spotlights //
        /////////////////////////////
        turnOffSpotlights();
      }

      ////////////////////////////
      // changing Viewer Layout //
      ////////////////////////////
      if (mediaLayout !== null && prevMediaLayout.current !== mediaLayout) {
        try {
          LAYOUT_PANEL_VIEWER(getLayoutName(mediaLayout));
        } catch (err) {
          console.log(`Error while setting up LAYOUT_PANEL_VIEWER: ${err}`);
        }
      }

      ///////////////////////////////////////////////
      // updated default variables videobridge.jsp //
      ///////////////////////////////////////////////
      pexipBroadCastChannel.postMessage({
        event: EVENTS.controlRoomApply,
        info: {
          onStage: onStageItems,
          offScreen: offScreenItems,
          voiceActivated: voiceActivated,
          presenterLayout: presenterLayout,
          showRefresh: false,
          pinning_config: pinValue.current,
        },
      });

      if (showRefresh) setShowRefresh(false);
      SHOW_VB_MSG(LABEL_NAMES.applyBtnSuccess);
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
  }, [
    Data,
    voiceActivated,
    presenterLayout,
    participantsArray,
    setParticipantsArray,
    mediaLayout,
    currentLayout,
    setCurentlayout,
    pexipBroadCastChannel,
    prevMediaLayout,
    pinValue,
    showRefresh,
    setShowRefresh,
    onStageItems,
    setOnStageItems,
    offScreenItems,
    setOffScreenItems,
    savedPinValue,
  ]);

  return (
    <div id="applyBtnDiv" className="applyBtnDiv">
      <button className="btn" onClick={handleApplyClick}>
        Apply
      </button>
    </div>
  );
};

export default ApplyBtn;

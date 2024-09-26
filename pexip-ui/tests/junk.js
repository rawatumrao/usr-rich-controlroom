import "./ApplyBtn.css";
import { useState, useContext, useCallback } from "react";
import { AppContext } from "../../../contexts/context";
import { NetworkError, ValidationError } from "../../../utils/customErrors";
import {
  SHOW_VB_MSG,
  LABEL_NAMES,
  LAYOUT_PANEL_VIEWER,
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
  layoutNameToIndex,
  indexToLayoutName,
} from "../../../constants/imageConstants.js";
import { getLayoutName } from "../../../utils/layoutFuncs.js";
const ApplyBtn = () => {
  const {
    voiceActivated,
    presenterLayout,
    presenterAllLayout,
    participantsArray,
    initialParticipantsArray,
    mediaLayout,
    setCurentlayout,
  } = useContext(AppContext);

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
    if (selectedLayout !== currentLayout) {
      try {
        await transformLayout({
          token: Data.current.token,
          body: { transforms: { layout: selectedLayout } },
        });
        setCurentlayout(selectedLayout);
      } catch (error) {
        console.error("Error applying new layout: ", error);
      }
    } else {
      console.log("New layout is the same as the current layout.");
    }
  };

  // Setting up presenter and media layout by clicking on apply button
  const handleApplyClick = useCallback(async () => {
    try {
      let selectedLayout =
        presenterAllLayout !== null ? presenterAllLayout : presenterLayout;

      if (!selectedLayout) {
        const errorMessage = "Please select valid Layout to Apply your changes";
        throw new ValidationError(errorMessage);
      }

      let onStageParticipantsWithLGupdated = [];
      let offScreenParticipantsWithLGupdated = [];

      // sort onStage pplz
      let sortedPpl = participantsArray.sort(
        (a, b) =>
          layoutNameToIndex(a?.layout_group) -
          layoutNameToIndex(b?.layout_group)
      );

      let count = 0;
      sortedPpl.forEach((item) => {
        if (item?.layout_group) {
          item.layout_group = indexToLayoutName(count);
          count++;
          onStageParticipantsWithLGupdated.push(item);
        } else {
          offScreenParticipantsWithLGupdated.push(item);
        }
      });

      if (initialParticipantsArray && initialParticipantsArray.length > 0) {
        onStageParticipantsWithLGupdated =
          onStageParticipantsWithLGupdated.filter((participant) => {
            const participantWithOldDetails = initialParticipantsArray.find(
              (p) => p.uuid === participant.uuid
            );
            return (
              participant &&
              participant.layout_group !== null &&
              participant.layout_group !==
                participantWithOldDetails?.layout_group
            );
          });

        offScreenParticipantsWithLGupdated =
          offScreenParticipantsWithLGupdated.filter((participant) => {
            const participantWithOldDetails = initialParticipantsArray.find(
              (p) => p.uuid === participant.uuid
            );
            return (
              participant &&
              participant.layout_group === null &&
              participant.layout_group !==
                participantWithOldDetails?.layout_group
            );
          });
      } else {
        // onStageParticipantsWithLGupdated = participantsArray.filter(
        //   (participant) => participant?.layout_group
        // );

        // sort onStage pplz
        let sortedPpl = participantsArray.sort(
          (a, b) =>
            layoutNameToIndex(a?.layout_group) -
            layoutNameToIndex(b?.layout_group)
        );

        let count = 0;
        sortedPpl.forEach((item) => {
          if (item?.layout_group) {
            item.layout_group = indexToLayoutName(count);
            count++;
            onStageParticipantsWithLGupdated.push(item);
          } else {
            offScreenParticipantsWithLGupdated.push(item);
          }
        });
      }

      if (voiceActivated) {
        //Total available participants on onStage for clear thier layout group
        const totalParticipants_onStage = participantsArray.filter(
          (participant) => participant?.layout_group
        );

        // Clear participant layout groups
        if (totalParticipants_onStage.length > 0) {
          for (const participant of totalParticipants_onStage) {
            await clearParticipantFromLayoutGroup({
              uuid: participant.uuid,
              token: Data.current.token,
            });
          }
        }

        // Apply presenter layout
        await applyTransformLayout(selectedLayout);

        // Make Pinning Config Voice Activated Always
        // if (currentPinValue) {
        await clearPinningConfig({
          token: Data.current.token,
        });
        setCurrentPinValue(0);
        // }

        const updatedParticipantsArray = participantsArray.map((participant) =>
          totalParticipants_onStage.includes(participant)
            ? { ...participant, layout_group: null }
            : participant
        );

        setParticipantsArray(updatedParticipantsArray);
        setInitialParticipantsArray(updatedParticipantsArray);

        // filter offScreen participants where layout_group is null
        // const offScreenParticipants = updatedParticipantsArray.filter(
        //   (participant) => participant.layout_group === null
        // );
      } else {
        if (selectedLayout === "5:7") {
          const errorMessage =
            "The Adaptive Layout is only applicable for Voice-Activated ON";
          throw new ValidationError(errorMessage);
        }

        let onStageParticipantsForCount = participantsArray.filter(
          (participant) => participant?.layout_group
        );

        let parNumber = onStageParticipantsForCount.length;

        if (parNumber > 0) {
          let count = getParticipantsNumber(selectedLayout);
          if (parNumber > count) {
            let removeNumber = parNumber - count;
            const layoutName = getSelectedLayoutName(selectedLayout);
            const errorMessage = `Please remove ${removeNumber} Presenters from the Stage to apply the ${layoutName} Layout`;
            throw new ValidationError(errorMessage);
          }

          if (parNumber !== currentPinValue) {
            await setPinningConfig({
              token: Data.current.token,
              pinning_config: numberToWords(parNumber),
            });
            setCurrentPinValue(parNumber);
          } else {
            console.log("New Pin value is the same as the current Pin Value.");
          }

          await applyTransformLayout(selectedLayout);

          await Promise.all(
            onStageParticipantsWithLGupdated.map((participant) =>
              setParticipantToLayoutGroup({
                uuid: participant.uuid,
                token: Data.current.token,
                layoutgroup: participant.layout_group,
              })
            )
          );

          if (offScreenParticipantsWithLGupdated.length > 0) {
            for (const participant of offScreenParticipantsWithLGupdated) {
              await clearParticipantFromLayoutGroup({
                uuid: participant.uuid,
                token: Data.current.token,
              });
            }
          }
        } else {
          await applyTransformLayout(selectedLayout);

          if (parNumber == 0) {
            await setPinningConfig({
              token: Data.current.token,
              pinning_config: "blank",
            });
            setCurrentPinValue("blank");
          }

          if (offScreenParticipantsWithLGupdated.length > 0) {
            for (const participant of offScreenParticipantsWithLGupdated) {
              await clearParticipantFromLayoutGroup({
                uuid: participant.uuid,
                token: Data.current.token,
              });
            }
          }
        }
        setInitialParticipantsArray([...participantsArray]);
        turnOffSpotlights();
      }

      // changing Viewer Layout
      if (mediaLayout !== null && prevMediaLayout.current !== mediaLayout) {
        try {
          LAYOUT_PANEL_VIEWER(getLayoutName(mediaLayout));
        } catch (err) {
          console.log(`Error while setting up LAYOUT_PANEL_VIEWER: ${err}`);
        }
      }

      // ordering onStage and offScreen
      let onStage = [];
      let offScreen = [];

      if (voiceActivated === false) {
        onStage = participantsArray.filter(
          (item) =>
            item.layout_group !== null &&
            item.protocol !== "api" &&
            item.protocol !== "rtmp"
        );

        offScreen = participantsArray.filter(
          (item) =>
            item.layout_group === null &&
            item.protocol !== "api" &&
            item.protocol !== "rtmp"
        );
      }

      // updated default variables videobridge.jsp
      bc.postMessage({
        event: EVENTS.controlRoomApply,
        info: {
          onStage: onStage,
          offScreen: offScreen,
          voiceActivated: voiceActivated,
          presenterLayout: presenterLayout,
          showRefresh: false,
        },
      });

      if (showRefresh) setShowRefresh(false);
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
    voiceActivated,
    presenterLayout,
    presenterAllLayout,
    participantsArray,
    initialParticipantsArray,
    mediaLayout,
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

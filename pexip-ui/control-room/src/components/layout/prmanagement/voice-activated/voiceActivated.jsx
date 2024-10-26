import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../../contexts/context";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faAngleDown,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import "./voiceActivatedStyle.css";
import {
  EVENTS,
  BUTTON_NAMES,
  LABEL_NAMES,
  SHOW_VB_MSG,
} from "../../../../constants/constants";
import {
  layoutGroupValue,
  layoutNameToIndex,
} from "../../../../constants/imageConstants";
import { PresenterImages } from "../../../common/presenterImages";
import ParticipantsListBtn from "../../../utility/ParticipantsListBtn/ParticipantsListBtn";
import ParticipantsListDisplayName from "../../../utility/ParticipantsListDisplayName/ParticipantsListDisplayName";

const numberToWords = (num) => {
  return layoutGroupValue[num - 1] || "unknown";
};

const VoiceActivated = ({
  participantsArray,
  header,
  roleStatus,
  talkingPplArray,
  pexipBroadCastChannel,
  onStageItems,
  setOnStageItems,
  offScreenItems,
  setOffScreenItems,
}) => {
  const [data, setData] = useState(participantsArray);
  const [onStageOpen, setOnStageOpen] = useState(true);
  const [offScreenOpen, setOffScreenOpen] = useState(true);
  const [settingSaved, setsettingSaved] = useState(
    onStageItems.length || offScreenItems.length ? true : false
  );
  const {
    showRefresh,
    setShowRefresh,
    updatedShowRefreshVar,
    presenterLayout,
    savedOnStageItems,
    savedOffScreenItems,
  } = useContext(AppContext);

  useEffect(() => {
    if (settingSaved) {
      loadItems(onStageItems, offScreenItems);
    }
  }, []);

  useEffect(() => {
    if (settingSaved === false) {
      // sort by layout order
      let sortedOnStagePpl = data
        .filter(
          (item) =>
            item.layout_group !== null &&
            item.protocol !== "api" &&
            item.protocol !== "rtmp"
        )
        .sort(
          (a, b) =>
            layoutNameToIndex(a?.layout_group) -
            layoutNameToIndex(b?.layout_group)
        );

      let offStagePpl = data.filter(
        (item) =>
          item.layout_group === null &&
          item.protocol !== "api" &&
          item.protocol !== "rtmp"
      );

      loadItems(sortedOnStagePpl, offStagePpl);
    } else if (settingSaved) setsettingSaved(false);
  }, [data]);

  const loadItems = (onStage, offScreen) => {
    try {
      setOnStageItems(onStage);
      setOffScreenItems(offScreen);

      savedOnStageItems.current = onStage;
      savedOffScreenItems.current = offScreen;

      pexipBroadCastChannel.postMessage({
        event: EVENTS.controlRoomStageOrders,
        info: {
          onStage: onStage,
          offScreen: offScreen,
        },
      });
    } catch (error) {
      console.error("Error processing data: ", error.message);
    }
  };

  const updateLayoutGroups = (destList) =>
    destList.map((item, index) => {
      const newLayout_group = numberToWords(index + 1);

      if (item.layout_group !== newLayout_group) {
        return { ...item, layout_group: newLayout_group };
      }
      return item;
    });

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    let updatedOnStageItems = [...onStageItems];
    let updatedOffScreenItems = [...offScreenItems];

    const sourceList =
      source.droppableId === "onStage"
        ? updatedOnStageItems
        : updatedOffScreenItems;
    const destList =
      destination.droppableId === "onStage"
        ? updatedOnStageItems
        : updatedOffScreenItems;

    const [movedItem] = sourceList.splice(source.index, 1);

    destList.splice(destination.index, 0, movedItem);

    // Prevent adding more items to onStage if the limit is reache
    let sizeOfLayout = PresenterImages.find(
      (item) => presenterLayout === item.layout
    ).total;

    if (
      destination.droppableId === "onStage" &&
      destList.length > sizeOfLayout
    ) {
      // console.log("Cannot add more participants to onStage. Limit reached.");
      const errorMessage = `${LABEL_NAMES.blockParticipantOverMaxCount1} ${sizeOfLayout} ${LABEL_NAMES.blockParticipantOverMaxCount2}`;
      SHOW_VB_MSG(errorMessage);
      return;
    }

    if (destination.droppableId === "onStage") {
      updatedOnStageItems = updateLayoutGroups(destList);
      setOnStageItems(updatedOnStageItems);

      savedOnStageItems.current = updatedOnStageItems;
    }
    //else {
    updatedOffScreenItems = updatedOffScreenItems.map((item) => ({
      ...item,
      layout_group: null,
    }));

    setOffScreenItems(updatedOffScreenItems);

    savedOffScreenItems.current = updatedOffScreenItems;
    //}

    const undatedOnStageAfterRemoval = updateLayoutGroups(updatedOnStageItems);

    setOnStageItems(undatedOnStageAfterRemoval);

    savedOnStageItems.current = undatedOnStageAfterRemoval;

    const updatedData = [
      ...undatedOnStageAfterRemoval,
      ...updatedOffScreenItems,
    ];

    setData(updatedData);

    if (showRefresh === false) {
      setShowRefresh(true);
      updatedShowRefreshVar(true);
    }
  };

  const moveToOnStage = (item) => {
    const updatedOnStageItems = [
      ...onStageItems,
      { ...item, layout_group: numberToWords(onStageItems.length + 1) },
    ];
    let sizeOfLayout = PresenterImages.find(
      (item) => presenterLayout === item.layout
    ).total;

    if (updatedOnStageItems.length > sizeOfLayout) {
      // console.log("Cannot add more participants to onStage. Limit reached.");
      const errorMessage = `${LABEL_NAMES.blockParticipantOverMaxCount1} ${sizeOfLayout} ${LABEL_NAMES.blockParticipantOverMaxCount2}`;
      SHOW_VB_MSG(errorMessage);
      return;
    }
    const recalculatedOnStageItems = updateLayoutGroups(updatedOnStageItems);
    const updatedOffScreenItems = offScreenItems.filter(
      (i) => i.uuid !== item.uuid
    );

    setOnStageItems(recalculatedOnStageItems);
    setOffScreenItems(updatedOffScreenItems);

    savedOnStageItems.current = recalculatedOnStageItems;
    savedOffScreenItems.current = updatedOffScreenItems;

    const updatedData = [...recalculatedOnStageItems, ...updatedOffScreenItems];

    setData(updatedData);

    if (showRefresh === false) {
      setShowRefresh(true);
      updatedShowRefreshVar(true);
    }
  };

  const movedToOffScreen = (item) => {
    const updatedOnStageItems = onStageItems.filter((i) => i.uuid != item.uuid);
    const recalculatedOnStageItems = updateLayoutGroups(updatedOnStageItems);
    const updatedOffScreenItems = [
      ...offScreenItems,
      {
        ...item,
        layout_group: null,
      },
    ];
    setOnStageItems(recalculatedOnStageItems);
    setOffScreenItems(updatedOffScreenItems);

    savedOnStageItems.current = recalculatedOnStageItems;
    savedOffScreenItems.current = updatedOffScreenItems;

    const updatedData = [...recalculatedOnStageItems, ...updatedOffScreenItems];

    setData(updatedData);

    if (showRefresh === false) {
      setShowRefresh(true);
      updatedShowRefreshVar(true);
    }
  };

  const draggingStyles = (
    isDragging,
    draggableStyle,
    talkingPerson,
    listType
  ) => ({
    userSelect: "none",
    background:
      listType === "onStage"
        ? isDragging
          ? "#484A64"
          : "#5e609c"
        : isDragging
        ? "#484A64"
        : "#24253c",
    display: "flex",
    padding: "9px",
    border:
      talkingPerson && isDragging === false
        ? "2px solid aqua"
        : "2px solid transparent",
    borderRadius: "2px",
    boxShadow: isDragging ? "1px 1px 1px #ffdc81" : "",
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const renderParticipant = (item, index, listType) => (
    <Draggable key={item.uuid} draggableId={item.uuid} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="item"
          style={draggingStyles(
            snapshot.isDragging,
            provided.draggableProps.style,
            talkingPplArray.find(
              (person) => person?.vad && person?.userId === item.uuid
            ),
            listType
          )}
        >
          <span className="item-content">
            <span className="icon-container">
              {listType === "offScreen" ? (
                <FontAwesomeIcon
                  icon={faPlus}
                  onClick={() => moveToOnStage(item)}
                  className="icon-plus"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faTimes}
                  onClick={() => movedToOffScreen(item)}
                  className="icon-cancel"
                />
              )}
            </span>
            <ParticipantsListDisplayName {...item} header={header} />
          </span>
          <div>
            {item.isMuted && (
              <ParticipantsListBtn
                attr={BUTTON_NAMES.audio}
                {...item}
                roleStatus={roleStatus}
                pexipBroadCastChannel={pexipBroadCastChannel}
              />
            )}
          </div>
          <div>
            {!item.is_audio_only_call && item.isCameraMuted && (
              <>
                <ParticipantsListBtn
                  attr={BUTTON_NAMES.video}
                  {...item}
                  roleStatus={roleStatus}
                  pexipBroadCastChannel={pexipBroadCastChannel}
                />
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="container">
          <div className="list-container">
            <h4 onClick={() => setOnStageOpen(!onStageOpen)}>
              <FontAwesomeIcon
                icon={onStageOpen ? faAngleDown : faAngleRight}
              />
              {` On Stage`} ({onStageItems.length}/
              {
                PresenterImages.find((item) => presenterLayout === item.layout)
                  .total
              }
              {`)`}
            </h4>
            {onStageOpen && (
              <Droppable droppableId="onStage">
                {(provided) => (
                  <div
                    className="list"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {onStageItems.map((item, index) =>
                      renderParticipant(item, index, "onStage")
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
          <div className="list-container">
            <h4 onClick={() => setOffScreenOpen(!offScreenOpen)}>
              <FontAwesomeIcon
                icon={offScreenOpen ? faAngleDown : faAngleRight}
              />
              {` Off Screen`}
            </h4>
            {offScreenOpen && (
              <Droppable droppableId="offScreen">
                {(provided) => (
                  <div
                    className="list"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {offScreenItems.map((item, index) =>
                      renderParticipant(item, index, "offScreen")
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </div>
      </DragDropContext>
    </>
  );
};

export default VoiceActivated;

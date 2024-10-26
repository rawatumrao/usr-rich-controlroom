import "./ParticipantList.css";
import { useRef, useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ParticipantsListBtn from "../ParticipantsListBtn/ParticipantsListBtn";
import ParticipantsListDisplayName from "../ParticipantsListDisplayName/ParticipantsListDisplayName";
import ActionBtn from "../ActionBtn/ActionBtn";
import {
  BUTTON_NAMES,
  MAX_PARTICIPANTS,
  HEADERS,
  ALT_TAGS,
  TALKING_PERSON_UUID,
  EVENTS,
  WAIT_TO_JOIN_ORDER,
  PRESENTER_ORDER,
  STREAMS_ORDER,
  ENVIRONMENT,
  ENV,
  SHOW_VB_MSG,
  LABEL_NAMES,
} from "../../contexts/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHand,
  faDesktop,
  faAngleDown,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";

const setInitialOrder = (header, participantsArray) => {
  if (ENV === ENVIRONMENT.prod) {
    let orderedlist = [];
    if (header === HEADERS.waitingToJoin) orderedlist = WAIT_TO_JOIN_ORDER;
    if (header === HEADERS.presenters) orderedlist = PRESENTER_ORDER;
    if (header === HEADERS.streams) orderedlist = STREAMS_ORDER;

    return orderedlist?.length ? orderedlist : participantsArray;
  } else {
    return participantsArray;
  }
};

const ParticipantList = ({
  participantsArray,
  header,
  roleStatus,
  talkingPplArray,
  pexipBroadCastChannel,
}) => {
  const arrowDownBtnRef = useRef(null);
  const arrowRightBtnRef = useRef(null);
  const participantList = useRef(null);
  const [listOrderArray, setListOrderArray] = useState(
    setInitialOrder(header, participantsArray)
  );

  useEffect(() => {
    if (TALKING_PERSON_UUID)
      talkingPplArray.push({
        userId: TALKING_PERSON_UUID,
        vad: 100,
      });
  }, []);

  useEffect(() => {
    let filteredList = [];
    let copyOfparticipantsArray = [...participantsArray];

    // keep order of list
    listOrderArray.forEach((item) => {
      if (participantsArray.find((elem) => elem.uuid === item.uuid)) {
        copyOfparticipantsArray = copyOfparticipantsArray.filter((person) => {
          if (person.uuid === item.uuid) filteredList.push(person);
          return person.uuid !== item.uuid;
        });
      }
    });

    // add new ppl to the ordered list at the bottom
    copyOfparticipantsArray.forEach((item) => {
      filteredList.push(item);
    });

    setListOrderArray(filteredList);

    // if you add more than the max participants give this message
    if (
      participantsArray.length !== listOrderArray.length &&
      participantsArray.length > MAX_PARTICIPANTS &&
      header === HEADERS.presenters
    )
      SHOW_VB_MSG(LABEL_NAMES.tooManyPresenters);
  }, [participantsArray]);

  function handleOnDragEnd(result) {
    if (!result.destination) return;
    const items = Array.from(listOrderArray);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setListOrderArray(items);

    // send ordered list to parent page to be saved
    let listName = "";
    if (header === HEADERS.waitingToJoin) listName = HEADERS.waitingToJoin;
    if (header === HEADERS.presenters) listName = HEADERS.presenters;
    if (header === HEADERS.streams) listName = HEADERS.streams;

    pexipBroadCastChannel.postMessage({
      event: EVENTS.orderedList,
      info: JSON.parse(JSON.stringify(items)),
      orderedListName: listName,
    });
  }

  const draggingStyles = (isDragging, draggableStyle, talkingPerson) => ({
    userSelect: "none",
    background: isDragging ? "#484A64" : "#24253c",
    display: "flex",
    padding: "9px",
    border:
      talkingPerson && isDragging === false
        ? "2px solid aqua"
        : "2px solid transparent",
    borderRadius: "5px",
    boxShadow: isDragging ? "1px 1px 1px #ffdc81" : "",
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const closeList = () => {
    const refArray = [arrowDownBtnRef, arrowRightBtnRef, participantList];
    refArray?.forEach((item) => {
      if (item.current.classList.contains("hide"))
        item.current.classList.remove("hide");
      else item.current.classList.add("hide");
    });
  };

  const participantsList = listOrderArray?.map((participant, index) => (
    <Draggable
      key={`user_${participant.uuid.split("-")[0]}`}
      draggableId={`user_${participant.uuid.split("-")[0]}`}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          id={`user_${participant.uuid.split("-")[0]}`}
          key={index}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={draggingStyles(
            snapshot.isDragging,
            provided.draggableProps.style,
            talkingPplArray.find(
              (person) => person?.vad && person?.userId === participant.uuid
            )
          )}
        >
          <ParticipantsListDisplayName {...participant} header={header} />
          {header === HEADERS.presenters && (
            <>
              {participant.isPresenting && (
                <FontAwesomeIcon
                  icon={faDesktop}
                  alt={ALT_TAGS.screenShare}
                  title={ALT_TAGS.screenShare}
                />
              )}
              {participant.raisedHand && (
                <FontAwesomeIcon
                  icon={faHand}
                  alt={ALT_TAGS.raiseHand}
                  title={ALT_TAGS.raiseHand}
                />
              )}
              <ParticipantsListBtn
                attr={BUTTON_NAMES.audio}
                {...participant}
                roleStatus={roleStatus}
                pexipBroadCastChannel={pexipBroadCastChannel}
              />
              {participant.is_audio_only_call ? null : (
                <>
                  <ParticipantsListBtn
                    attr={BUTTON_NAMES.video}
                    {...participant}
                    roleStatus={roleStatus}
                    pexipBroadCastChannel={pexipBroadCastChannel}
                  />
                  <ParticipantsListBtn
                    attr={BUTTON_NAMES.spotlight}
                    {...participant}
                    roleStatus={roleStatus}
                    pexipBroadCastChannel={pexipBroadCastChannel}
                  />
                </>
              )}

              {roleStatus && <ActionBtn {...participant} rtmpStream={false} />}
            </>
          )}

          {header === HEADERS.waitingToJoin && (
            <>
              <ParticipantsListBtn
                attr={BUTTON_NAMES.admit}
                {...participant}
                roleStatus={roleStatus}
              />
              <ParticipantsListBtn
                attr={BUTTON_NAMES.deny}
                {...participant}
                roleStatus={roleStatus}
              />
            </>
          )}

          {header === HEADERS.streams && roleStatus && (
            <ActionBtn {...participant} rtmpStream={true} />
          )}
        </div>
      )}
    </Draggable>
  ));

  // console.log("LIST RENDERING");

  if (participantsArray.length === 0) return null;

  return (
    <div id="participantListContainer" className="participantListContainer">
      <h3 className="listHeader" onClick={closeList}>
        <FontAwesomeIcon icon={faAngleDown} ref={arrowDownBtnRef} />
        <FontAwesomeIcon
          icon={faAngleRight}
          ref={arrowRightBtnRef}
          className="hide"
        />
        {`  ${header} `}
        {header === HEADERS.presenters &&
          `(${participantsArray.length}/${MAX_PARTICIPANTS})`}
      </h3>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="dropableParticipantsList">
          {(provided) => (
            <section id="participantList" ref={participantList}>
              <div
                className="participantList"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {participantsList}
                {provided.placeholder}
              </div>
            </section>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ParticipantList;

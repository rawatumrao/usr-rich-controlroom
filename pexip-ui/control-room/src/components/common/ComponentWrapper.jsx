import { useEffect, useState } from "react";
import { getTotalCapacity } from "../../constants/imageConstants.js";
import { MAX_PARTICIPANTS } from "../../constants/constants.js";
import Presenter from "../layout/presenter/presenter.jsx";
import PManagement from "../layout/prmanagement/pmanagement.jsx";
import Media from "../layout/media/media.jsx";
import RefreshBtn from "../utility/RefreshBtn/RefreshBtn.jsx";

const ComponentWrapper = ({
  participantsArray,
  pLayout,
  mLayout,
  setParticipantsArray,
  setVoiceActivated,
  header,
  roleStatus,
  talkingPplArray,
  pexipBroadCastChannel,
  currMediaLayoutIndex,
  presenterLayout,
}) => {
  const [layoutSize, setLayoutSize] = useState(MAX_PARTICIPANTS);
  const [selectedLayout, setSelectedLayout] = useState(presenterLayout);

  useEffect(() => {
    if (selectedLayout) {
      const newSize = getTotalCapacity(selectedLayout);
      setLayoutSize(newSize || 20);
    }
  }, [selectedLayout]);

  return (
    <>
      <RefreshBtn pexipBroadCastChannel={pexipBroadCastChannel}></RefreshBtn>
      <Presenter
        pLayout={pLayout}
        setSelectedLayout={setSelectedLayout}
        pexipBroadCastChannel={pexipBroadCastChannel}
        presenterLayout={presenterLayout}
      />
      <Media
        mLayout={mLayout}
        pexipBroadCastChannel={pexipBroadCastChannel}
        expandedStatus={false}
        currMediaLayoutIndex={currMediaLayoutIndex}
      />
      <PManagement
        participantsArray={participantsArray}
        setParticipantsArray={setParticipantsArray}
        setVoiceActivated={setVoiceActivated}
        header={header}
        roleStatus={roleStatus}
        talkingPplArray={talkingPplArray}
        pexipBroadCastChannel={pexipBroadCastChannel}
        layoutSize={layoutSize}
      />
    </>
  );
};
export default ComponentWrapper;

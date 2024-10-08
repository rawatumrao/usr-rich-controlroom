import "./viewallmedialayoutStyle.css";
import { useLocation, useNavigate } from "react-router-dom";
//import { useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import Media from "../media/media";
import { getLayoutIndex } from "../../../utils/layoutFuncs";

const ViewAllMediaLayout = ({
  mLayout,
  pexipBroadCastChannel,
  currMediaLayoutIndex,
}) => {
 // const [mediaLayoutIndex, setMediaLayoutIndex] = useState(currMediaLayoutIndex);
  const navigate = useNavigate();
  const location = useLocation();

  const layoutName=location.state?.layoutName

 // console.log("location layoutName :", layoutName);

 const index= getLayoutIndex(layoutName);

// console.log("location layoutName index :", index);

//setMediaLayoutIndex(index);
  //if (pexipBroadCastChannel==)

  const handleBackClick = () => {
   navigate("/");
   // navigate("/", {state:{mediaLayout: index}});
  };

  return (
    <div className="viewAllMediaLayout">
      <span className="link-text" onClick={handleBackClick}>
        <FontAwesomeIcon icon={faAngleLeft} /> Back
      </span>
      <Media
        mLayout={mLayout}
        pexipBroadCastChannel={pexipBroadCastChannel}
        expandedStatus={true}
        currMediaLayoutIndex={index}
      />
    </div>
  );
};

export default ViewAllMediaLayout;

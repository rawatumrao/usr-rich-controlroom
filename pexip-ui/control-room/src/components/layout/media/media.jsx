import "./mediaStyle.css";
import { useState, useRef, useContext } from "react";
import { AppContext } from "../../../contexts/context";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAngleDown,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { EVENTS } from "../../../constants/constants";
import { getLayoutName } from "../../../utils/layoutFuncs";
import defaultLayout from "../../../images/defaultLayout.svg";
import largeVideoLayout from "../../../images/largeVideoLayout.svg";
import largeContentLayout from "../../../images/largeContentLayout.svg";
import videoOnly from "../../../images/videoOnly.svg";
import contentOnly from "../../../images/contentOnly.svg";

const Media = ({
  mLayout,
  pexipBroadCastChannel,
  expandedStatus,
  currMediaLayoutIndex,
}) => {
  const initialImagesSrc = [
    { src: defaultLayout, index: 0 },
    { src: largeVideoLayout, index: 1 },
    { src: largeContentLayout, index: 2 },
    { src: videoOnly, index: 3 },
    { src: contentOnly, index: 4 },
  ];
  const mediaImageDiv = useRef();
  const [expanded, setExpanded] = useState(expandedStatus);
  const [selectedImage, setSelectedImage] = useState(currMediaLayoutIndex);
  const [imagesSrc, setImagesSrc] = useState(initialImagesSrc); // Manage images array state
  const { setShowRefresh, showRefresh, updatedShowRefreshVar } =
    useContext(AppContext);
  const navigate = useNavigate();

  const handleImageClick = (img, idx) => {
    mLayout(selectedImage === idx ? null : idx);
    setSelectedImage((prevImage) => (prevImage === idx ? null : idx));

    let layout = getLayoutName(img.index);

    pexipBroadCastChannel.postMessage({
      event: EVENTS.controlRoomMediaLayout,
      info: {
        mediaLayout: `${layout}`,
      },
    });

    if (showRefresh === false) {
      setShowRefresh(true);
      updatedShowRefreshVar(true);
    }
  };

  const toggleExpandCollapse = () => {
    setExpanded(!expanded);
    if (!expanded) {
      // Reorder imagesSrc so that the selected image comes first, followed  by  specifiec remaining images
      const reorderedImages = [
        imagesSrc[selectedImage],
        ...imagesSrc.filter((_, index) => index !== selectedImage),
      ];
      setImagesSrc(reorderedImages);
      setSelectedImage(0);
    }
  };

  const handleNext = () => {
    mediaImageDiv.current.scrollLeft += 160;
  };

  const handlePrev = () => {
    mediaImageDiv.current.scrollLeft -= 160;
  };

  const handleSeeAllClick = () => {
    navigate("/media-all-view");
  };

  return (
    <div className="expand-collapse-container">
      <div className="header">
        {!expanded ? (
          <>
            <span className="expand-button" onClick={toggleExpandCollapse}>
              <FontAwesomeIcon icon={faAngleRight} /> Media Layout
            </span>
            <span className="">
              <img
                className="header-image"
                src={
                  imagesSrc[selectedImage]
                    ? imagesSrc[selectedImage].src
                    : imagesSrc[0].src
                }
                onClick={toggleExpandCollapse}
              ></img>
            </span>
          </>
        ) : (
          <>
            <span className="collapse-button" onClick={toggleExpandCollapse}>
              <FontAwesomeIcon icon={faAngleDown} /> Media Layout
            </span>
            <span className="see-all" onClick={handleSeeAllClick}>
              See All
            </span>
          </>
        )}
      </div>
      {expanded && (
        <div className="image-gallery">
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="nav-arrow left-arrow"
            onClick={handlePrev}
          />
          <div className="images mediaImagesDiv" ref={mediaImageDiv}>
            {imagesSrc.map((image, index) => {
              const layoutName = getLayoutName(image.index)
                .replaceAll("_", " ")
                .toLowerCase();
              return (
                <img
                  key={index}
                  src={image.src}
                  className={
                    selectedImage === index
                      ? "mediaImages selected zoom-image"
                      : "mediaImages  zoom-image"
                  }
                  alt={layoutName}
                  title={layoutName}
                  onClick={() => handleImageClick(image, index)}
                />
              );
            })}
          </div>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="nav-arrow right-arrow"
            onClick={handleNext}
          />
        </div>
      )}
    </div>
  );
};

export default Media;

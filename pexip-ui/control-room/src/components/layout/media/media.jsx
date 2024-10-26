import "./mediaStyle.css";
import { useState, useRef, useContext, useEffect } from "react";
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
import {
  getLayoutName,
  geAltTexttLayoutName,
} from "../../../utils/layoutFuncs";
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
  seeAll,
}) => {
  const initialImagesSrc = [
    { src: defaultLayout, index: 0, initOrder: 0 },
    { src: largeVideoLayout, index: 1, initOrder: 1 },
    { src: largeContentLayout, index: 2, initOrder: 2 },
    { src: videoOnly, index: 3, initOrder: 3 },
    { src: contentOnly, index: 4, initOrder: 4 },
  ];
  const {
    setShowRefresh,
    showRefresh,
    updatedShowRefreshVar,
    savedSelectedMediaInitIndex,
  } = useContext(AppContext);
  const mediaImageDiv = useRef();
  const [expanded, setExpanded] = useState(expandedStatus);
  const [selectedImage, setSelectedImage] = useState(
    seeAll ? savedSelectedMediaInitIndex.current : currMediaLayoutIndex
  );
  const [imagesSrc, setImagesSrc] = useState(initialImagesSrc);
  const navigate = useNavigate();

  useEffect(() => {
    if (seeAll === false) {
      let reorderedImages = [];

      if (
        savedSelectedMediaInitIndex.current !== null &&
        selectedImage !== null
      ) {
        reorderedImages = [
          imagesSrc[savedSelectedMediaInitIndex.current],
          ...imagesSrc.filter(
            (_, index) => index !== savedSelectedMediaInitIndex.current
          ),
        ];
        setSelectedImage(0);
      } else {
        setSelectedImage(null);
        reorderedImages = [...imagesSrc];
      }

      // setSelectedImage(0);
      setImagesSrc(reorderedImages);
    }
  }, []);

  const handleImageClick = (img, idx) => {
    mLayout(selectedImage === idx ? null : idx);
    const tempSelectedImage = selectedImage === idx ? null : idx;
    setSelectedImage((prevImage) => (prevImage === idx ? null : idx));
    savedSelectedMediaInitIndex.current =
      tempSelectedImage !== null ? img.initOrder : null;

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
      let reorderedImages = [];

      if (
        savedSelectedMediaInitIndex.current !== null &&
        selectedImage !== null
      ) {
        // Reorder imagesSrc so that the selected image comes first, followed  by  specifiec remaining images
        reorderedImages = [
          imagesSrc[selectedImage],
          ...imagesSrc.filter((_, index) => index !== selectedImage),
        ];
        // setSelectedImage(0);
      } else {
        // setSelectedImage(null);
        reorderedImages = [...imagesSrc];
      }

      setSelectedImage(0);
      setImagesSrc(reorderedImages);
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
                  alt={geAltTexttLayoutName(image.index)}
                  title={geAltTexttLayoutName(image.index)}
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

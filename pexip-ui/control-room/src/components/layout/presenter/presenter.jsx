import { useRef, useState, useContext } from "react";
import { AppContext } from "../../../contexts/context";
import "../media/mediaStyle.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAngleDown,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { EVENTS } from "../../../constants/constants.js";
import { PresenterImages } from "../../common/presenterImages.jsx";
import {
  getIndexByLayout,
  getLayoutOrder,
} from "../../../constants/imageConstants.js";

const Presenter = ({ pLayout, setSelectedLayout, pexipBroadCastChannel }) => {
  const {
    setShowRefresh,
    showRefresh,
    updatedShowRefreshVar,
    presenterLayout,
    voiceActivated,
  } = useContext(AppContext);
  const [expanded, setExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(presenterLayout);
  const [sortedImages, setSortedImages] = useState([PresenterImages]);
  const imageContainerRef = useRef(null);
  const navigate = useNavigate();

  // const sortImages = () => {
  //   const selectedParticipantsNumber =getLayoutOrder(presenterLayout);
  //   const greaterOrEqual = PresenterImages.filter(image=> image.layoutOrder >= selectedParticipantsNumber);
  //   const lessThan = PresenterImages.filter(image => image.layoutOrder < selectedParticipantsNumber);

  //   greaterOrEqual.sort((a,b) => a.layoutOrder - b.layoutOrder);
  //   lessThan.sort((a,b)=> a.layoutOrder - b.layoutOrder);

  //   setSortedImages([...greaterOrEqual, ...lessThan]);
  // };

  const sortImages = () => {
    const selectedParticipantsNumber = getLayoutOrder(presenterLayout);

    const selectedImage = PresenterImages.find(
      (image) => image.layoutOrder === selectedParticipantsNumber
    );

    const remainingImages = PresenterImages.filter(
      (image) => image.layoutOrder !== selectedParticipantsNumber
    );

    remainingImages.sort((a, b) => a.layoutOrder - b.layoutOrder);

    if (selectedImage) {
      setSortedImages([selectedImage, ...remainingImages]);
    } else {
      setSortedImages([...PresenterImages]);
    }

    if (selectedImage !== presenterLayout) setSelectedImage(presenterLayout);
  };

  const toggleExpandCollapse = () => {
    if (!expanded) {
      sortImages();
    }
    setExpanded(!expanded);
  };

  const handleImageClick = (image) => {
    pLayout(image.layout);
    setSelectedLayout(image.layout);
    setSelectedImage((prevImage) => (prevImage === image ? null : image));

    pexipBroadCastChannel.postMessage({
      event: EVENTS.controlRoomPresenterLayout,
      info: JSON.parse(JSON.stringify(image.layout)),
    });

    if (showRefresh === false) {
      setShowRefresh(true);
      updatedShowRefreshVar(true);
    }
  };

  const handleDoubleClick = (image) => {
    setSelectedImage(image);
  };

  //Scrolling fuctions
  const handleNext = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollBy({
        left: 160,
        behaviot: "smooth",
      });
    }
  };

  const handlePrev = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollBy({
        left: -160,
        behaviot: "smooth",
      });
    }
  };

  const handleSeeAllClick = () => {
    navigate("/view-all");
  };

  // const sortedImages = [...PresenterImages].sort((a, b) => {
  //   return a.participantsNumber - b.participantsNumber;
  // });

  return (
    <div className="expand-collapse-container">
      <div className="header">
        {!expanded ? (
          <>
            <span className="expand-button" onClick={toggleExpandCollapse}>
              <FontAwesomeIcon icon={faAngleRight} /> Presenter Layout
            </span>
            <span className="" onClick={toggleExpandCollapse}>
              <img
                className={
                  presenterLayout === "5:7" && voiceActivated === false
                    ? "header-image disabledImage"
                    : "header-image"
                }
                src={
                  presenterLayout === "5:7" && voiceActivated
                    ? PresenterImages[0].selectedImageUrl
                    : sortedImages.find(
                        (item) => item.layout === presenterLayout
                      )?.imageUrl ||
                      PresenterImages[getIndexByLayout(selectedImage)].imageUrl
                }
              ></img>
            </span>
          </>
        ) : (
          <>
            <span className="collapse-button" onClick={toggleExpandCollapse}>
              <FontAwesomeIcon icon={faAngleDown} /> Presenter Layout
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
          <div className="images" ref={imageContainerRef}>
            {voiceActivated
              ? sortedImages.map((image, index) => (
                  <img
                    key={index}
                    src={
                      selectedImage === image.layout ||
                      selectedImage?.layout === image.layout ||
                      image.scope === "Adaptive"
                        ? image.selectedImageUrl
                        : image.imageUrl
                    }
                    title={image.alt}
                    alt={image.alt}
                    onClick={() => handleImageClick(image)}
                    onDoubleClick={() => handleDoubleClick(image)}
                    className={`image ${
                      selectedImage === image.layout ||
                      selectedImage?.layout === image.layout
                        ? "zoom-image selectedImage"
                        : "zoom-image"
                    }`}
                  />
                ))
              : sortedImages.map((image, index) => (
                  <img
                    key={index}
                    src={
                      (selectedImage === image.layout ||
                        selectedImage?.layout === image.layout) &&
                      image.scope !== "Adaptive"
                        ? image.selectedImageUrl
                        : image.imageUrl
                    }
                    title={image.alt}
                    alt={image.alt}
                    onClick={
                      image.scope === "Adaptive"
                        ? () => {}
                        : () => handleImageClick(image)
                    }
                    onDoubleClick={
                      image.scope === "Adaptive"
                        ? () => {}
                        : () => handleDoubleClick(image)
                    }
                    className={`image ${
                      image.scope === "Adaptive"
                        ? "zoom-image"
                        : selectedImage === image.layout ||
                          selectedImage?.layout === image.layout
                        ? "zoom-image selectedImage"
                        : "zoom-image"
                    }`}
                  />
                ))}
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

export default Presenter;

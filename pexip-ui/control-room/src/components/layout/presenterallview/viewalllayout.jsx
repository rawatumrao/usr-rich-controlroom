import { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../contexts/context";
import { useNavigate } from "react-router-dom";
import "../media/mediaStyle.css";
import "./viewalllayoutStyle.css";
import { EVENTS } from "../../../constants/constants.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { PresenterImages } from "../../common/presenterImages.jsx";

const ViewAllLayout = ({ setPresenterAllLayout, pexipBroadCastChannel }) => {
  const {
    showRefresh,
    setShowRefresh,
    updatedShowRefreshVar,
    presenterLayout,
    voiceActivated,
  } = useContext(AppContext);
  const [selectedImage, setSelectedImage] = useState(presenterLayout);
  const navigate = useNavigate();

  useEffect(() => {
    pexipBroadCastChannel.onmessage = (msg) => {
      if (msg.data.event === EVENTS.controlRoomLayoutUpdate) {
        setPresenterAllLayout(msg?.data?.info?.presenterLayout);
        setSelectedImage((prevImage) =>
          prevImage === msg?.data?.info?.presenterLayout
            ? null
            : msg?.data?.info?.presenterLayout
        );
      }
    };
  }, []);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleImageClick = (image) => {
    setPresenterAllLayout(image.layout);
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

  const categorizeImages = (category) => {
    return PresenterImages.filter((image) => image.scope.startsWith(category));
  };

  const adaptiveImages = categorizeImages("Adaptive");
  const speakerFocusedImages = categorizeImages("Speaker");
  const equalSizeImages = categorizeImages("Equalsize");
  const largeGroupImages = categorizeImages("Largegroup");

  return (
    <div className="view-all-layout">
      <span className="link-text" onClick={handleBackClick}>
        <FontAwesomeIcon icon={faAngleLeft} /> Back
      </span>
      <div className="layouts">
        <div>
          <span className="text-style"> Adaptive</span>
          <div className="gridContainer">
            {voiceActivated
              ? adaptiveImages.map((image, index) => (
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
              : adaptiveImages.map((image, index) => (
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
                        : "disabledImage"
                    }`}
                  />
                ))}
          </div>
        </div>
        <div>
          <span className="text-style"> Speaker Focused</span>
          <div className="gridContainer">
            {speakerFocusedImages.map((image, index) => (
              <div key={index} className="box">
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
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-style"> Equal Size</span>
          <div className="gridContainer">
            {equalSizeImages.map((image, index) => (
              <div key={index} className="box">
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
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-style"> Large Group</span>
          <div className="gridContainer">
            {largeGroupImages.map((image, index) => (
              <div key={index} className="box">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllLayout;

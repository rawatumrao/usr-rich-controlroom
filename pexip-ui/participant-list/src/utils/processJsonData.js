export const createData = (DATA) => {
  const processedData = [];

  DATA?.map((item) => {
    if (item?.displayName === undefined) item.displayName = item?.display_name;

    if (item?.spotlightOrder === undefined)
      item.spotlightOrder = item?.spotlight;

    if (item?.isCameraMuted === undefined)
      item.isCameraMuted = item?.is_video_muted;

    if (item?.isMuted === undefined)
      item.isMuted = item?.is_muted === "YES" ? true : false;

    if (item?.raisedHand === undefined)
      item.raisedHand = item?.buzz_time ? true : false;

    if (item?.rxPresentation === undefined)
      item.rxPresentation =
        item?.rx_presentation_policy === "ALLOW" ? true : false;

    if (item?.isPresenting === undefined)
      item.isPresenting = item?.is_presenting === "YES" ? true : false;

    if (item?.serviceType === undefined) item.serviceType = item?.service_type;

    if (item?.overlayText === undefined) item.overlayText = item?.overlay_text;

    if (item?.isStreaming === undefined)
      item.isStreaming = item?.is_streaming_conference;

    if (item?.startAt === undefined)
      item.startAt = new Date()
        .toLocaleString(undefined, {
          timeZoneName: "short",
        })
        .split(", ")[1];
    else
      item.startAt = new Date(item.startAt)
        .toLocaleString(undefined, {
          timeZoneName: "short",
        })
        .split(", ")[1];

    if (
      item?.callType === "audio" &&
      item?.displayName?.includes("Phone Presenter")
    )
      item.is_audio_only_call = true;
    else if (item?.displayName?.includes("Phone Presenter"))
      item.is_audio_only_call = true;
    else item.is_audio_only_call = false;

    if (item?.has_media === undefined)
      item.has_media = item?.rawData?.has_media;

    if (item?.userId === undefined && item?.participant_uuid !== undefined)
      item.userId = item?.participant_uuid;

    if (item?.layout_group === undefined)
      item.layout_group = item?.rawData?.layout_group;

    processedData?.push(item);
  });

  return processedData;
};

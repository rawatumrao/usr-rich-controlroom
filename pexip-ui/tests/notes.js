//////////////////////////
// Pexip React App Data //
//////////////////////////
var pexipDataJson = {
  vbConference: parseInt(vbConference),
  vbPin: parseInt(vbPin),
  fullNameVb: fullNameVb,
  conferencing_node: conferencing_node,
  sMaxRoomParticipants: sMaxRoomParticipants,
  sendData: {},
  LocalVideoMutedButton: false,
  video: "video",
  audio: "audio",
  video_unmuted: "video_unmuted",
  video_muted: "video_muted",
  adminid: ui,
  controlRoomIsOpen: false,
  particpantsListIsOpen: false,
  controlRoomData: {
    presenterLayout: null,
    mediaLayout: null,
    voiceActivated: null,
    onStage: [],
    offScreen: [],
    showRefresh: false,
    pinning_config: "",
    defaults: {
      presenterLayout: null,
      mediaLayout: null,
      voiceActivated: null,
      onStage: [],
      offScreen: [],
      showRefresh: false,
      pinning_config: "",
    },
  },
  runTwice: 0,
};

pexipDataJson.controlRoomLayoutUpdate = (presenterLayout) => {
  pexipBroadcastChannel.postMessage({
    event: "controlRoomLayoutUpdate",
    info: {
      presenterLayout: presenterLayout,
    },
  });
};

pexipDataJson.controlRoomHasLoaded = () => {
  pexipBroadcastChannel.postMessage({
    event: "conntrolRoomisLoaded",
    info: {},
  });
};

pexipDataJson.changeViewerLayout = (layout) => {
  pexipDataJson.controlRoomData.mediaLayout = layout;
  pexipDataJson.controlRoomData.defaults.mediaLayout = layout;

  let data = {
    mediaid: layout,
    action: "layout_flip",
    eventid: pexipDataJson.vbConference,
    adminid: pexipDataJson.adminid,
    confirmed: "1",
  };

  top.ViewerLayoutPanel.triggerAction(JSON.stringify(data));
};

pexipDataJson.showVbMsg = (msg, uuid, buttonType, status) => {
  try {
    let vbMsgElem = $(window.parent.document)
      .contents()
      .find("#videobridge_frame")
      .contents()
      .find("#videobridge_frame_angular")[0]
      .contentWindow.document.querySelector("#vbMsg");
    let vbMsgSpanElem = $(window.parent.document)
      .contents()
      .find("#videobridge_frame")
      .contents()
      .find("#videobridge_frame_angular")[0]
      .contentWindow.document.querySelector("#vbMsgSpan");

    if (pexipDataJson?.myVBuuid === uuid) {
      if (
        pexipDataJson?.LocalVideoMutedButton &&
        buttonType === pexipDataJson?.video &&
        status === pexipDataJson?.video_unmuted
      )
        msg =
          "A host has requested to turn your video on. Please make sure your camera is unmuted.";

      if (
        pexipDataJson?.LocalVideoMutedButton === false &&
        buttonType === pexipDataJson?.video &&
        status === pexipDataJson?.video_muted
      )
        msg = "A host has stopped your video. Your camera is still connected.";

      vbMsgSpanElem.innerHTML = msg;
      vbMsgElem.style.display = "flex";

      setTimeout(() => {
        vbMsgSpanElem.innerHTML = "";
        vbMsgElem.style.display = "none";
      }, 5000);
    }
  } catch (err) {
    console.log(`videobridge.jsp pexipDataJson.showVbMsg error: ${err}`);
  }
};

pexipDataJson.showMyOwnVbMsg = (msg) => {
  try {
    let vbMsgElem = $(window.parent.document)
      .contents()
      .find("#videobridge_frame")
      .contents()
      .find("#videobridge_frame_angular")[0]
      .contentWindow.document.querySelector("#vbMsg");
    let vbMsgSpanElem = $(window.parent.document)
      .contents()
      .find("#videobridge_frame")
      .contents()
      .find("#videobridge_frame_angular")[0]
      .contentWindow.document.querySelector("#vbMsgSpan");

    vbMsgSpanElem.innerHTML = msg;
    vbMsgElem.style.display = "flex";

    setTimeout(() => {
      vbMsgSpanElem.innerHTML = "";
      vbMsgElem.style.display = "none";
    }, 5000);
  } catch (err) {
    console.log(`videobridge.jsp pexipDataJson.showMyOwnVbMsg error: ${err}`);
  }
};

pexipDataJson.layoutGroupValue = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

pexipDataJson.indexToLayoutName = (index) => {
  return pexipDataJson.layoutGroupValue[index];
};

pexipDataJson.layoutNameToIndex = (layoutName) => {
  return pexipDataJson.layoutGroupValue.indexOf(layoutName);
};

/////////////////////////////
//End Pexip React App Data //
/////////////////////////////

/////////////////////////////////////////////////
////              Layout Switching           ////
/////////////////////////////////////////////////
const adminid = parent.parent.ui;
const eventid = parent.parent.vbConference;
const mediaid = {
  LAYOUT_DEFAULT_VIDEO: "LAYOUT_DEFAULT_VIDEO",
  LAYOUT_VIDEO_LARGE: "LAYOUT_VIDEO_LARGE",
  LAYOUT_SLIDE_LARGE: "LAYOUT_SLIDE_LARGE",
  LAYOUT_VIDEO_ONLY: "LAYOUT_VIDEO_ONLY",
  LAYOUT_SLIDE_ONLY: "LAYOUT_SLIDE_ONLY",
};

// LS function to change layouts example
top.ViewerLayoutPanel.triggerAction(`{
  mediaid: "LAYOUT_SLIDE_ONLY",
  action: "layout_flip",
  eventid: "52874",
  adminid: "aa9a80b7e26ee76d6e1df30a7382cb987793a045",
  confirmed: "1",
}`);

// function in use example
top.ViewerLayoutPanel.triggerAction(`{
  mediaid: mediaid[0],
  action: "layout_flip",
  eventid: eventid,
  adminid: adminid,
  confirmed: "1",
}`);

/////////////////////////////////////////////////
////              custom.js file             ////
/////////////////////////////////////////////////
let fullNameVb = decodeURIComponent(parent.fullNameVb);
const bcChannel = new BroadcastChannel("pexip");

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    try {
      // getting username and updating name input
      userNameElem = document.getElementById("userNameStepTextInput");
      userNameElem.defaultValue = fullNameVb;

      // making custom event and firing a onchange event on input to change state for submit button to enabled
      let event = new Event("change", { bubbles: true });
      userNameElem.dispatchEvent(event);
    } catch (error) {
      console.log(`custom.js - error getting userNameStepTextInput element`);
    }
  }, 1000);

  //////////////////////
  // get Client Token //
  //////////////////////
  function interceptNetworkRequests(ee) {
    const fetch = window.fetch || "";
    const isFetchNative = fetch.toString().indexOf("native code") !== -1;

    if (isFetchNative) {
      const json = Response?.prototype?.json;
      Response.prototype.json = function () {
        const p = json.apply(this, arguments);
        if (
          this?.url?.includes("request_token") ||
          this?.url?.includes("refresh_token")
        ) {
          let a = p;
          a.then((data) => {
            try {
              if (data?.result?.token) {
                parent.pexipDataJson.pexipClientToken = data.result.token;
                bcChannel.postMessage({
                  event: "token_refresh",
                  info: data.result.token,
                  uuid: parent.pexipDataJson.myVBuuid,
                });
              }
            } catch (err) {
              console.log(`interceptNetworkRequests: ${err}`);
            }
          });
          p.then(ee.onFetchLoad && ee.onFetchLoad.bind(ee, "json"));
          return p;
        } else {
          return p;
        }
      };
    }
  }

  interceptNetworkRequests({
    onFetchLoad: console.log(""),
  });

  /////////////////////////////////////////////////////////////////////////////
  // Get VB Your UUID and Talking Person UUID on Load and Save Order of Lists//
  /////////////////////////////////////////////////////////////////////////////
  bcChannel.onmessage = (msg) => {
    let pexipDataJsonVar = parent.pexipDataJson;

    if (msg?.data?.event === "me" && pexipDataJsonVar.myVBuuid === undefined)
      pexipDataJsonVar.myVBuuid = msg?.data?.info?.participant?.uuid;
    else if (msg?.data?.event === "stage") {
      pexipDataJsonVar.talkingVbPersonUuid = "";

      msg?.data?.info?.forEach((elem) => {
        if (elem.vad) pexipDataJsonVar.talkingVbPersonUuid = elem.userId;
      });
    } else if (msg?.data?.event === "participants") {
      pexipDataJsonVar.saveVbParticpants = msg?.data?.info?.participants;
      let LocalVideoMutedButton = document.querySelectorAll(
        '[data-testid="button-meeting-videoinput-muted"]'
      )[0];
      pexipDataJsonVar.LocalVideoMutedButton = LocalVideoMutedButton
        ? true
        : false;

      // CONTROL ROOM ONLY
      // add / delete person that left from the onStage or offScreen
      let onStageOffScreenArr = [
        ...pexipDataJsonVar.controlRoomData.onStage,
        ...pexipDataJsonVar.controlRoomData.offScreen,
      ];

      if (
        pexipDataJsonVar.controlRoomIsOpen === false &&
        onStageOffScreenArr.length
      ) {
        const tempParticipants = pexipDataJsonVar.saveVbParticpants.filter(
          (item) => item?.callType !== "api" && item?.callType !== "rtmp"
        );

        const newParticipants = tempParticipants.filter(
          (participant) =>
            !onStageOffScreenArr.some((p) => p.uuid === participant.uuid)
        );

        // add new particpants
        if (newParticipants.length)
          newParticipants.forEach((item) => {
            pexipDataJsonVar.controlRoomData.offScreen.push(item);
          });
        else if (onStageOffScreenArr.length > tempParticipants.length) {
          // rempve particpants
          let tempOnstage = [];

          tempParticipants.forEach((item) => {
            pexipDataJsonVar.controlRoomData.onStage.forEach((elem) => {
              if (item.uuid === elem.uuid) {
                item.layout_group = elem.layout_group;
                tempOnstage.push(item);
              }
            });
          });

          let sortedPpl = tempOnstage.sort(
            (a, b) =>
              pexipDataJsonVar.layoutNameToIndex(a?.layout_group) -
              pexipDataJsonVar.layoutNameToIndex(b?.layout_group)
          );

          tempOnstage = sortedPpl.map((item, index) => {
            return {
              ...item,
              layout_group: pexipDataJsonVar.indexToLayoutName(index),
            };
          });

          pexipDataJsonVar.controlRoomData.onStage = [...tempOnstage];

          let tempOffScreen = [];

          tempParticipants.forEach((item) => {
            pexipDataJsonVar.controlRoomData.offScreen.forEach((elem) => {
              if (item.uuid === elem.uuid) {
                item.layout_group = elem.layout_group;
                tempOffScreen.push(item);
              }
            });
          });

          pexipDataJsonVar.controlRoomData.offScreen = [...tempOffScreen];
        }
      }
    } else if (msg?.data?.event === "orderedList") {
      let orderedListName = msg?.data?.orderedListName;

      if (orderedListName === "Waiting to Join")
        pexipDataJsonVar.waitToJoinOrder = msg?.data?.info;
      else if (orderedListName === "Presenters")
        pexipDataJsonVar.presentersOrder = msg?.data?.info;
      else if (orderedListName === "Streams")
        pexipDataJsonVar.streamsOrder = msg?.data?.info;
    } else if (msg?.data?.event === "sendMsg") {
      if (pexipDataJsonVar.myVBuuid !== msg?.data?.info?.uuid)
        pexipDataJsonVar.sendData.uuid = msg?.data?.info?.uuid;
      pexipDataJsonVar.sendData.showVbMsg = msg?.data?.info?.msg;
      pexipDataJsonVar.sendData.buttonType = msg?.data?.info?.buttonType;
      pexipDataJsonVar.sendData.status = msg?.data?.info?.status;

      parent.pushSendDataFromReactPresenterList(pexipDataJsonVar.sendData);
    } else if (msg?.data?.event === "controlRoomVoiceActivated") {
      pexipDataJsonVar.controlRoomData.voiceActivated = msg?.data?.info;
      pexipDataJsonVar.controlRoomData.showRefresh = true;
    } else if (msg?.data?.event === "controlRoomStageOrders") {
      pexipDataJsonVar.controlRoomData.onStage = msg?.data?.info?.onStage;
      pexipDataJsonVar.controlRoomData.offScreen = msg?.data?.info?.offScreen;
    } else if (msg?.data?.event === "controlRoomMediaLayout") {
      pexipDataJsonVar.controlRoomData.mediaLayout =
        msg?.data?.info?.mediaLayout;
      pexipDataJsonVar.controlRoomData.showRefresh = true;
    } else if (msg?.data?.event === "controlRoomPresenterLayout") {
      pexipDataJsonVar.controlRoomData.presenterLayout = msg?.data?.info;
      pexipDataJsonVar.controlRoomData.showRefresh = true;
    } else if (msg?.data?.event === "controlRoomRefresh") {
      pexipDataJsonVar.controlRoomData.onStage = [];
      pexipDataJsonVar.controlRoomData.offScreen = [];
      pexipDataJsonVar.controlRoomData.presenterLayout =
        pexipDataJsonVar.controlRoomData.defaults.presenterLayout;
      pexipDataJsonVar.controlRoomData.mediaLayout =
        pexipDataJsonVar.controlRoomData.defaults.mediaLayout;
      pexipDataJsonVar.controlRoomData.voiceActivated =
        pexipDataJsonVar.controlRoomData.defaults.voiceActivated;
      pexipDataJsonVar.controlRoomData.defaults.showRefresh = false;
      pexipDataJsonVar.controlRoomData.showRefresh = false;
    } else if (msg?.data?.event === "layoutUpdate") {
      // update the presenter layout on stock layout change
      if (
        pexipDataJsonVar.controlRoomIsOpen === false &&
        pexipDataJsonVar.controlRoomData.showRefresh === false
      )
        pexipDataJsonVar.controlRoomData.presenterLayout =
          msg?.data?.info?.view;
      else if (
        pexipDataJsonVar.controlRoomIsOpen &&
        pexipDataJsonVar.controlRoomData.showRefresh === false
      )
        pexipDataJsonVar.controlRoomLayoutUpdate(msg?.data?.info?.view);

      // hack to get teh presenter layout on load and make isLoaded var true
      if (pexipDataJsonVar.runTwice < 2) {
        pexipDataJsonVar.controlRoomData.presenterLayout =
          msg?.data?.info?.view;

        if (pexipDataJsonVar.runTwice === 0) {
          pexipDataJsonVar.controlRoomData.isLoaded = true;
          pexipDataJsonVar.controlRoomisLoaded();
        }

        pexipDataJsonVar.runTwice++;
      }

      // update teh defaults for the persenter layout
      // if (msg?.data?.info?.requested_layout?.primary_screen?.chair_layout)
      //   pexipDataJsonVar.controlRoomData.defaults.presenterLayout =
      //     msg?.data?.info?.requested_layout?.primary_screen?.chair_layout;
      // else
      pexipDataJsonVar.controlRoomData.defaults.presenterLayout =
        msg?.data?.info?.view;
    } else if (msg?.data?.event === "controlRoomApply") {
      // update default variables
      // pexipDataJsonVar.controlRoomData.defaults.mediaLayout =
      //   msg?.data?.info?.mediaLayout;
      pexipDataJsonVar.controlRoomData.defaults.presenterLayout =
        msg?.data?.info?.presenterLayout;
      pexipDataJsonVar.controlRoomData.defaults.voiceActivated =
        msg?.data?.info?.voiceActivated;
      pexipDataJsonVar.controlRoomData.defaults.showRefresh = false;
      pexipDataJsonVar.controlRoomData.defaults.onStage = [];
      pexipDataJsonVar.controlRoomData.defaults.offScreen = [];
      pexipDataJsonVar.controlRoomData.defaults.pinning_config =
        msg?.data?.info?.pinning_config;

      // refresh variables
      pexipDataJsonVar.controlRoomData.showRefresh = false;
      pexipDataJsonVar.controlRoomData.onStage = msg?.data?.info?.onStage;
      pexipDataJsonVar.controlRoomData.offScreen = msg?.data?.info?.offScreen;
      // pexipDataJsonVar.controlRoomData.mediaLayout =
      //   msg?.data?.info?.mediaLayout;
      pexipDataJsonVar.controlRoomData.presenterLayout =
        msg?.data?.info?.presenterLayout;
      pexipDataJsonVar.controlRoomData.voiceActivated =
        msg?.data?.info?.voiceActivated;
      pexipDataJsonVar.controlRoomData.pinning_config =
        msg?.data?.info?.pinning_config;
    } else if (msg?.data?.event === "controlRoomShowRefresh") {
      pexipDataJsonVar.controlRoomData.showRefresh =
        msg?.data?.info?.showRefresh;
    } else if (msg?.data?.event === "conferenceStatus") {
      if (pexipDataJsonVar.runTwice < 2) {
        if (
          (msg?.data?.info?.status?.rawData?.pinning_config === "" ||
            msg?.data?.info?.status?.rawData?.pinning_config === null) &&
          pexipDataJsonVar?.controlRoomData?.showRefresh === false
        ) {
          pexipDataJsonVar.controlRoomData.voiceActivated = true;
          pexipDataJsonVar.controlRoomData.defaults.voiceActivated = true;
        } else {
          pexipDataJsonVar.controlRoomData.defaults.voiceActivated = false;
          pexipDataJsonVar.controlRoomData.voiceActivated = false;
        }

        pexipDataJsonVar.controlRoomData.defaults.pinning_config =
          msg?.data?.info?.status?.rawData?.pinning_config;
        pexipDataJsonVar.controlRoomData.pinning_config =
          msg?.data?.info?.status?.rawData?.pinning_config;
      }
    } else if (msg?.data?.event === "controlRoomIsLoaded") {
      pexipDataJsonVar.controlRoomData.isLoaded = true;
    }
  };
});

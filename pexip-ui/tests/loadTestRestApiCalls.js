const YOUR_VB_UUID = pexipDataJson.myVBuuid;
const NODE_ADDRESS = pexipDataJson.conferencing_node;
const EVENT_ID = pexipDataJson.vbConference;
const TOKEN = pexipDataJson.pexipClientToken;
const API_CALLS = {
  spotlightoff: "spotlightoff",
  spotlighton: "spotlighton",
  video_unmuted: "video_unmuted",
  video_muted: "video_muted",
  unmute: "unmute",
  mute: "mute",
  chair: "chair",
  guest: "guest",
  allowShares: "allowrxpresentation",
  denyShares: "denyrxpresentation",
  dtmf: "dtmf",
  overlaytext: "overlaytext",
  role: "role",
  disconnect: "disconnect",
  raiseHand: "buzz",
  lowerHand: "clearbuzz",
  unlock: "unlock",
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////   RUN IN VIDEOBRIDGE.JSP CONSOLE !!!! ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// ONLY CHANGE ME HERE!!! /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
let callArray = [API_CALLS.video_muted, API_CALLS.video_unmuted]; // 2 CALLS HERE ONLY
let callCount = 20; // AMOUNT OF CALLS
let time = 3000; // AMOUNT OF TIME BETWEEN CALLS
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

let participantsPostFetch = async (apiCall) => {
  try {
    let fetchRequest = await fetch(
      `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants/${YOUR_VB_UUID}/${apiCall}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: `${TOKEN}`,
        },
      }
    );

    let response = await fetchRequest.json();
    let result = await response.result;

    if (result && callCount) {
      setTimeout(() => {
        callCount--;
        console.log(
          `Successful participantsPostFetch ${callArray[callCount % 2]} call`
        );
        participantsPostFetch(callArray[callCount % 2]);
      }, time);
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchInitialParticipants = async () => {
  try {
    const fetchRequest = await fetch(
      `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants`,
      {
        headers: {
          token: `${TOKEN}`,
        },
      }
    );

    let response = await fetchRequest.json();
    let result = await response.result;

    if (result && callCount) {
      setTimeout(() => {
        callCount--;
        console.log(`Successful fetchInitialParticipants call`);
        fetchInitialParticipants();
      }, time);
    }
  } catch (error) {
    console.error(error);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////   RUN IN VIDEOBRIDGE.JSP CONSOLE !!!! ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// ONLY CHANGE ME HERE!!! /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
participantsPostFetch(callArray[0]); // pick a call
// fetchInitialParticipants(); // pick a call
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

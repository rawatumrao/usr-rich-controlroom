import { EVENT_ID, NODE_ADDRESS, INITIAL_TOKEN } from "../constants/constants";

const timeoutPromise = (timeout) => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request time out")), timeout)
  );
};

const fetchWithRetryWithTimeout = async (
  url,
  options,
  retries = 3,
  timeout = 5000
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await Promise.race([
        fetch(url, options),
        timeoutPromise(timeout),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status:: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
    }
  }
};

export const participantsPostFetch = async (data) => {
  let fetchRequest = await fetch(
    `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants/${data.uuid}/${data.call}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: `${data.token}`,
      },
    }
  );

  let response = await fetchRequest.json();
  let result = await response.result;

  if (typeof result != "boolean") result = false;
  return result;
};

export const participantsPostWithBody = async (data) => {
  let fetchRequest = await fetch(
    `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants/${data.uuid}/${data.call}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: `${data.token}`,
      },
      body: JSON.stringify(data.body),
    }
  );

  let response = await fetchRequest.json();
  let result = await response.result;

  if (typeof result != "boolean") result = false;
  return result;
};

export const conferencePostFetch = async (data) => {
  await fetch(
    `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/${data.call}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: `${data.token}`,
      },
    }
  );
};

export const conferenceGetFetch = async (data) => {
  await fetch(
    `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/${data.call}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: `${data.token}`,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => data.result)
    .catch((err) => {
      console.log(err);
    });
};
/* ============================     Control-Room-Api      =============================== */

export const transformLayout = async (data) => {
  //  console.log("Selected Layout and new token: ", data.body);
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/transform_layout`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: `${data.token}`,
    },
    body: JSON.stringify(data.body),
  };
  const response = await fetchWithRetryWithTimeout(url, options);
  return response;
};

export const fetchParticipants = async () => {
  const response = await fetch(
    `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants`,
    {
      headers: {
        token: `${INITIAL_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  //console.log("Verify generated token info", data.result );
  return data.result;
};

export const fetchInitialParticipants = async () => {
  const response = await fetch(
    `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants`,
    {
      headers: {
        token: `${INITIAL_TOKEN}`,
      },
    }
  );
  return await response.json();
};

// fetchWithRetryWithTimeout
export const participantSpotlightOn = async (data) => {
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants/${data.uuid}/spotlighton`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: `${data.token}`,
    },
  };
  await fetchWithRetryWithTimeout(url, options);
};

export const participantSpotlightOff = async (data) => {
  //console.log("called participantSpotlightOff api ", data.token);
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants/${data.uuid}/spotlightoff`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: `${data.token}`,
    },
  };
  await fetchWithRetryWithTimeout(url, options);
};

/* ============================     Pinning API call During Voice-Activation Mode in Control-Room-Api      =============================== */

export const setPinningConfig = async (data) => {
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/set_pinning_config`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: `${data.token}`,
    },
    body: JSON.stringify({ pinning_config: data.pinning_config }),
  };
  const response = await fetchWithRetryWithTimeout(url, options);
  return response;
};

export const getPinningConfig = async (data) => {
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/get_pinning_config`;
  const options = {
    headers: {
      token: `${data.token}`,
    },
  };
  const response = await fetchWithRetryWithTimeout(url, options);
  const responseData = await response.json();
  return responseData.result;
};
export const clearPinningConfig = async (data) => {
  // console.log("Called clearPinningConfig");
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/set_pinning_config`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: `${data.token}`,
    },
    body: JSON.stringify({ pinning_config: "" }),
  };
  const response = await fetchWithRetryWithTimeout(url, options);
  return response;
};

export const setParticipantToLayoutGroup = async (data) => {
  //console.log("called setParticipantToLayoutGroup API", data.layoutgroup);
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants/${data.uuid}/layout_group`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: `${data.token}`,
    },
    body: JSON.stringify({ layout_group: data.layoutgroup }),
  };
  const response = await fetchWithRetryWithTimeout(url, options);
  return response;
};

export const clearParticipantFromLayoutGroup = async (data) => {
  // console.log("called clearParticipantFromLayoutGroup API");
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants/${data.uuid}/layout_group`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: `${data.token}`,
    },
    body: JSON.stringify({ layout_group: null }),
  };
  const response = await fetchWithRetryWithTimeout(url, options);
  return response;
};

export const clearParticipantFromLayoutGroupWhileInVoiceAct = async (data) => {
  // console.log("called clearParticipantFromLayoutGroup API");
  const url = `https://${NODE_ADDRESS}/api/client/v2/conferences/${EVENT_ID}/participants/${data.uuid}/layout_group`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: `${data.token}`,
    },
    body: JSON.stringify({ layout_group: "" }),
  };
  const response = await fetchWithRetryWithTimeout(url, options);
  return response;
};

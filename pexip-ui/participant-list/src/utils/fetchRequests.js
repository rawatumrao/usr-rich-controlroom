import { EVENT_ID, NODE_ADDRESS, INITIAL_TOKEN } from "../contexts/constants";

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

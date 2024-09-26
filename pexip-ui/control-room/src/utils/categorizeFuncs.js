import { YOUR_VB_UUID, ROLES, SERVICE_TYPE } from "../constants/constants";

export const findRoleOfUser = (users) => {
  let amIaHost = false;
  users.forEach((user) => {
    if (YOUR_VB_UUID === user.uuid && user.role === ROLES.chair)
      amIaHost = true;
  });
  return amIaHost;
};

export const sortParticipants = (users, protocols, host, rtmp) => {
  let filteredUers = [];

  if (rtmp) {
    users.forEach((user) => {
      if (user.isStreaming) filteredUers.push(user);
    });
  } else if (host) {
    protocols.forEach((protocol) => {
      users.forEach((user) => {
        if (
          user.protocol === protocol &&
          user.serviceType !== SERVICE_TYPE.waiting_room &&
          user.isStreaming === false &&
          user.displayName.includes("API Control User") === false &&
          user.has_media &&
          user.is_audio_only_call === false // hide phone presenter
        ) {
          filteredUers.push(user);
        }
      });
    });
  } else {
    users.forEach((user) => {
      if (
        user.isStreaming === false &&
        user.displayName.includes("API Control User") === false &&
        user.has_media &&
        user.is_audio_only_call === false // hide phone presenter
      )
        filteredUers.push(user);
    });
  }

  return filteredUers;
};

export const sortParticipantServiceType = (users, serviceType) => {
  let filteredUers = [];

  serviceType.forEach((svcType) => {
    users.forEach((user) => {
      if (user.serviceType === svcType) filteredUers.push(user);
    });
  });

  return filteredUers;
};

class CustomPexRTC extends PexRTC {
  constructor() {
    super();
  }

  #getToken() {
    this.token = localStorage.getItem("token");
  }

  requestToken() {
    this.#getToken();
  }

  refreshToken() {}
}

//////////////////////////////////////////////////

// PexRTC.prototype.getToken = () => {
//   parent.pexipClientToken = localStorage.getItem("token");
// };

PexRTC.prototype.setToken = () => {
  let self = this;

  self.token =
    parent.pexipClientToken !== self.token
      ? parent.pexipClientToken
      : "Error No Token";
};

// CUSTOM GLOBALMEET
PexRTC.prototype.requestToken = function (cb) {
  let self = this;
  let chosen_idp_uuid = self.chosen_idp_uuid;
  let sso_token = self.sso_token;

  if (!self.token) {
    if (
      chosen_idp_uuid == "" ||
      chosen_idp_uuid == "undefined" ||
      chosen_idp_uuid === null
    ) {
      chosen_idp_uuid = "none";
    }

    if (sso_token == "" || sso_token == "undefined" || sso_token === null) {
      sso_token = "none";
    }

    let params = {
      display_name: self.display_name,
      chosen_idp: chosen_idp_uuid,
      sso_token: sso_token,
      direct_media: true,
      client_id: self.client_id,
    };

    if (self.registration_token) {
      params.registration_token = self.registration_token;
    }
    if (self.oneTimeToken) {
      params.token = self.oneTimeToken;
      self.oneTimeToken = null;
    }
    if (self.conference_extension) {
      params.conference_extension = self.conference_extension;
    }
    if (self.call_tag) {
      params.call_tag = self.call_tag;
    }

    // Include self.node so that the API has knowledge of the FQDN/address the client
    // is connecting to, to reach the node. self helps with some SAML SSO flows.
    if (self.node) {
      params.node = self.node;
    }

    self.sendRequest(
      "request_token",
      params,
      function (evt) {
        self.tokenRequested(evt, cb);
      },
      "POST",
      10,
      60000
    );
  } else if (cb) {
    cb();
  }
};

PexRTC.prototype.refreshToken = () => {
  let self = this;
  let old_token = self.token;

  self.sendRequest("refresh_token", null, function (e) {
    self.onLog("PexRTC.refreshToken response", e.target.responseText);
    if (self.state != "DISCONNECTING" && self.state != "IDLE") {
      let msg = {};
      try {
        msg = JSON.parse(e.target.responseText);
      } catch (error) {
        msg.reason = e.target.status + " " + e.target.statusText;
      }

      let old_token = self.token;

      if (e.target.status == 200) {
        self.token = msg.result.token;

        if (msg.result.role != self.role) {
          self.onLog("Role has changed from", self.role, "to", msg.result.role);
          self.role = msg.result.role;

          if (self.onRoleUpdate) {
            self.onRoleUpdate(self.role);
          }

          self.getParticipants(function (e2) {
            if (e2.target.status == 200) {
              let msg2 = JSON.parse(e2.target.responseText);
              for (let i = 0; i < msg2.result.length; i++) {
                let participant = msg2.result[i];
                self.rosterList[participant.uuid] = participant;
                self.onParticipantUpdate(participant);
              }
            }
          });
        }
      } else if (old_token == self.token) {
        // Only error out if the token hasn't changed under us
        return self.handleError(msg.result || msg.reason);
      }
    } else {
      self.onLog("PexRTC.refreshToken not updating token");
    }
  });
};
// END OF CUSTOM GLOBALMEET

class CustomPexRTC extends PexRTC {
  constructor() {
    super();
  }

  // private functions
  // #getToken() {
  //   this.token = localStorage.getItem("token");
  //   this.onLog("PexRTC.refreshToken updated token -- Custom.js");
  // }

  // overidden functions
  // requestToken(cb) {
  //   this.#getToken();
  //   cb();
  //   this.onLog("PexRTC.requestToken -- Custom.js");
  // }

  // refreshToken() {
  //   let old_token = this.token;
  //   this.#getToken();

  //   if (old_token == this.token)
  //     this.onLog("PexRTC.refreshToken not updating token -- Custom.js");
  // }

  refreshToken() {
    var self = this;

    var old_token = self.token;
    self.sendRequest("refresh_token", null, function (e) {
      self.onLog("PexRTC.refreshToken response", e.target.responseText);
      if (self.state != "DISCONNECTING" && self.state != "IDLE") {
        var msg = {};
        try {
          msg = JSON.parse(e.target.responseText);
        } catch (error) {
          msg.reason = e.target.status + " " + e.target.statusText;
        }
        if (e.target.status == 200) {
          self.token = msg.result.token;
          if (msg.result.role != self.role) {
            self.onLog(
              "Role has changed from",
              self.role,
              "to",
              msg.result.role
            );
            self.role = msg.result.role;
            if (self.onRoleUpdate) {
              self.onRoleUpdate(self.role);
            }
            self.getParticipants(function (e2) {
              if (e2.target.status == 200) {
                var msg2 = JSON.parse(e2.target.responseText);
                for (var i = 0; i < msg2.result.length; i++) {
                  var participant = msg2.result[i];
                  self.rosterList[participant.uuid] = participant;
                  self.onParticipantUpdate(participant);
                }
              }
            });
          }

          // Custom postMessage
          bc.postMessage({
            event: "token_refresh",
            info: JSON.parse(JSON.stringify(self.token)),
          });
        } else if (old_token == self.token) {
          // Only error out if the token hasn't changed under us
          return self.handleError(msg.result || msg.reason);
        }
      } else {
        self.onLog("PexRTC.refreshToken not updating token");
      }
    });
  }

  createEventSource() {
    var self = this;

    if (!self.event_source && self.token) {
      self.event_source = new EventSource(
        "https://" +
          self.node +
          "/api/client/v2/conferences/" +
          self.conference_uri +
          "/events?token=" +
          self.token
      );
      self.event_source.addEventListener(
        "presentation_start",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("presentation_start", msg);
          msg.status = "start";
          if (
            self.presentation_msg.status != "start" ||
            self.presentation_msg.presenter_uuid != msg.presenter_uuid
          ) {
            self.processPresentation(msg);
          }
          self.presentation_msg = msg;
        },
        false
      );
      self.event_source.addEventListener(
        "presentation_stop",
        function (e) {
          var msg = { status: "stop" };
          self.onLog("presentation_stop", msg);
          if (self.presentation_msg.status != "stop") {
            self.processPresentation(msg);
          }
          self.presentation_msg = msg;
        },
        false
      );
      self.event_source.addEventListener(
        "presentation_frame",
        function (e) {
          self.presentation_event_id = e.lastEventId;
          if (self.onPresentationReload && !self.onHold) {
            self.onPresentationReload(self.getPresentationURL());
          }
        },
        false
      );
      self.event_source.addEventListener(
        "participant_create",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("participant_create", msg);
          self.rosterList[msg.uuid] = msg;
          if (
            msg.uuid == self.uuid &&
            self.current_service_type &&
            msg.service_type
          ) {
            self.current_service_type = msg.service_type;
          }
          if (!self.oldRosterList) {
            if (self.onParticipantCreate) {
              self.onParticipantCreate(msg);
            }
            if (self.onRosterList) {
              self.onRosterList(self.getRosterList());
            }
          }
        },
        false
      );
      self.event_source.addEventListener(
        "participant_update",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("participant_update", msg);
          self.rosterList[msg.uuid] = msg;
          if (
            msg.uuid == self.uuid &&
            self.current_service_type &&
            msg.service_type
          ) {
            self.current_service_type = msg.service_type;
          }
          if (!self.oldRosterList) {
            if (self.onParticipantUpdate) {
              self.onParticipantUpdate(msg);
            }
            if (self.onRosterList) {
              self.onRosterList(self.getRosterList());
            }
          }

          // // Custom postMessage
          // bc.postMessage({
          //   event: "participants",
          //   info: JSON.parse(JSON.stringify(self.rosterList)),
          // });
        },
        false
      );
      self.event_source.addEventListener(
        "participant_delete",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("participant_delete", msg);
          delete self.rosterList[msg.uuid];
          if (!self.oldRosterList) {
            if (self.onParticipantDelete) {
              self.onParticipantDelete(msg);
            }
            if (self.onRosterList) {
              self.onRosterList(self.getRosterList());
            }
          }
        },
        false
      );
      self.event_source.addEventListener(
        "peer_disconnect",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("peer_disconnect", msg);
          if (self.call && self.call.call_uuid) {
            self.call.disconnect(function () {
              if (self.state != "DISCONNECTING") {
                self.call.connect();
              }
            }, true);
          }
        },
        false
      );
      self.event_source.addEventListener(
        "message_received",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("message_received", msg);
          if (
            msg.type.split(";")[0] == "text/plain" &&
            !msg.direct &&
            self.onChatMessage
          ) {
            self.onChatMessage(msg);
          } else if (
            msg.type.split(";")[0] == "text/plain" &&
            msg.direct &&
            self.onDirectMessage
          ) {
            self.onDirectMessage(msg);
          } else if (self.onApplicationMessage) {
            self.onApplicationMessage(msg);
          }
        },
        false
      );
      self.event_source.addEventListener(
        "participant_sync_begin",
        function (e) {
          self.onLog("participant_sync_begin");
          if (!self.oldRosterList) {
            self.oldRosterList = self.rosterList;
          }
          self.rosterList = {};
          if (self.onSyncBegin) {
            self.onSyncBegin();
          }
        },
        false
      );
      self.event_source.addEventListener(
        "participant_sync_end",
        function (e) {
          self.onLog("participant_sync_end", self.rosterList);
          for (var uuid in self.rosterList) {
            if (!(uuid in self.oldRosterList) && self.onParticipantCreate) {
              self.onParticipantCreate(self.rosterList[uuid]);
            } else {
              if (self.onParticipantUpdate) {
                self.onParticipantUpdate(self.rosterList[uuid]);
              }
              delete self.oldRosterList[uuid];
            }
          }
          if (self.onParticipantDelete) {
            for (uuid in self.oldRosterList) {
              var msg = { uuid: uuid };
              self.onParticipantDelete(msg);
            }
          }
          delete self.oldRosterList;
          if (self.onRosterList) {
            self.onRosterList(self.getRosterList());
          }
          if (self.onSyncEnd) {
            self.onSyncEnd();
          }
        },
        false
      );
      self.event_source.addEventListener(
        "call_disconnected",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("call_disconnected", msg);
        },
        false
      );
      self.event_source.addEventListener(
        "disconnect",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("disconnect", msg);
          var reason = self.trans.ERROR_DISCONNECTED;
          if ("reason" in msg) {
            reason = msg.reason;
          }
          if (self.state != "DISCONNECTING") {
            self.disconnect();
            if (self.onDisconnect) {
              self.onDisconnect(reason);
            }
          }
        },
        false
      );
      self.event_source.addEventListener(
        "conference_update",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("conference_update", msg);
          self.processConferenceUpdate(msg);
        },
        false
      );
      self.event_source.addEventListener(
        "refer",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("refer", msg);
          self.processRefer(msg);
        },
        false
      );
      self.event_source.addEventListener(
        "on_hold",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("call_hold", msg);
          self.holdresume(msg.setting);
        },
        false
      );
      self.event_source.addEventListener(
        "stage",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("stage", msg);
          if (self.onStageUpdate) {
            self.onStageUpdate(msg);
          }
        },
        false
      );
      self.event_source.addEventListener(
        "layout",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("layout", msg);
          if (self.onLayoutUpdate) {
            self.onLayoutUpdate(msg);
          }
        },
        false
      );
      self.event_source.addEventListener(
        "fecc",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("fecc", msg);
          if (self.onFECC && self.fecc_supported) {
            self.onFECC(msg);
          }
        },
        false
      );
      self.event_source.addEventListener(
        "refresh_token",
        function (e) {
          self.onLog("refresh_token");
          self.refreshToken();
        },
        false
      );
      self.event_source.addEventListener(
        "new_offer",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("new_offer", msg);
          self.call.receiveOffer(msg.sdp);
        },
        false
      );
      self.event_source.addEventListener(
        "update_sdp",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("update_sdp", msg);
          self.call.receiveOffer(msg.sdp);
        },
        false
      );
      self.event_source.addEventListener(
        "new_candidate",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("new_candidate", msg);
          if (self.call) {
            self.call.receiveCandidate(msg);
          }
        },
        false
      );
      self.event_source.addEventListener(
        "splash_screen",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("splash_screen", msg);
          if (self.onSplashScreen) {
            if (msg == null) {
              self.onSplashScreen();
            } else {
              var screen_key = msg.screen_key;
              var theme_spec = self.call.client_ivr_theme[screen_key];
              var background_uri =
                "https://" +
                self.node +
                "/api/client/v2/conferences/" +
                self.conference_uri +
                "/theme/" +
                theme_spec.background.path +
                "?token=" +
                self.token;
              var display_duration = msg.display_duration;
              self.onSplashScreen({
                text: theme_spec.elements[0].text,
                background: background_uri,
                screen_key: screen_key,
                display_duration: display_duration,
              });
            }
          }
        },
        false
      );
      self.event_source.addEventListener(
        "live_captions",
        function (e) {
          var msg = JSON.parse(e.data);
          if (self.onLiveCaptions) {
            self.onLiveCaptions(msg);
          }
        },
        false
      );
      self.event_source.addEventListener(
        "breakout_begin",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("breakout_begin", msg);
          self.breakout_map[msg.breakout_uuid] = msg.participant_uuid;
        },
        false
      );
      self.event_source.addEventListener(
        "breakout_end",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("breakout_end", msg);
          delete self.breakout_map[msg.breakout_uuid];
          if (self.onBreakoutEnd) {
            self.onBreakoutEnd(msg.breakout_uuid);
          }
        },
        false
      );
      self.event_source.addEventListener(
        "breakout_refer",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("breakout_refer", msg);
          self.moveToBreakout(msg.breakout_uuid, msg.breakout_name);
        },
        false
      );
      self.event_source.addEventListener(
        "breakout_event",
        function (e) {
          var msg = JSON.parse(e.data);
          self.onLog("breakout_event", msg);
          self.processBreakoutEvent(msg);
        },
        false
      );
      self.event_source.onopen = function (e) {
        self.onLog("event source open");
        self.event_source_timeout = 10;
      };
      self.event_source.onerror = function (e) {
        self.onLog("event source error", e);
        if (self.state != "DISCONNECTING") {
          self.onLog("reconnecting...");
          self.event_source.close();
          self.event_source = null;
          if (self.event_source_timeout > 15000) {
            self.error = "Error connecting to EventSource";
            return self.onError(self.trans.ERROR_CONNECTING);
          }
          setTimeout(function () {
            self.createEventSource();
          }, self.event_source_timeout);
          self.event_source_timeout += 1000;
        }
      };
    }
  }
}

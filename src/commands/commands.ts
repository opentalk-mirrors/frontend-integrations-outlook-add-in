/* global Office */

import i18n, { setLanguageOnOfficeReady } from "../i18n";
import { initializeApiClient } from "../api/apiService";
import { EventService } from "../services/EventService";
import { OPENTALK_EVENT_ID } from "../constants";
import { callbackAsPromise } from "../utils/OfficeHelpers";

// Helper to access CustomProperties easily
async function getCustomProperty(key: string): Promise<string | null> {
  const props = await callbackAsPromise<Office.CustomProperties>((cb) =>
    Office.context.mailbox.item.loadCustomPropertiesAsync(cb)
  );
  return props.get(key);
}

// Helper to show Outlook Notification Banner
function showNotification(
  key: string,
  text: string,
  type: Office.MailboxEnums.ItemNotificationMessageType = Office.MailboxEnums
    .ItemNotificationMessageType.InformationalMessage
) {
  Office.context.mailbox.item.notificationMessages.replaceAsync(key, {
    type,
    message: text,
    icon: "Icon.80x80",
    persistent: false,
  });
}

async function createMeeting(event: Office.AddinCommands.Event) {
  const t = i18n.t.bind(i18n);
  try {
    // 1. Initialize API (Auth & Storage)
    const client = await initializeApiClient();

    // 2. Initialize Translations
    await setLanguageOnOfficeReady();

    // 3. Instantiate service
    const eventService = new EventService(client);

    // 4. Check if meeting already exists
    const existingEventId = await getCustomProperty(OPENTALK_EVENT_ID);

    // 5. Define Defaults (Background mode has no UI switches)
    const defaultOptions = {
      waitingRoom: false,
      sharedFolder: false,
      showMeetingDetails: true,
    };

    if (existingEventId) {
      showNotification("opentalk-exists", t("outlook-existing-meeting", { ns: "dashboard" }));
    } else {
      await eventService.createMeeting(defaultOptions);
      showNotification(
        "opentalk-created",
        t("outlook-meeting-created", {
          ns: "dashboard",
        })
      );
    }
  } catch (error) {
    showNotification(
      "outlook-meeting-creation-error",
      t("outlook-meeting-creation-error", { ns: "dashboard" })
    );
    console.error("Error in command:", error);
  } finally {
    event.completed();
  }
}

// Office Runtime Registration
if (typeof Office !== "undefined") {
  Office.initialize = () => {
    Office.actions?.associate?.("createMeeting", createMeeting);
  };
}

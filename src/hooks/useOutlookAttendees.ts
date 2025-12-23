import { useState, useCallback, useEffect } from "react";
import { callbackAsPromise } from "../utils/OfficeHelpers";

// Helper to normalize emails consistently
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const useOutlookAttendees = (eventId: string | undefined) => {
  const [outlookInviteOrder, setOutlookInviteOrder] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // The logic to actually read data from the Office context
  const updateOutlookRecipients = useCallback((emails: string[]) => {
    const normalized = emails.map(normalizeEmail).filter(Boolean);
    setOutlookInviteOrder(normalized);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!eventId) {
      setOutlookInviteOrder([]);
      setHasLoaded(false);
      return () => {
        isMounted = false;
      };
    }

    const loadInviteOrder = async () => {
      try {
        const item = Office.context.mailbox.item;
        if (item?.itemType !== Office.MailboxEnums.ItemType.Appointment) {
          return;
        }

        const [required, optional] = await Promise.all([
          callbackAsPromise<Office.EmailAddressDetails[]>(item.requiredAttendees.getAsync),
          callbackAsPromise<Office.EmailAddressDetails[]>(item.optionalAttendees.getAsync),
        ]);

        if (!isMounted) return;

        const emails = [...required, ...optional]
          .map((attendee) => attendee.emailAddress)
          .filter((email): email is string => !!email);

        updateOutlookRecipients(emails);
      } catch (error) {
        console.error("Unable to read Outlook invitee order: ", error);
      }
    };

    // Initial load
    loadInviteOrder();

    // Setup Event Listeners
    const item = Office.context.mailbox.item;
    const handleRecipientsChanged = () => void loadInviteOrder();

    const supportsRecipientsChanged =
      Office.context.requirements?.isSetSupported?.("Mailbox", "1.7") ?? false;

    let refreshIntervalId: number | undefined;

    if (supportsRecipientsChanged && item?.addHandlerAsync) {
      item.addHandlerAsync(
        Office.EventType.RecipientsChanged,
        handleRecipientsChanged,
        (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            console.error("Handler error: ", result.error);
          }
        }
      );
    } else {
      // Fallback polling
      refreshIntervalId = window.setInterval(loadInviteOrder, 3000);
    }

    return () => {
      isMounted = false;
      if (supportsRecipientsChanged && item?.removeHandlerAsync) {
        item.removeHandlerAsync(Office.EventType.RecipientsChanged, handleRecipientsChanged);
      }
      if (refreshIntervalId !== undefined) {
        window.clearInterval(refreshIntervalId);
      }
    };
  }, [eventId, updateOutlookRecipients]);

  return { outlookInviteOrder, hasLoadedOutlookRecipients: hasLoaded };
};

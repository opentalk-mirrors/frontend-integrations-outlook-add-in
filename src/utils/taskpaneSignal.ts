import { OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY } from "../constants";

interface OfficeRuntimeStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface OfficeRuntimeGlobal {
  storage?: OfficeRuntimeStorage;
}

declare const OfficeRuntime: OfficeRuntimeGlobal | undefined;

// We first try to use OfficeRuntime.storage for FAT-Clients that support: "Mailbox requirement set >=1.10", and as an fallback we use the localStorage.
// Important: In Outlook, support is only available with the event-based activation feature implemented in Outlook on Windows. This interface isn't supported in Outlook on Mac or on the web.
// See more under: https://learn.microsoft.com/en-us/javascript/api/office-runtime/officeruntime.storage
export async function setTaskpaneCloseSignal(): Promise<void> {
  const value = Date.now().toString();

  if (OfficeRuntime?.storage) {
    try {
      await OfficeRuntime.storage.setItem(OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY, value);
      return;
    } catch (error) {
      console.warn("Unable to signal taskpane close via OfficeRuntime.storage:", error);
    }
  }

  try {
    localStorage.setItem(OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY, value);
  } catch (error) {
    console.warn("Unable to signal taskpane close via localStorage:", error);
  }
}

export async function consumeTaskpaneCloseSignal(): Promise<boolean> {
  if (OfficeRuntime?.storage) {
    try {
      const signal = await OfficeRuntime.storage.getItem(OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY);
      if (!signal) {
        return false;
      }
      await OfficeRuntime.storage.removeItem(OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY);
      return true;
    } catch (error) {
      console.warn("Unable to read taskpane close signal via OfficeRuntime.storage:", error);
    }
  }

  try {
    const signal = localStorage.getItem(OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY);
    if (!signal) {
      return false;
    }
    localStorage.removeItem(OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY);
    return true;
  } catch (error) {
    console.warn("Unable to read taskpane close signal via localStorage:", error);
  }

  return false;
}

export async function clearTaskpaneCloseSignal(): Promise<void> {
  if (OfficeRuntime?.storage) {
    try {
      await OfficeRuntime.storage.removeItem(OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY);
      return;
    } catch (error) {
      console.warn("Unable to clear taskpane close signal via OfficeRuntime.storage:", error);
    }
  }

  try {
    localStorage.removeItem(OPENTALK_CLOSE_TASKPANE_SIGNAL_KEY);
  } catch (error) {
    console.warn("Unable to clear taskpane close signal via localStorage:", error);
  }
}

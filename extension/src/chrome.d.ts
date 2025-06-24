declare namespace chrome.tabs {
  interface Tab {
    id?: number;
    url?: string;
    title?: string;
  }
  
  interface QueryInfo {
    active: boolean;
    currentWindow: boolean;
  }
}

declare namespace chrome.runtime {
  interface MessageSender {
    tab?: chrome.tabs.Tab;
    frameId?: number;
    id?: string;
  }

  interface RuntimeMessage {
    action: string;
    data?: any;
  }
}

declare namespace chrome {
  export namespace runtime {
    export function onMessage(
      message: chrome.runtime.RuntimeMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ): void;
    
    export const onInstalled: {
      addListener(callback: () => void): void;
    };

    export const onMessage: {
      addListener(
        callback: (
          message: chrome.runtime.RuntimeMessage,
          sender: chrome.runtime.MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
    };

    export function sendMessage(
      message: chrome.runtime.RuntimeMessage,
      responseCallback?: (response: any) => void
    ): void;
  }

  export namespace tabs {
    export function query(
      queryInfo: chrome.tabs.QueryInfo,
      callback?: (result: chrome.tabs.Tab[]) => void
    ): Promise<chrome.tabs.Tab[]>;

    export function sendMessage(
      tabId: number,
      message: any,
      responseCallback?: (response: any) => void
    ): void;
  }

  export namespace action {
    export const onClicked: {
      addListener(callback: (tab: chrome.tabs.Tab) => void): void;
    };

    export function setPopup(details: {
      tabId?: number;
      popup: string;
    }): void;
  }

  export namespace sidePanel {
    export function open(options: { tabId: number }): Promise<void>;
  }
}

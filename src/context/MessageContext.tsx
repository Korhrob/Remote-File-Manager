'use client';

import React, { createContext, useContext, useState, useRef } from "react";

export interface MsgContext {
	refreshKey: number;
  target: string;
	onError: (message: string) => void;
	onSuccess: (message: string)  => void;
}

interface MessageContextType {
  showMessage: (msg: string, type: "success" | "error" | "notice") => void;
  showError: (msg: string) => void;
  showSuccess: (msg: string) => void;
  showNotice: (msg: string) => void;
  message: string | null;
  messageType: "success" | "error" | "notice" | null;
  visible: boolean;
}

const MessageContext = createContext<MessageContextType | null>(null);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "notice" | null>(null);
  const [visible, setVisible] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = (msg: string, type: "success" | "error" | "notice") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    setMessage(msg);
    setMessageType(type);

    setTimeout(() => {
      setVisible(true);
    }, 10);

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      hideTimeoutRef.current = setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 400);
    }, 3600);
  };

  // Helper methods
  const showError = (msg: string) => showMessage(msg, "error");
  const showSuccess = (msg: string) => showMessage(msg, "success");
  const showNotice = (msg: string) => showMessage(msg, "notice");

  return (
    <MessageContext.Provider
      value={{
        showMessage,
        showError,
        showSuccess,
        showNotice,
        message,
        messageType,
        visible
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

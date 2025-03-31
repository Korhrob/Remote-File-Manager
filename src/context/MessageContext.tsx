// context/MessageContext.tsx

import React, { createContext, useContext } from "react";

// Define the type for the context
interface MessageContextType {
  showMessage: (msg: string, type: "success" | "error") => void;
}

// Create a context with a default value of `null`
const MessageContext = createContext<MessageContextType | null>(null);

// Custom hook to use the MessageContext
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

// MessageProvider component to wrap around the app
interface MessageProviderProps {
  children: React.ReactNode;
  value: MessageContextType; // Ensure value prop is typed properly
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children, value }) => {
  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

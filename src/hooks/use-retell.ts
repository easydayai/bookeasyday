import { useState, useCallback, useRef, useEffect } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { supabase } from "@/integrations/supabase/client";

interface UseRetellOptions {
  agentId: string;
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onError?: (error: Error) => void;
  onAgentStartTalking?: () => void;
  onAgentStopTalking?: () => void;
}

export function useRetell({
  agentId,
  onCallStarted,
  onCallEnded,
  onError,
  onAgentStartTalking,
  onAgentStopTalking,
}: UseRetellOptions) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const retellClientRef = useRef<RetellWebClient | null>(null);
  const callbacksRef = useRef({ onCallStarted, onCallEnded, onError, onAgentStartTalking, onAgentStopTalking });

  // Keep callbacks up to date without re-registering events
  useEffect(() => {
    callbacksRef.current = { onCallStarted, onCallEnded, onError, onAgentStartTalking, onAgentStopTalking };
  }, [onCallStarted, onCallEnded, onError, onAgentStartTalking, onAgentStopTalking]);

  useEffect(() => {
    // Initialize the Retell client once
    const client = new RetellWebClient();
    retellClientRef.current = client;

    client.on("call_started", () => {
      console.log("Retell call started");
      setIsCallActive(true);
      setIsConnecting(false);
      callbacksRef.current.onCallStarted?.();
    });

    client.on("call_ended", () => {
      console.log("Retell call ended");
      setIsCallActive(false);
      setIsSpeaking(false);
      callbacksRef.current.onCallEnded?.();
    });

    client.on("agent_start_talking", () => {
      setIsSpeaking(true);
      callbacksRef.current.onAgentStartTalking?.();
    });

    client.on("agent_stop_talking", () => {
      setIsSpeaking(false);
      callbacksRef.current.onAgentStopTalking?.();
    });

    client.on("error", (error) => {
      console.error("Retell error:", error);
      setIsCallActive(false);
      setIsConnecting(false);
      callbacksRef.current.onError?.(new Error(String(error)));
    });

    return () => {
      client.stopCall();
    };
  }, []);

  const startCall = useCallback(async () => {
    if (!retellClientRef.current || isCallActive || isConnecting) return;

    setIsConnecting(true);

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted");

      // Get access token from edge function
      const { data, error } = await supabase.functions.invoke("retell-token", {
        body: { agentId },
      });

      if (error) throw error;
      if (!data?.accessToken) throw new Error("No access token received");

      console.log("Starting Retell call with access token");

      await retellClientRef.current.startCall({
        accessToken: data.accessToken,
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setIsConnecting(false);
      
      // Handle specific error types
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        callbacksRef.current.onError?.(new Error("Microphone access denied. Please allow microphone permission."));
      } else {
        callbacksRef.current.onError?.(error instanceof Error ? error : new Error("Failed to start call"));
      }
    }
  }, [agentId, isCallActive, isConnecting]);

  const endCall = useCallback(() => {
    if (retellClientRef.current && isCallActive) {
      retellClientRef.current.stopCall();
    }
  }, [isCallActive]);

  return {
    isCallActive,
    isConnecting,
    isSpeaking,
    startCall,
    endCall,
  };
}

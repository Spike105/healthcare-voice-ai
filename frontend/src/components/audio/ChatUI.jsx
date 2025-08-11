
"use client";

import React, { useState, useRef } from "react";
import AIAvatar3D from "./AIAvatar3D";

export default function ChatUI() {
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(new Audio());

  // Example: simulate calling backend chat API
  async function fetchChatResponse(message) {
    // Replace this with your real API call to /api/chat
    return new Promise((res) => {
      setTimeout(() => res({ reply: `You said: "${message}"` }), 700);
    });
  }

  // Example: simulate calling TTS API returning a speech audio URL
  async function fetchTTSAudio(text) {
    // Replace with your real API call to /api/speak that returns TTS audio URL
    // Here we use a dummy public URL as example:
    return new Promise((res) => {
      setTimeout(() => res("https://cdn.pixabay.com/download/audio/2021/09/04/audio_03e43ea6be.mp3?filename=calm-ambient-11047.mp3"), 500);
    });
  }

  async function handleSend() {
    if (!inputText.trim()) return;

    setChatLog((prev) => [...prev, { from: "user", text: inputText }]);

    // Get chat response
    const chatResponse = await fetchChatResponse(inputText);
    setChatLog((prev) => [...prev, { from: "bot", text: chatResponse.reply }]);

    // Get TTS audio URL for the bot reply
    const ttsUrl = await fetchTTSAudio(chatResponse.reply);

    // Play TTS audio
    audioRef.current.src = ttsUrl;
    audioRef.current.crossOrigin = "anonymous"; // needed for analyser
    audioRef.current.play();

    setIsSpeaking(true);
  }

  // Track speaking state
  audioRef.current.onended = () => setIsSpeaking(false);
  audioRef.current.onplay = () => setIsSpeaking(true);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Chat with AI Avatar</h2>

      <div
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          background: "#f9f9f9",
        }}
      >
        {chatLog.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.from === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <b>{msg.from === "user" ? "You" : "AI"}:</b> {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        placeholder="Type your message..."
        style={{ width: "100%", padding: 10, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }}
      />

      <button
        onClick={handleSend}
        disabled={!inputText.trim() || isSpeaking}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          fontSize: 16,
          borderRadius: 6,
          cursor: isSpeaking ? "not-allowed" : "pointer",
        }}
      >
        {isSpeaking ? "Speaking..." : "Send"}
      </button>

      <div style={{ marginTop: 30 }}>
        <AIAvatar3D audioElement={audioRef.current} modelPath="/avatar.glb" />
      </div>
    </div>
  );
}

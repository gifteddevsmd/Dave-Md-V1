// pages/index.js

import { useState } from "react";

export default function Home() {
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCode("");

    try {
      const res = await fetch("/api/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });

      const data = await res.json();
      if (data.code) {
        setCode(data.code);
      } else {
        alert(data.error || "Failed to get code");
      }
    } catch (err) {
      alert("An error occurred");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 30 }}>
      <h1>Get Your WhatsApp Pair Code</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter WhatsApp number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Get Code"}
        </button>
      </form>

      {code && (
        <div style={{ marginTop: 20 }}>
          <h2>Pair Code:</h2>
          <code>{code}</code>
        </div>
      )}
    </main>
  );
      }

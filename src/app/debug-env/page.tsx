export default function DebugEnvPage() {
  const hasKey = !!process.env.ALPHA_VANTAGE_API_KEY;

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Environment Debug</h1>
      <p>
        <strong>ALPHA_VANTAGE_API_KEY:</strong>{" "}
        <span style={{ color: hasKey ? "green" : "red" }}>
          {hasKey ? "SET (truthy)" : "NOT SET (falsy)"}
        </span>
      </p>
      {hasKey && (
        <p>
          Key preview: {process.env.ALPHA_VANTAGE_API_KEY!.slice(0, 4)}...
        </p>
      )}
    </div>
  );
}

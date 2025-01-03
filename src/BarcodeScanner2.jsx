import { useEffect, useRef, useState } from "react";
import Quagga from "@ericblade/quagga2";

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  const startScanning = () => {
    setError("");
    setResult("");

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          willReadFrequently: true,

          target: videoRef.current, // Attach the video element
          constraints: {
            facingMode: "environment", // Use the back camera
            // width: { ideal: 1920 }, // Higher resolution for better accuracy
            // height: { ideal: 1080 },
            focusMode: "continuous",
          },
        },
        decoder: {
          readers: [
            "ean_reader", // Support EAN barcodes
          ], // Support EAN barcodes
        },
        locate: true, // Enable barcode localization
      },
      (err) => {
        if (err) {
          console.error("Quagga initialization failed:", err);
          setError("Failed to initialize scanner. Please check permissions.");
          return;
        }
        Quagga.start();
        setScanning(true);
      }
    );

    Quagga.onDetected((data) => {
      if (data && data.codeResult) {
        setResult(data.codeResult.code);
        stopScanning(); // Stop scanning after successful detection
      }
    });
  };

  const stopScanning = () => {
    Quagga.stop();
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      Quagga.stop(); // Ensure cleanup on component unmount
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        padding: "1rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Barcode Scanner
      </h2>
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          backgroundColor: "#f3f4f6",
          borderRadius: "0.5rem",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <div
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        />
        {!scanning && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              fontSize: "1.25rem",
              fontWeight: "bold",
              zIndex: 10,
            }}
          >
            Camera Off
          </div>
        )}
      </div>

      <button
        onClick={scanning ? stopScanning : startScanning}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: scanning ? "#ef4444" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        {scanning ? "Stop Scanning" : "Start Scanning"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#ecfdf5",
            border: "1px solid #10b981",
            borderRadius: "0.375rem",
          }}
        >
          <h3
            style={{
              color: "#059669",
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            Detected Barcode
          </h3>
          <p
            style={{
              color: "#047857",
              margin: 0,
            }}
          >
            {result}
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "0.375rem",
          }}
        >
          <h3
            style={{
              color: "#dc2626",
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            Error
          </h3>
          <p
            style={{
              color: "#b91c1c",
              margin: 0,
            }}
          >
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;

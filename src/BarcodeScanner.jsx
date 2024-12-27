import { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  NotFoundException,
} from "@zxing/library";

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    // Initialize ZXing reader with formats
    const formats = [BarcodeFormat.EAN_13];
    readerRef.current = new BrowserMultiFormatReader(undefined, formats);

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError("");
      setResult("");

      if (!readerRef.current) {
        throw new Error("Barcode reader not initialized");
      }

      await readerRef.current.decodeFromConstraints(
        {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        videoRef.current,
        (result, err) => {
          // Only handle successful scans and unexpected errors
          if (result) {
            const text = result.getText();
            setResult(text);
            // Stop scanning after successful detection
            stopScanning();
            // Play success sound
            const beep = new Audio(
              "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLXrO8tiJNwgZXrfz552mNwcFS6fo9blRMAcAOZHe+OTDXywHAChwx/Hp2pg9BwAZVrDt+OzihEYIABA+nOv89/bGXg8AACtiwfL//fzWdxkAAB1NqPH////vkysAABQ4lun4///+8l4IAAo2meX2/v/+/n4VBwAhQaLZ/f7+/v+hMwsADiuR3vb//f7+/v+QPw8AFDmW2ff//v3///+uTRIAAyN/0vX//v7////GXxkA"
            );
            beep.play().catch(() => {});
          } else if (err && !(err instanceof NotFoundException)) {
            // Only log non-NotFoundException errors
            console.error("Unexpected scanning error:", err);
            setError("An unexpected error occurred while scanning");
            stopScanning();
          }
        }
      );

      setScanning(true);
    } catch (err) {
      setError(
        "Failed to access camera. Please make sure you have granted camera permissions."
      );
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
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
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            EAN-13 Barcode Scanner
          </h2>
          <button
            onClick={scanning ? stopScanning : startScanning}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: scanning ? "#ef4444" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
          >
            <Camera size={16} />
            {scanning ? "Stop Scanning" : "Start Scanning"}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "0.375rem",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                color: "#dc2626",
                margin: "0 0 0.5rem 0",
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

        <div
          style={{
            position: "relative",
            aspectRatio: "16/9",
            backgroundColor: "#f3f4f6",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {scanning && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2px solid #3b82f6",
                animation: "pulse 2s infinite",
              }}
            />
          )}
        </div>

        {result && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#ecfdf5",
              border: "1px solid #10b981",
              borderRadius: "0.375rem",
              marginTop: "1rem",
            }}
          >
            <h3
              style={{
                color: "#059669",
                margin: "0 0 0.5rem 0",
              }}
            >
              Barcode Detected
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
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default BarcodeScanner;

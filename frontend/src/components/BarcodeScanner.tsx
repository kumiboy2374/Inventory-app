import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onScan }: { onScan: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef(new BrowserMultiFormatReader());
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const reader = readerRef.current;

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        if (devices.length > 0 && videoRef.current) {
          const deviceId = devices[0].deviceId;
          reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, error, controls) => {
            if (result) {
              onScan(result.getText());
            }
            // Store the MediaStream if needed via controls or the video element
            const stream = videoRef.current?.srcObject as MediaStream | null;
            if (stream && !streamRef.current) {
              streamRef.current = stream;
            }
          });
        }
      })
      .catch((err) => console.error(err));

    return () => {
      // Stop the camera if it's still running
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      // Optionally stop decoding via controls if available
      // controls?.stop();
    };
  }, [onScan]);

  return <video ref={videoRef} style={{ width: "100%" }} />;
}

"use client";

import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({
  onScan,
  onClose,
  readerRef,
}: {
  onScan: (value: string) => void;
  onClose: () => void;
  readerRef: React.MutableRefObject<BrowserMultiFormatReader | null>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    let active = true;

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    const startScanner = async () => {
      try {
        if (!videoRef.current) return;

        // Detect if on mobile
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isMobile ? { exact: "environment" } : { exact: "user" },
          },
        });

        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (result && active) {
            onScan(result.getText());
            active = false;
            stopCamera();
            BrowserMultiFormatReader.releaseAllStreams();
            onClose();
          }
        });
      } catch (err) {
        console.error("Failed to access camera:", err);
      }
    };

    startScanner();

    return () => {
      active = false;
      stopCamera();
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, [onScan, onClose, readerRef]);

  return <video ref={videoRef} style={{ width: "100%" }} autoPlay />;
}

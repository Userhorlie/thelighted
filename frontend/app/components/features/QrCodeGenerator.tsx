// frontend/src/components/features/QrCodeGenerator.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Download, Share2, Printer, Check, Copy } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RESTAURANT_INFO } from "@/lib/constants";

export const QRCodeGenerator: React.FC = () => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [menuUrl, setMenuUrl] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [logoError, setLogoError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Mark as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Convert logo to base64 data URL with better error handling
  useEffect(() => {
    if (!isClient) return;

    const convertLogoToDataUrl = async () => {
      try {
        // Use absolute URL for production compatibility
        const logoUrl = new URL("/logo.png", window.location.origin).href;
        const response = await fetch(logoUrl, {
          cache: "force-cache",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch logo: ${response.status}`);
        }

        const blob = await response.blob();

        // Verify it's actually an image
        if (!blob.type.startsWith("image/")) {
          throw new Error("Fetched file is not an image");
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === "string") {
            setLogoDataUrl(reader.result);
          } else {
            setLogoError(true);
          }
        };
        reader.onerror = () => {
          console.error("FileReader error");
          setLogoError(true);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error loading logo:", error);
        setLogoError(true);
      }
    };

    convertLogoToDataUrl();
  }, [isClient]);

  // Set menuUrl only on client-side after hydration
  useEffect(() => {
    if (isClient) {
      setMenuUrl(`${window.location.origin}/menu`);
    }
  }, [isClient]);

  const handleDownload = async () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      // Create a promise-based approach for reliable loading
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Use higher resolution for better quality
          const scale = 2;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx?.scale(scale, scale);
          ctx?.drawImage(img, 0, 0);

          const pngFile = canvas.toDataURL("image/png", 1.0);
          const downloadLink = document.createElement("a");
          downloadLink.download = `${RESTAURANT_INFO.name
            .replace(/\s+/g, "-")
            .toLowerCase()}-menu-qr-code.png`;
          downloadLink.href = pngFile;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          resolve();
        };

        img.onerror = () => {
          reject(new Error("Failed to load SVG as image"));
        };

        // Properly encode SVG for cross-browser compatibility
        const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
        img.src = `data:image/svg+xml;base64,${svgBase64}`;
      });
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download QR code. Please try again.");
    }
  };

  const handlePrint = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    // Create print content in a new window
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      alert("Please allow pop-ups to print the QR code.");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Menu QR Code - ${RESTAURANT_INFO.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
              background: white;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 2px dashed #D97706;
              border-radius: 16px;
              max-width: 400px;
            }
            h1 {
              color: #1F2937;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .subtitle {
              color: #78716C;
              margin-bottom: 30px;
              font-size: 16px;
            }
            .qr-code {
              margin: 0 auto 30px;
            }
            .qr-code svg {
              display: block;
              margin: 0 auto;
            }
            .instructions {
              color: #78716C;
              font-size: 14px;
              line-height: 1.5;
            }
            .url {
              font-family: monospace;
              color: #D97706;
              word-break: break-all;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${RESTAURANT_INFO.name}</h1>
            <p class="subtitle">Scan to view our digital menu</p>
            <div class="qr-code">
              ${svgData}
            </div>
            <p class="instructions">
              Point your camera at the QR code to open the menu<br><br>
              <span class="url">${menuUrl}</span>
            </p>
          </div>
          <script>
            // Wait for content to fully render before printing
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
            
            // Handle after print - don't auto-close, let user decide
            window.onafterprint = function() {
              // Optional: close after printing
              // window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleShare = async () => {
    await copyToClipboard();
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(menuUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = menuUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Last resort: show the URL in an alert
      alert(`Menu link: ${menuUrl}`);
    }
  };

  // Show loading state until menuUrl is ready
  if (!isClient || !menuUrl) {
    return (
      <Section id="qr-code" background="primary">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-text-muted">Loading QR code...</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section id="qr-code" background="primary">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-4"
            >
              Digital Menu QR Code
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-text-muted max-w-2xl mx-auto"
            >
              Download, print, or share this QR code to let customers easily
              access your menu
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="text-center">
              <div className="mb-8">
                <div
                  ref={qrRef}
                  className="inline-block p-8 bg-white rounded-xl shadow-inner"
                >
                  <QRCodeSVG
                    value={menuUrl}
                    size={256}
                    level="H"
                    includeMargin
                    // Only include logo if successfully loaded
                    {...(logoDataUrl && !logoError
                      ? {
                          imageSettings: {
                            src: logoDataUrl,
                            height: 50,
                            width: 50,
                            excavate: true,
                          },
                        }
                      : {})}
                  />
                </div>
                <p className="mt-4 text-sm text-text-muted">
                  Scan to view our menu at
                  <br />
                  <span className="font-mono text-primary">{menuUrl}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleDownload}
                  variant="primary"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PNG
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print QR Code
                </Button>
                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="lg"
                  className="flex items-center gap-2 text-[15px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Share Link
                    </>
                  )}
                </Button>
              </div>

              {/* Benefits */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">
                      Cost-Effective
                    </h4>
                    <p className="text-sm text-text-muted">
                      No more expensive menu reprints when prices or items
                      change
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">
                      Always Updated
                    </h4>
                    <p className="text-sm text-text-muted">
                      Menu updates appear instantly - no reprinting needed
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">
                      Contactless
                    </h4>
                    <p className="text-sm text-text-muted">
                      Customers can browse the menu safely from their phones
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

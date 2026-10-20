import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import AppButton from "@/components/AppButton";
import { COLORS } from "@/constants/colors";
import { registerAttendance } from "@/lib/attendance";
import { useAuth } from "@/lib/auth";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastData, setLastData] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const scanLock = useRef(false);
  const { user } = useAuth();

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    // Prevent multiple camera callbacks from processing the same scan.
    if (scanLock.current) return;

    scanLock.current = true;
    setScanned(true);
    setLastData(data);
    setMessage(null);
    setSuccess(false);
    setProcessing(true);

    try {
      // Never submit attendance without an authenticated user.
      if (!user?.id) {
        setMessage("Please sign in before recording attendance.");
        return;
      }

      const result = await registerAttendance(data, user.id);

      setMessage(result.message);
      setSuccess(result.success);
    } catch (error) {
      console.error("QR attendance scan failed:", error);

      setMessage("Something went wrong. Please try scanning again.");
      setSuccess(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleScanAgain = () => {
    // Release the lock only when the user explicitly retries.
    scanLock.current = false;
    setScanned(false);
    setLastData(null);
    setMessage(null);
    setSuccess(false);
    setProcessing(false);
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.permissionHint}>Preparing your scanner...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={38} color={COLORS.primary} />
        </View>

        <Text style={styles.permissionTitle}>Camera Permission Needed</Text>

        <Text style={styles.permissionSubtitle}>
          Allow camera access so CCTC Petal Pass can scan school event QR codes
          and record your attendance.
        </Text>

        <View style={styles.permissionButton}>
          <AppButton
            theme="primary"
            title="Grant Permission"
            icon="camera"
            onPress={requestPermission}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned || processing ? undefined : handleBarcodeScanned
        }
      />

      <View style={styles.topBar}>
        <View style={styles.brandBadge}>
          <Ionicons name="flower" size={19} color={COLORS.primary} />
        </View>

        <View style={styles.topBarText}>
          <Text style={styles.brandTitle}>CCTC Petal Pass</Text>
          <Text style={styles.brandSubtitle}>SCHOOL EVENT ATTENDANCE</Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            {processing ? "CHECKING" : scanned ? "PAUSED" : "READY"}
          </Text>
        </View>
      </View>

      {!scanned && (
        <View style={styles.scanGuide}>
          <Text style={styles.guideTitle}>Scan your event QR</Text>

          <Text style={styles.guideSubtitle}>
            Center the QR code inside the frame
          </Text>

          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={styles.scanLine} />
          </View>

          <View style={styles.guideHint}>
            <Ionicons name="sunny-outline" size={17} color="#FFFFFF" />
            <Text style={styles.guideHintText}>
              Keep the QR code clear and well lit
            </Text>
          </View>
        </View>
      )}

      <View style={styles.resultPanel}>
        <View style={styles.panelHandle} />

        {processing ? (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />

            <View style={styles.processingTextContainer}>
              <Text style={styles.panelTitle}>Checking attendance...</Text>
              <Text style={styles.panelSubtitle}>
                Please wait while your scan is processed.
              </Text>
            </View>
          </View>
        ) : scanned ? (
          <>
            <View
              style={[
                styles.resultIcon,
                success ? styles.successIcon : styles.errorIcon,
              ]}
            >
              <Ionicons
                name={
                  success ? "checkmark-circle-outline" : "alert-circle-outline"
                }
                size={29}
                color={success ? COLORS.success : COLORS.danger}
              />
            </View>

            <Text style={styles.panelTitle}>
              {success ? "Attendance Recorded" : "Scan Unsuccessful"}
            </Text>

            <Text
              style={[
                styles.resultMessage,
                success ? styles.successText : styles.errorText,
              ]}
            >
              {message || "Your QR code has been scanned."}
            </Text>

            {lastData !== null && (
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>SCANNED QR DATA</Text>

                <Text selectable style={styles.dataValue}>
                  {lastData}
                </Text>
              </View>
            )}

            <View style={styles.actionButton}>
              <AppButton
                theme="primary"
                title="Scan Again"
                icon="refresh"
                onPress={handleScanAgain}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.panelHeading}>
              <View style={styles.panelIcon}>
                <Ionicons
                  name="qr-code-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.panelHeadingText}>
                <Text style={styles.panelTitle}>Ready to scan</Text>
                <Text style={styles.panelSubtitle}>
                  Point your camera at an event QR code.
                </Text>
              </View>
            </View>

            <View style={styles.tipRow}>
              <Ionicons
                name="flower-outline"
                size={17}
                color={COLORS.primary}
              />
              <Text style={styles.tipText}>
                Your attendance will be checked automatically.
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#271720",
  },

  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  permissionIcon: {
    width: 82,
    height: 82,
    borderRadius: 27,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },

  permissionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },

  permissionHint: {
    marginTop: 13,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  permissionButton: {
    width: "100%",
  },

  topBar: {
    position: "absolute",
    top: 20,
    left: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    borderRadius: 20,
    backgroundColor: "rgba(255,245,248,0.96)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  brandBadge: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  topBarText: {
    flex: 1,
    gap: 3,
  },

  brandTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },

  brandSubtitle: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: COLORS.textSecondary,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  liveText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primary,
  },

  scanGuide: {
    position: "absolute",
    top: "20%",
    left: 22,
    right: 22,
    alignItems: "center",
  },

  guideTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 8,
    marginBottom: 6,
  },

  guideSubtitle: {
    color: "#FFF0F5",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
  },

  scannerFrame: {
    width: 245,
    height: 245,
    maxWidth: "85%",
    borderRadius: 28,
    position: "relative",
    backgroundColor: "rgba(252,229,237,0.06)",
  },

  corner: {
    position: "absolute",
    width: 43,
    height: 43,
    borderColor: "#FF8EB8",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 17,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 17,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 17,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 17,
  },

  scanLine: {
    position: "absolute",
    top: "49%",
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: "#FF8EB8",
    opacity: 0.85,
  },

  guideHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 23,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(45,22,34,0.72)",
  },

  guideHintText: {
    fontSize: 11,
    color: "#FFFFFF",
  },

  resultPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 27,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },

  panelHandle: {
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 3,
  },

  panelHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  panelIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  panelHeadingText: {
    flex: 1,
    gap: 4,
  },

  panelTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },

  panelSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  tipText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 9,
  },

  processingTextContainer: {
    flex: 1,
    gap: 4,
  },

  resultIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  successIcon: {
    backgroundColor: "#EAF5EF",
  },

  errorIcon: {
    backgroundColor: "#FFF0F3",
  },

  resultMessage: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  successText: {
    color: COLORS.success,
  },

  errorText: {
    color: COLORS.danger,
  },

  dataCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },

  dataLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: COLORS.textSecondary,
  },

  dataValue: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textPrimary,
  },

  actionButton: {
    marginTop: 2,
  },
});

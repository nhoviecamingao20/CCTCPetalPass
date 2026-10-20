import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
<<<<<<< HEAD
import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
=======
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
>>>>>>> origin/main

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
<<<<<<< HEAD

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
=======
  const { user } = useAuth();

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.permissionLoadingText}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={42} color={COLORS.primary} />
        </View>

        <Text style={styles.permissionTitle}>Camera Permission Needed</Text>

        <Text style={styles.permissionSubtitle}>
          QR-ATT needs access to your camera to scan school event QR codes and
          register your attendance.
        </Text>

        <View style={styles.permissionButton}>
          <AppButton
            theme="primary"
            title="Grant Camera Permission"
            icon="camera"
            onPress={requestPermission}
          />
        </View>

        <Text style={styles.permissionHint}>
          Your camera is used to scan QR codes for attendance.
        </Text>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);
    setLastData(data);
    setMessage(null);

    if (!user) {
      setMessage("You must be signed in to register attendance.");
      setSuccess(false);
      setProcessing(false);
      return;
    }

    try {
      const result = await registerAttendance(data, user.id);
      setMessage(result.message);
      setSuccess(result.success);
    } catch {
      setMessage(
        "We couldn't process this QR code. Please try scanning again.",
      );
>>>>>>> origin/main
      setSuccess(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleScanAgain = () => {
<<<<<<< HEAD
    // Release the lock only when the user explicitly retries.
    scanLock.current = false;
=======
>>>>>>> origin/main
    setScanned(false);
    setLastData(null);
    setMessage(null);
    setSuccess(false);
    setProcessing(false);
  };

<<<<<<< HEAD
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
=======
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.headingIcon}>
            <Ionicons name="qr-code-outline" size={25} color={COLORS.primary} />
          </View>

          <View style={styles.headingText}>
            <Text style={styles.pageTitle}>Scan QR Code</Text>
            <Text style={styles.pageSubtitle}>
              Record your school event attendance.
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.instructionText}>
            Position the event QR code inside the scanning frame and hold your
            camera steady.
          </Text>
        </View>

        <View style={styles.cameraCard}>
          <View style={styles.cameraHeader}>
            <View style={styles.cameraStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.cameraStatusText}>
                {scanned ? "Scan paused" : "Camera ready"}
              </Text>
            </View>

            <Ionicons name="scan-outline" size={22} color={COLORS.primary} />
          </View>

          <View style={styles.cameraFrame}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={
                scanned || processing ? undefined : handleBarcodeScanned
              }
            />

            {!scanned && (
              <View pointerEvents="none" style={styles.scanGuide}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                <View style={styles.scanLine} />
              </View>
            )}

            {scanned && (
              <View style={styles.cameraPausedOverlay}>
                <View style={styles.detectedIcon}>
                  <Ionicons
                    name="checkmark"
                    size={30}
                    color={COLORS.textOnPrimary}
                  />
                </View>
                <Text style={styles.detectedText}>QR Code Detected</Text>
              </View>
            )}
          </View>

          <View style={styles.cameraFooter}>
            <Ionicons name="scan" size={17} color={COLORS.primary} />
            <Text style={styles.cameraFooterText}>
              {scanned
                ? "Review your attendance result below."
                : "Align the QR code within the frame."}
            </Text>
          </View>
        </View>

        {scanned && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.resultIcon,
                  processing
                    ? styles.resultIconPending
                    : success
                      ? styles.resultIconSuccess
                      : styles.resultIconError,
                ]}
              >
                {processing ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons
                    name={success ? "checkmark-circle" : "alert-circle"}
                    size={25}
                    color={success ? COLORS.success : COLORS.danger}
                  />
                )}
              </View>

              <View style={styles.resultHeadingText}>
                <Text style={styles.resultTitle}>
                  {processing
                    ? "Registering Attendance"
                    : success
                      ? "Attendance Result"
                      : "Scan Unsuccessful"}
                </Text>

                <Text style={styles.resultSubtitle}>
                  {processing
                    ? "Please wait while we process your scan."
                    : success
                      ? "Your QR code has been processed."
                      : "Please check the details and try again if needed."}
                </Text>
              </View>
            </View>

            {message && !processing && (
              <View
                style={[
                  styles.messageBox,
                  success ? styles.successMessageBox : styles.errorMessageBox,
                ]}
              >
                <Text
                  style={[
                    styles.resultMessage,
                    success ? styles.successMessage : styles.errorMessage,
                  ]}
                >
                  {message}
>>>>>>> origin/main
                </Text>
              </View>
            )}

<<<<<<< HEAD
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
=======
            <Text style={styles.scannedLabel}>Scanned QR Data</Text>

            <View style={styles.dataBox}>
              <Ionicons
                name="qr-code-outline"
                size={19}
                color={COLORS.textSecondary}
              />
              <Text selectable style={styles.scanData}>
                {lastData}
              </Text>
            </View>

            {!processing && (
              <View style={styles.resultButton}>
                <AppButton
                  theme="primary"
                  title="Scan Another QR Code"
                  icon="refresh"
                  onPress={handleScanAgain}
                />
              </View>
            )}
          </View>
        )}

        <View style={styles.securityNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={21}
            color={COLORS.primary}
          />
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Attendance Protection</Text>
            <Text style={styles.securityText}>
              Attendance is registered using your signed-in account and
              validated by the existing attendance registration logic.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="checkmark-circle" size={15} color={COLORS.success} />
          <Text style={styles.footerText}>
            QR-ATT · Smart School Event Attendance
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
>>>>>>> origin/main
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: "#271720",
  },

  camera: {
    ...StyleSheet.absoluteFillObject,
=======
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
>>>>>>> origin/main
  },

  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
<<<<<<< HEAD
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
=======
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  permissionLoadingText: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  permissionIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: COLORS.primarySoft,
>>>>>>> origin/main
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  permissionTitle: {
<<<<<<< HEAD
    fontSize: 22,
    fontWeight: "900",
=======
    fontSize: 23,
    fontWeight: "800",
>>>>>>> origin/main
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },

  permissionSubtitle: {
<<<<<<< HEAD
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
=======
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
>>>>>>> origin/main
  },

  permissionButton: {
    width: "100%",
  },

<<<<<<< HEAD
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
=======
  permissionHint: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
  },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 20,
  },

  headingIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.primarySoft,
>>>>>>> origin/main
    alignItems: "center",
    justifyContent: "center",
  },

<<<<<<< HEAD
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
=======
  headingText: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 5,
  },

  pageSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    marginBottom: 20,
  },

  instructionIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },

  instructionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  cameraCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 23,
    padding: 13,
    marginBottom: 20,
  },

  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 13,
  },

  cameraStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  cameraStatusText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },

  cameraFrame: {
    width: "100%",
    aspectRatio: 0.95,
    maxHeight: 390,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: "#171322",
    position: "relative",
  },

  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  scanGuide: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
>>>>>>> origin/main
  },

  corner: {
    position: "absolute",
    width: 43,
    height: 43,
<<<<<<< HEAD
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
=======
    borderColor: "#C9B7FF",
    borderWidth: 4,
  },

  topLeft: {
    top: "24%",
    left: "12%",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },

  topRight: {
    top: "24%",
    right: "12%",
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },

  bottomLeft: {
    bottom: "24%",
    left: "12%",
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },

  bottomRight: {
    bottom: "24%",
    right: "12%",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
>>>>>>> origin/main
  },

  scanLine: {
    position: "absolute",
<<<<<<< HEAD
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
=======
    left: "17%",
    right: "17%",
    height: 2,
    backgroundColor: "#C9B7FF",
    opacity: 0.9,
  },

  cameraPausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 18, 42, 0.72)",
  },

  detectedIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  detectedText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textOnPrimary,
  },

  cameraFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 14,
    paddingBottom: 3,
  },

  cameraFooterText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  resultCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    padding: 17,
    marginBottom: 20,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },

  resultIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
>>>>>>> origin/main
    alignItems: "center",
    justifyContent: "center",
  },

<<<<<<< HEAD
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
=======
  resultIconPending: {
    backgroundColor: COLORS.primarySoft,
  },

  resultIconSuccess: {
    backgroundColor: COLORS.successBackground,
  },

  resultIconError: {
    backgroundColor: COLORS.dangerBackground,
  },

  resultHeadingText: {
    flex: 1,
  },

  resultTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 5,
  },

  resultSubtitle: {
>>>>>>> origin/main
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

<<<<<<< HEAD
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
=======
  messageBox: {
    borderRadius: 13,
    padding: 13,
    marginBottom: 16,
  },

  successMessageBox: {
    backgroundColor: COLORS.successBackground,
  },

  errorMessageBox: {
    backgroundColor: COLORS.dangerBackground,
>>>>>>> origin/main
  },

  resultMessage: {
    fontSize: 13,
    lineHeight: 20,
<<<<<<< HEAD
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
=======
    fontWeight: "600",
  },

  successMessage: {
    color: COLORS.success,
  },

  errorMessage: {
    color: COLORS.danger,
  },

  scannedLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  dataBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 15,
  },

  scanData: {
    flex: 1,
    fontSize: 11,
>>>>>>> origin/main
    lineHeight: 18,
    color: COLORS.textPrimary,
  },

<<<<<<< HEAD
  actionButton: {
    marginTop: 2,
  },
});
=======
  resultButton: {
    marginTop: 2,
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 16,
    padding: 15,
  },

  securityTextContainer: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 5,
  },

  securityText: {
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 22,
  },

  footerText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
>>>>>>> origin/main

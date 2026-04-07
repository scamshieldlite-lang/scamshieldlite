// apps/mobile/src/App.tsx

import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { ScanUsageProvider } from "@/context/ScanUsageContext";
import RootNavigator from "@/navigation/RootNavigator";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  "shadow* style props are deprecated",
]);

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ScanUsageProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </ScanUsageProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

// apps/mobile/src/App.tsx

import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { ScanUsageProvider } from "@/context/ScanUsageContext";
import RootNavigator from "@/navigation/RootNavigator";

export default function App() {
  return (
    <AuthProvider>
      <ScanUsageProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </ScanUsageProvider>
    </AuthProvider>
  );
}

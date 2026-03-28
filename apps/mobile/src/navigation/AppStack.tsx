import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import ScanResultScreen from "@/screens/scan/ScanResultScreen";
import type { ScanResponse } from "@scamshieldlite/shared/";

export type AppStackParamList = {
  MainTabs: undefined;
  ScanResult: {
    result: ScanResponse;
    originalText: string; // ← added — needed for report submission
  };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen
        name="ScanResult"
        component={ScanResultScreen}
        options={{
          presentation: "card",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}

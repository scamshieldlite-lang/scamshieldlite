import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AccountScreen from "@/screens/account/AccountScreen";
import PrivacyScreen from "@/screens/account/PrivacyScreen";

export type AccountStackParamList = {
  AccountHome: undefined;
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<AccountStackParamList>();

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountHome" component={AccountScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}

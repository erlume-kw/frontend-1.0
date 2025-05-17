import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Hello from "../Hello";

const Stack = createNativeStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Hello" component={Hello} />
    </Stack.Navigator>
  );
};

export default MainNavigation;

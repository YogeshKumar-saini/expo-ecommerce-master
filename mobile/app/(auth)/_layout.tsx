import { Redirect, Stack } from "expo-router";

export default function AuthRoutesLayout() {
  // const { isSignedIn, isLoaded } = useAuth();
  const isSignedIn = true;
  const isLoaded = true;

  if (!isLoaded) return null; // for a better ux

  if (isSignedIn) {
    return <Redirect href={"/(tabs)"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

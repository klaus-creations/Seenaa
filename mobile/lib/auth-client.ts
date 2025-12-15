import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: "http://localhost:5500/api/v1",
    plugins: [
        expoClient({
            scheme: "arifhasab",
            storagePrefix: "arifhasab",
            storage: SecureStore,
        })
    ]
});

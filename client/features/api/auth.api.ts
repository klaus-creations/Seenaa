import apiClient from "@/config/axios";

import type { RegisterUser } from "@/types/user/regitserUser";
import type { ISignIn } from "@/types/user/sign-in";

export const registrationrequest = async function (userdata: RegisterUser) {
  const res = await apiClient.post("/auth/sign-up/email", userdata);
  return res.data;
};

export const signInRequest = async function (userdata: ISignIn) {
  const res = await apiClient.post("/auth/sign-in/email", userdata);
  return res.data;
};

export const signOutRequest = async function () {
  const res = await apiClient.post("/auth/sign-out");
  return res.data;
};

export const googleOAuthRequest = async function () {
  const res = await apiClient.post("/auth/sign-in/social", {
    provider: "google",
    callbackURL: "http://localhost:3000/home",
    errorCallbackURL: "http://localhost:3000/error",
  });

  return res.data;
};

export const getSessionRequest = async function () {
  const res = await apiClient.get("/auth/get-session");
  return res.data;
};

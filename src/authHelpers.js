import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

export async function signup(email, password, firstName = "", lastName = "") {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const displayName = `${firstName || ""} ${lastName || ""}`.trim();
  if (displayName) {
    await updateProfile(userCred.user, { displayName });
  }
  return userCred.user;
}

export async function login(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function logout() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

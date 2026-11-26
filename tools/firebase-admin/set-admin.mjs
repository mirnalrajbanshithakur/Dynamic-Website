import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId) {
  throw new Error("Set GOOGLE_CLOUD_PROJECT to the Firebase project ID before running this tool.");
}
if (!process.stdin.isTTY) {
  throw new Error("Run this tool from an interactive terminal so the password prompt can be hidden.");
}

let muted = false;
const output = new Writable({
  write(chunk, encoding, done) {
    if (!muted) process.stdout.write(chunk, encoding);
    done();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });

let email;
let password;
try {
  email = (await rl.question("Admin email: ")).trim();
  const passwordAnswer = rl.question("New password (hidden): ");
  muted = true;
  try {
    password = await passwordAnswer;
  } finally {
    muted = false;
  }
  process.stdout.write("\n");
} finally {
  rl.close();
}

if (!email || !password) {
  throw new Error("Both an email and a non-empty password are required.");
}

initializeApp({
  credential: applicationDefault(),
  projectId,
});
const auth = getAuth();

let user;
try {
  user = await auth.getUserByEmail(email);
} catch (error) {
  if (error.code !== "auth/user-not-found") throw error;
}

if (user) {
  await auth.updateUser(user.uid, { password });
  console.log("Updated the password for the existing account.");
} else {
  user = await auth.createUser({ email, password });
  console.log("Created a new account.");
}

await auth.setCustomUserClaims(user.uid, {
  ...(user.customClaims || {}),
  admin: true,
});
const saved = await auth.getUser(user.uid);
console.log("UID:", saved.uid);
console.log("Claims:", saved.customClaims);

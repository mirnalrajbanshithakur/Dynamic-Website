# Mirnal Chaudhary - Portfolio

Static portfolio site, no build step.

```
mirnal-site/
  index.html      page structure and content
  admin.html      admin dashboard with Firebase email/password sign-in
  css/style.css   all styles and animations
  js/script.js    network canvas, typing, scroll effects, incident simulation
  assets/         put your photo, CV and images here
```

## Run
Open `index.html` in a browser, or serve the folder: `python3 -m http.server`.

## Edit
- Email: search `mirnal@example.com` in `index.html` and replace it with your real address.
- Social links: the `.links` block at the bottom of `index.html`.
- Roles in the typing line: the `roles` array in `js/script.js`.
- Colors: the `:root` variables at the top of `css/style.css`.

## Contact and cookies
- The contact form checks a simple arithmetic challenge in the browser, then opens the visitor's email app with a prepared message. It does not send messages to a server.
- The site stores a single `site_cookie_notice` preference cookie for six months when the notice is dismissed. No analytics or advertising cookies are used.
- The arithmetic check is only a front-end convenience; use server-side CAPTCHA verification if the form is connected to a backend.
- Project records are kept in the `projectRecords` array in `script.js`; the project index supports keyword search and focus-area filters.

## Admin sign-in
- `admin.html` uses Firebase Authentication email/password sign-in and remembers the signed-in session across browser restarts. Firebase persists the auth session, not the password; sign out on shared devices.
- In Firebase Console, create a project and web app, enable **Authentication → Sign-in method → Email/Password**, and create the admin user. Do not add a public sign-up form.
- Copy the web app's `apiKey`, `authDomain`, `projectId`, and `appId` into the `config` object near the bottom of `admin.html`. Firebase web config is public; never put service-account keys or passwords in HTML.
- Grant the admin account the `admin: true` custom claim using the Firebase Admin SDK in a trusted environment. Never set custom claims from browser code. The page checks this claim after sign-in.
- Add the deployed site host (and local development host, if needed) to Firebase Authentication's **Authorized domains**. Serve the site over HTTPS in production; opening it directly as a `file://` URL is not supported for Firebase sign-in.
- The dashboard currently displays sample records stored in the browser, not a protected database. The login gate does not make static files or local storage private. Before using real data, connect Firestore or another backend and enforce server-side security rules, for example Firestore rules requiring `request.auth != null && request.auth.token.admin == true` for admin-only records.
- `tools/firebase-admin/set-admin.mjs` is a trusted-machine utility that creates or updates an account and grants its `admin: true` custom claim. It prompts for the email and a hidden password; it does not save the password to disk. When updating an account, it replaces that account's password.
- To run it on a trusted machine, use Node.js 18 or newer and an interactive PowerShell terminal. The Google identity must have Firebase Authentication admin permissions. From the website folder:
  ```powershell
  cd tools\firebase-admin
  npm install
  $env:GOOGLE_CLOUD_PROJECT = "your-firebase-project-id"
  gcloud auth application-default login
  npm run set-admin
  ```
- Review the project ID carefully; this operation creates or changes a Firebase account and replaces the password for an existing account. Never run this tool from the public website or commit credentials/service-account keys.

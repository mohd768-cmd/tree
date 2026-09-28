# The Montgomery Lineage

Interactive family-tree website (React + Vite + Express/Vercel API).
Family records are stored in **Google Drive**.

## How storage works

- The admin signs in with Google (Firebase Auth popup).
- The app requests one OAuth scope only: `drive.file`
  (access limited to files this app creates; it cannot see the rest of your Drive).
- All data lives in a single JSON file in that Drive: `Aayinikunnathth-Family-Tree-Data.json`
  (`{ members, timeline, lastUpdated }`).
- On sign-in the app finds the file (or creates it) and loads it if it already exists.
- Every admin save auto-pushes to Drive when Google is connected (toggle: Auto-sync).
  Manual "Push to Drive" / "Pull from Drive" buttons are in the Admin tab.
- The `/api` server layer (Vercel KV / disk / memory) remains the fast shared cache for
  visitors; Drive is the durable master copy.

Code: `src/services/googleDrive.ts`, `src/context/GoogleDriveContext.tsx`.

## One-time Google setup

1. In Google Cloud Console (project `helpful-bot-2ghtt`, or your own), enable the **Google Drive API**.
2. OAuth consent screen: add scope `.../auth/drive.file`
   (in "Testing" mode, add your family admins as test users).
3. Firebase Console > Authentication > Sign-in method: enable **Google**.
4. Firebase Console > Authentication > Settings > **Authorized domains**:
   add your deployed domain (e.g. `your-app.vercel.app`).
5. Using your own Firebase project? Replace `firebase-applet-config.json`.

## Run locally

    npm install
    npm run dev        # http://localhost:3000

## Deploy to Vercel

1. Push this folder to GitHub and import it in Vercel
   (build `npm run build`, output `dist`; already set in `vercel.json`).
2. Optional: add Vercel KV / Upstash Redis (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
   so the shared server cache persists between serverless invocations.
3. Add the Vercel domain to Firebase Authorized domains (step 4 above).
4. Open the site > Admin tab (passcode) > Sign in with Google. The data file is created in your Drive.

## Notes

- The Drive file is private to the signed-in Google account. Other admins should sign in
  with that same account.
- Change the admin passcode in `src/components/AdminView.tsx` before going public.

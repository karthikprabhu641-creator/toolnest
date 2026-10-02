# ToolNest

An all-in-one browser utility platform with practical tools for students,
developers, images, PDFs and everyday tasks. Every tool listed below is
fully functional — nothing is a mockup or placeholder.

## Running it

ToolNest is a static site — no build step, no backend.

1. Unzip the project.
2. Open `index.html` directly in a browser, **or** serve the folder with any
   static file server for the best experience (service worker/PWA install
   only work over `http://localhost` or `https://`), e.g.:
   ```bash
   cd KE-Tools
   python3 -m http.server 8080
   # then open http://localhost:8080
   ```
3. Sign up with any name/email/password (see "Login" below) and you're in.

## Login

The login/signup screen is the **only** simulated part of this app, per the
original spec. Accounts are stored in `localStorage` on your own device —
there is no server, and no real authentication happens. Anyone using the
same browser profile can see the account list in dev tools. Do not reuse a
real password here.

## Third-party libraries (loaded via CDN)

ToolNest is "mostly client-side" but four tool categories rely on
well-established open-source libraries that are loaded from cdnjs at
runtime, rather than bundled in the ZIP (this environment could not reach
the internet to download and vendor them locally). This means:

| Library | Used by | CDN |
|---|---|---|
| **pdf-lib** | Merge, Split, Extract, Delete, Reorder, Rotate, Images→PDF | cdnjs.cloudflare.com/ajax/libs/pdf-lib |
| **PDF.js** | Page thumbnails (Delete/Reorder/Rotate), PDF→Images | cdnjs.cloudflare.com/ajax/libs/pdf.js |
| **qrcodejs** | QR Generator | cdnjs.cloudflare.com/ajax/libs/qrcodejs |
| **JsBarcode** | Barcode Generator | cdnjs.cloudflare.com/ajax/libs/JsBarcode |

All processing still happens **entirely in your browser** — your files are
never uploaded anywhere — but the first page load needs internet access to
fetch these scripts. If you want a fully offline build, download the four
libraries above and replace the `<script src="https://cdnjs...">` tags in
`index.html` with local paths into the `libraries/` folder.

Every other tool (all Student and Developer tools, image editing, and the
rest of Utilities) uses only native browser APIs (Canvas, Web Crypto,
FileReader) and needs no library at all.

## Logo

ToolNest uses the transparent `assets/toolnest-logo.png` for the site icon
and visible brand mark.

## Project structure

```
KE-Tools/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── LICENSE
├── assets/            KE mark, favicon
├── css/                main, auth, dashboard, tools, components, responsive
├── js/                 app shell, router, storage, search, theme, favorites, recent, auth, utils
└── tools/
    ├── student/        7 tools
    ├── developer/      11 tools
    ├── image/          6 tools
    ├── pdf/            8 tools
    └── utilities/      10 tools
```

## Notes

- Theme (dark/light/system), favorites and recently-used tools are all
  saved to `localStorage` and persist between visits.
- Global search: press **Ctrl+K** (or tap the search bar / bottom-nav search
  icon on mobile).
- All image/PDF processing happens locally in-memory using Canvas /
  pdf-lib / PDF.js — files are not uploaded anywhere.

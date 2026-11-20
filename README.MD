# \# SPTS Operation Portal

# 

# A mobile-first Progressive Web Application (PWA) built for \*\*SPT Services Sdn Bhd (SPTS)\*\* at the \*\*Pengerang Integrated Complex (PIC)\*\*, covering daily terminal floor operations across the \*\*Solid Product Jetty (SPJ)\*\* and \*\*Material Offloading Facility (MOLF)\*\*.

# 

# \---

# 

# \## Core Modules

# 

# 1\. \*\*Equipment Checklist (`modules/equipment-checklist.html`)\*\*

# &#x20;  - Context-aware pre-shift safety and maintenance inspections across 13 equipment categories (Prime Movers, Tippers, RTGs, Forklifts, ECH, QCs, Stackers, Reclaimers, Shiploaders, Conveyors `BC01`–`BC04`, `PC01`, `TP01`–`TP03`, and `DUH`).

# &#x20;  - Enforces mandatory telemetry inputs (ODO, Hour Meter, Diesel Level, Chock Count, Spillage Bin Level) and 5-state defect logging (`G`, `M`, `MF`, `D`, `L`).

# 2\. \*\*Manpower Booking (`modules/manpower-booking.html`)\*\*

# &#x20;  - Fetches daily shift deployment rosters from Google Drive via Google Apps Script.

# &#x20;  - Features instant Staff Name/ID search with 4.5x auto-zoom centering and anchored two-finger pinch-zoom navigation.

# 3\. \*\*Walkie Talkie Declaration (`modules/walkie-talkie-declaration.html`)\*\*

# &#x20;  - Digital shift accountability log for daily walkie-talkie unit issuance and condition reporting.

# 4\. \*\*Historical Record (`modules/historical-record.html`)\*\*

# &#x20;  - Searchable audit log viewer of past equipment inspection submissions synchronized to Malaysia Time (`UTC+8`).

# 5\. \*\*Incoming Operation Activities (`modules/incoming-operation-activities.html`)\*\*

# &#x20;  - Live schedule viewer for Container Vessels, Sulphur Vessels, SPW, Sulphur Transfers, and Housekeeping tasks with pinch-to-zoom support.

# 6\. \*\*Contacts Directory (`modules/contacts.html`)\*\*

# &#x20;  - Department-filtered directory (`Hotline`, `Execution`, `FEM`, `CSD`, `QHSSE`) with one-tap WhatsApp links and automated 4-digit PABX extension dialing.

# 

# \---

# 

# \## System Architecture

# 

# \- \*\*Frontend:\*\* Serverless HTML5, CSS3, and Vanilla JavaScript PWA hosted on GitHub Pages (`100dvh` responsive mobile viewport with iOS/Android safe-area inset support).

# \- \*\*Cloud Middleware:\*\* Microsoft Power Automate REST flows and Google Apps Script endpoints.

# \- \*\*Enterprise Data \& Logs:\*\* Microsoft SharePoint Lists, OneDrive Inspection Logs, and Google Drive shift documents.

# 

# \---

# 

# \## Repository Structure

# 

# ```text

# ├── index.html                        # Login screen, RBAC dashboard, birthdays \& notices

# ├── manifest.json                     # PWA manifest for standalone mobile installation

# ├── data.json                         # Fleet equipment types \& unit numbers

# ├── data/

# │   ├── announcement.json             # Dynamic portal notice banner configuration

# │   └── birthday.json                 # Monthly staff birthday list (MM-DD format)

# ├── js/

# │   └── fullscreen-global.js          # Mobile full-screen \& silent UI controls

# └── modules/

# &#x20;   ├── equipment-checklist.html

# &#x20;   ├── manpower-booking.html

# &#x20;   ├── walkie-talkie-declaration.html

# &#x20;   ├── historical-record.html

# &#x20;   ├── incoming-operation-activities.html

# &#x20;   └── contacts.html


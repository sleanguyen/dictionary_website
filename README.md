## Part 1: Basic MEVN CRUD System Requirements

### Basic Setup & Test Page

The project scaffold was initialised as a MEVN stack application with a clear separation of concerns: a Vue 3 single-page application (built with the Vue CLI/Vite tooling) for the presentation layer, and a Node.js/Express REST API for the application layer, connected to a MongoDB Atlas cloud cluster for persistent storage via Mongoose. Environment variables (database connection string, JWT secret) were kept out of source control using a `.env` file loaded through `dotenv`, following standard security practice for credential management.

<div align="center">
  <img width="378" height="67" alt="Screenshot 2026-08-03 140510" src="https://github.com/user-attachments/assets/998d6258-3d28-40e8-970c-22a398fbae0e" />
  <br/>
  <i>Figure 1 - "Vue 3 development server running via the Vue CLI, showing the initial project scaffold and confirming the frontend build pipeline is correctly configured."</i>
</div>

<br/>

<div align="center">
  <img width="324" height="130" alt="Screenshot 2026-08-03 140545" src="https://github.com/user-attachments/assets/b3912ec3-4419-4aff-bdd3-b0ef9d46fb4a" />
  <br/>
  <i>Figure 2 - "Express server console output confirming a successful connection to the MongoDB Atlas cluster via Mongoose (mongoose.connect), demonstrating the backend is correctly bound to the database layer of the MEVN stack."</i>
</div>

<br/>

A dedicated test page was implemented on the frontend to issue a simple Axios `GET` request to a backend health-check route. This provided an early, isolated verification that CORS was configured correctly on the Express server and that the client and server could exchange JSON before any CRUD functionality was built on top, reducing the risk of debugging multiple layers simultaneously.

<div align="center">
  <img width="382" height="327" alt="Screenshot 2026-08-03 141416" src="https://github.com/user-attachments/assets/2e9df166-03b6-4f5f-8326-04cb4457a09f" />
  <br/>
  <i>Figure 3 - "Test page rendering a successful response from a backend health-check endpoint, verifying end-to-end connectivity between the Vue 3 client and the Express server before CRUD development began."</i>
</div>

### Navigation & Routing

Vue Router was extended with a new route pointing to the dictionary listing view, and a corresponding entry was added to the main navigation bar. This uses Vue's client-side routing so that navigating to the dictionary page does not trigger a full page reload, preserving the single-page application experience while keeping the URL shareable and bookmarkable.

<div align="center">
  <img width="1232" height="853" alt="Screenshot 2026-08-03 141902" src="https://github.com/user-attachments/assets/80a7a17a-442d-460d-80aa-ec73efc2e04a" />
  <br/>
  <i>Figure 4 - "Vue Router configuration file showing the newly added route object (path, name and component) for the dictionary page, alongside the corresponding &lt;router-link&gt; entry in the navigation bar component."</i>
</div>

<br/>

<div align="center">
  <img width="1853" height="983" alt="Screenshot 2026-08-03 142512" src="https://github.com/user-attachments/assets/426a617f-4db4-436d-b38e-a4ed29ab24ef" />
  <br/>
  <i>Figure 5 - "Rendered navigation bar in the browser, showing the new menu item and the resulting dictionary page after routing, confirming the route resolves correctly and loads the intended component."</i>
</div>

### CRUD Implementation with Extra Field

The core of Part 1 is a full CRUD (Create, Read, Update, Delete) implementation for dictionary entries. Each `Word` document in MongoDB is modelled with a Mongoose schema containing a `keyword` field, a `partOfSpeech` field, and a `translations` array of sub-documents (each holding a `lang` code and a `text` value). To satisfy the requirement to extend the basic two-field system, the schema and the corresponding Vue form were updated to support a third language, so a single word now stores three parallel translations (for example English, Vietnamese and a third language) instead of two. This required changes at three levels: the Mongoose schema (to accept and validate an additional array entry), the Express controller (`createWord`/`updateWord`, which pass `req.body` straight through to the model so no controller change was strictly required beyond the schema update), and the Vue form UI (an additional input pair for the third language, bound with `v-model` and submitted as part of the same translations array).

<div align="center">
  <img width="536" height="391" alt="Screenshot 2026-08-03 142710" src="https://github.com/user-attachments/assets/427d0d66-c73c-4b9a-ae23-313051de78db" />
  <br/>
  <i>Figure 6 - "Mongoose schema (`wordModel.js`) showing the translations array structure used to store multiple language entries per word, extended to accommodate a third language beyond the original two."</i>
</div>

<br/>

<div align="center">
  <img width="1797" height="987" alt="Screenshot 2026-08-03 142843" src="https://github.com/user-attachments/assets/bd5b4163-30f9-4134-88c0-97ca49704b14" />
  <br/>
  <i>Figure 7 - "Create form in the Vue 3 frontend, showing input fields for the keyword, part of speech, and three separate translation fields (the third language field highlighted as the added requirement)."</i>
</div>

<br/>

<div align="center">
  <img width="964" height="863" alt="Screenshot 2026-08-03 142954" src="https://github.com/user-attachments/assets/fc354d70-2bf1-488a-88f5-44b33cd764ca" />
  <br/>
  <i>Figure 8 - "Dictionary listing (Read) view showing a word rendered with all three translation chips, confirming the third language field is correctly persisted and displayed alongside the original two."</i>
</div>

<br/>

<div align="center">
  <img width="984" height="95" alt="Screenshot 2026-08-03 143046" src="https://github.com/user-attachments/assets/c49968ea-3cf0-428f-a7ac-e56eacff9606" />
  <img width="693" height="718" alt="Screenshot 2026-08-03 143128" src="https://github.com/user-attachments/assets/1e7d1f73-1e60-4e05-8f4a-85bf739487de" />
  <img width="763" height="458" alt="Screenshot 2026-08-03 143338" src="https://github.com/user-attachments/assets/b62dad0a-785b-41c3-989c-f4dbe8850535" />
  <br/>
  <i>Figure 9 - "Update operation: editing an existing word's third-language translation via a `PUT` request to `/words/:id`, demonstrating `findOneAndUpdate` with `runValidators` enabled on the backend."</i>
</div>

<br/>

<div align="center">
  <img width="1041" height="503" alt="Screenshot 2026-08-03 143209" src="https://github.com/user-attachments/assets/281639f3-ac46-4503-9c87-93bc34ecf470" />
  <br/>
  <i>Figure 10 - "Delete operation showing the confirmation prompt and the resulting removal of a word from the list, backed by a `DELETE` request handled by `Word.deleteOne` on the server."</i>
</div>

---

## Part 2: Additional Functionality

### JWT Authentication & Role-Based Access Control (RBAC)

To secure the write operations of the CRUD system, a JWT-based authentication layer was added. On registration, passwords are hashed with bcrypt (never stored in plaintext) and every new account is forced to a 'viewer' role server-side, regardless of what the client sends, preventing privilege escalation through the registration endpoint. On login, credentials are verified with `bcrypt.compare` and, if valid, a signed JWT containing the user's `id` and `role` is issued with a 7-day expiry. This token is attached by the Vue client to subsequent requests and verified on the server by an Express middleware (`verifyToken`) before a second middleware (`requireAdmin`) checks the decoded role. Only users with the 'admin' role can reach the create/update/delete routes; 'viewer' accounts can only read data. This demonstrates the principle of defence at the API layer: even if the Vue UI were bypassed entirely (for example via a direct API call), the backend middleware still enforces the same authorisation rules.

<div align="center">
  <img width="492" height="545" alt="Screenshot 2026-08-03 144015" src="https://github.com/user-attachments/assets/6d00ff66-43f1-4947-a364-1361ea022242" />
  <img width="767" height="470" alt="Screenshot 2026-08-03 144134" src="https://github.com/user-attachments/assets/263ca4f0-b6c3-4911-b90e-1ca6a6014cea" />
  <br/>
  <i>Figure 11 - "Registration and login forms in the Vue 3 frontend, with the JWT returned by the `/auth/login` endpoint being stored on the client and attached to the Authorization header of subsequent Axios requests."</i>
</div>

<br/>

**Role: viewer**
<div align="center">
  <img width="1865" height="845" alt="Screenshot 2026-08-03 144340" src="https://github.com/user-attachments/assets/5e21d882-4fee-4924-b835-6be16e9a8d11" />
</div>

**Role: admin**
<div align="center">
  <img width="1836" height="913" alt="Screenshot 2026-08-03 144435" src="https://github.com/user-attachments/assets/1fd62428-2616-4617-98d7-2fde82ab7ffe" />
  <br/>
  <i>Figure 12 - "Comparison of the dictionary view rendered for a 'viewer' role (edit/delete controls hidden) versus an 'admin' role (edit/delete controls visible), showing the `verifyToken` and `requireAdmin` middleware enforcing RBAC on the protected Express routes."</i>
</div>

### Server-Side Pagination

Rather than returning the entire words collection on every request, the `/words` endpoint accepts `page` and `limit` query parameters and uses Mongoose's `skip()` and `limit()` methods to return only the documents relevant to the current page. `Word.countDocuments()` runs in parallel (via `Promise.all`) to compute `totalItems` and `totalPages`, which the Vue component uses to drive Previous/Next controls. This keeps the payload size constant regardless of how large the dictionary grows, which is important for scalability compared to fetching all documents and paginating client-side.

<div align="center">
  <img width="1800" height="931" alt="Screenshot 2026-08-03 144559" src="https://github.com/user-attachments/assets/7ced1fc2-d9b1-4c67-88ba-143b96391e4e" />
  <br/>
  <i>Figure 13 - "Network tab showing the paginated API response (data, totalItems, totalPages, currentPage) returned by `GET /words?page=1&limit=10`, alongside the pagination controls rendered in the Vue UI."</i>
</div>

### Dynamic Filtering (Filter by Part of Speech)

A 'Filter by Part of Speech' dropdown was added above the word list, bound to a reactive `selectedPos` value. When the user changes the selection, an `@change` handler resets `currentPage` back to 1 before re-fetching, which prevents the edge case where a user filtering while on a later page would land on an out-of-range page and see an empty table. On the backend, the same query object used for the count is also used for the paginated find (`Word.find(query)` and `Word.countDocuments(query)` share one object with `partOfSpeech` conditionally added), so `totalPages` always reflects the filtered result set rather than the full collection ensuring filtering and pagination remain consistent with one another.

<div align="center">
  <img width="330" height="174" alt="Screenshot 2026-08-03 144635" src="https://github.com/user-attachments/assets/0254adea-1e59-4298-95fb-dfa503d439d5" />
  <img width="1023" height="503" alt="Screenshot 2026-08-03 144710" src="https://github.com/user-attachments/assets/26ede65d-ab3c-4b2b-9eec-567cfafe3a73" />
  <br/>
  <i>Figure 14 - "Part of Speech dropdown filter in use, showing the word list and pagination totals updating consistently after the filter is applied and the page is reset to 1."</i>
</div>

### Text-to-Speech (Web Speech API)

A pronunciation feature was implemented entirely client-side using the browser's native Web Speech API (`window.speechSynthesis`), avoiding any dependency on external audio files or backend processing. A `playAudio(text, langCode)` function maps each word's short language code (e.g., 'en', 'vi', 'fr') to a full BCP 47 locale tag (e.g., 'en-US', 'vi-VN', 'fr-FR') via a lookup table, constructs a `SpeechSynthesisUtterance` with that locale, and calls `speechSynthesis.speak()`. Any in-progress utterance is cancelled before a new one starts, so rapid clicks do not queue overlapping audio. A speaker icon is rendered next to the English keyword and next to each translation, each wired to call `playAudio` with the correct text/language pair, and the buttons are disabled gracefully if `speechSynthesis` is unsupported in the user's browser.

<div align="center">
  <img width="434" height="336" alt="Screenshot 2026-08-03 145219" src="https://github.com/user-attachments/assets/95536686-d932-474b-a0dd-8a8956c23813" />
  <br/>
  <i>Figure 15 - "Speaker icon controls next to the English keyword and each translation chip, with the browser's native Web Speech API pronouncing the corresponding text in its mapped locale (e.g. vi-VN for Vietnamese)."</i>
</div>

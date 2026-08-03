Part 1: Basic MEVN CRUD System Requirements
Basic Setup & Test Page
The project scaffold was initialised as a MEVN stack application with a clear separation of concerns: a Vue 3 single-page application (built with the Vue CLI/Vite tooling) for the presentation layer, and a Node.js/Express REST API for the application layer, connected to a MongoDB Atlas cloud cluster for persistent storage via Mongoose. Environment variables (database connection string, JWT secret) were kept out of source control using a .env file loaded through dotenv, following standard security practice for credential management.

Figure 1 – "Vue 3 development server running via the Vue CLI, showing the initial project scaffold and confirming the frontend build pipeline is correctly configured."

Figure 2 – "Express server console output confirming a successful connection to the MongoDB Atlas cluster via Mongoose (mongoose.connect), demonstrating the backend is correctly bound to the database layer of the MEVN stack."

A dedicated test page was implemented on the frontend to issue a simple Axios GET request to a backend health-check route. This provided an early, isolated verification that CORS was configured correctly on the Express server and that the client and server could exchange JSON before any CRUD functionality was built on top, reducing the risk of debugging multiple layers simultaneously.

Figure 3 – "Test page rendering a successful response from a backend health-check endpoint, verifying end-to-end connectivity between the Vue 3 client and the Express server before CRUD development began."
Navigation & Routing
Vue Router was extended with a new route pointing to the dictionary listing view, and a corresponding entry was added to the main navigation bar. This uses Vue's client-side routing so that navigating to the dictionary page does not trigger a full page reload, preserving the single-page application experience while keeping the URL shareable and bookmarkable.

Figure 4 – "Vue Router configuration file showing the newly added route object (path, name and component) for the dictionary page, alongside the corresponding <router-link> entry in the navigation bar component."

Figure 5 – "Rendered navigation bar in the browser, showing the new menu item and the resulting dictionary page after routing, confirming the route resolves correctly and loads the intended component."
CRUD Implementation with Extra Field
The core of Part 1 is a full CRUD (Create, Read, Update, Delete) implementation for dictionary entries. Each Word document in MongoDB is modelled with a Mongoose schema containing a keyword field, a partOfSpeech field, and a translations array of sub-documents (each holding a lang code and a text value). To satisfy the requirement to extend the basic two-field system, the schema and the corresponding Vue form were updated to support a third language, so a single word now stores three parallel translations (for example English, Vietnamese and a third language) instead of two. This required changes at three levels: the Mongoose schema (to accept and validate an additional array entry), the Express controller (createWord/updateWord, which pass req.body straight through to the model so no controller change was strictly required beyond the schema update), and the Vue form UI (an additional input pair for the third language, bound with v-model and submitted as part of the same translations array).

Figure 6 – "Mongoose schema (wordModel.js) showing the translations array structure used to store multiple language entries per word, extended to accommodate a third language beyond the original two."

Figure 7 – "Create form in the Vue 3 frontend, showing input fields for the keyword, part of speech, and three separate translation fields (the third language field highlighted as the added requirement)."

Figure 8 – "Dictionary listing (Read) view showing a word rendered with all three translation chips, confirming the third language field is correctly persisted and displayed alongside the original two."



Figure 9 – "Update operation: editing an existing word's third-language translation via a PUT request to /words/:id, demonstrating findOneAndUpdate with runValidators enabled on the backend."


Figure 10 – "Delete operation showing the confirmation prompt and the resulting removal of a word from the list, backed by a DELETE request handled by Word.deleteOne on the server."
Part 2: Additional Functionality
JWT Authentication & Role-Based Access Control (RBAC)
To secure the write operations of the CRUD system, a JWT-based authentication layer was added. On registration, passwords are hashed with bcrypt (never stored in plaintext) and every new account is forced to a 'viewer' role server-side, regardless of what the client sends, preventing privilege escalation through the registration endpoint. On login, credentials are verified with bcrypt.compare and, if valid, a signed JWT containing the user's id and role is issued with a 7-day expiry. This token is attached by the Vue client to subsequent requests and verified on the server by an Express middleware (verifyToken) before a second middleware (requireAdmin) checks the decoded role. Only users with the 'admin' role can reach the create/update/delete routes; 'viewer' accounts can only read data. This demonstrates the principle of defence at the API layer: even if the Vue UI were bypassed entirely (for example via a direct API call), the backend middleware still enforces the same authorisation rules.


Figure 11 – "Registration and login forms in the Vue 3 frontend, with the JWT returned by the /auth/login endpoint being stored on the client and attached to the Authorization header of subsequent Axios requests."
Role: viewer

Role: admin

Figure 12 – "Comparison of the dictionary view rendered for a 'viewer' role (edit/delete controls hidden) versus an 'admin' role (edit/delete controls visible), showing the verifyToken and requireAdmin middleware enforcing RBAC on the protected Express routes."

Server-Side Pagination
Rather than returning the entire words collection on every request, the /words endpoint accepts page and limit query parameters and uses Mongoose's skip() and limit() methods to return only the documents relevant to the current page. Word.countDocuments() runs in parallel (via Promise.all) to compute totalItems and totalPages, which the Vue component uses to drive Previous/Next controls. This keeps the payload size constant regardless of how large the dictionary grows, which is important for scalability compared to fetching all documents and paginating client-side.

Figure 13 – "Network tab showing the paginated API response (data, totalItems, totalPages, currentPage) returned by GET /words?page=1&limit=10, alongside the pagination controls rendered in the Vue UI."
Dynamic Filtering (Filter by Part of Speech)
A 'Filter by Part of Speech' dropdown was added above the word list, bound to a reactive selectedPos value. When the user changes the selection, an @change handler resets currentPage back to 1 before re-fetching, which prevents the edge case where a user filtering while on a later page would land on an out-of-range page and see an empty table. On the backend, the same query object used for the count is also used for the paginated find (Word.find(query) and Word.countDocuments(query) share one object with partOfSpeech conditionally added), so totalPages always reflects the filtered result set rather than the full collection — ensuring filtering and pagination remain consistent with one another.


Figure 14 – "Part of Speech dropdown filter in use, showing the word list and pagination totals updating consistently after the filter is applied and the page is reset to 1."
Text-to-Speech (Web Speech API)
A pronunciation feature was implemented entirely client-side using the browser's native Web Speech API (window.speechSynthesis), avoiding any dependency on external audio files or backend processing. A playAudio(text, langCode) function maps each word's short language code (e.g. 'en', 'vi', 'fr') to a full BCP 47 locale tag (e.g. 'en-US', 'vi-VN', 'fr-FR') via a lookup table, constructs a SpeechSynthesisUtterance with that locale, and calls speechSynthesis.speak(). Any in-progress utterance is cancelled before a new one starts, so rapid clicks do not queue overlapping audio. A speaker icon is rendered next to the English keyword and next to each translation, each wired to call playAudio with the correct text/language pair, and the buttons are disabled gracefully if speechSynthesis is unsupported in the user's browser.

Figure 15 – "Speaker icon controls next to the English keyword and each translation chip, with the browser's native Web Speech API pronouncing the corresponding text in its mapped locale (e.g. vi-VN for Vietnamese)."

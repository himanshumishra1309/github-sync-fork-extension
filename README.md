# 🔄 GitHub Fork Sync Extension

A powerful, native-feeling Chrome Extension that brings batch fork-syncing capabilities directly to your GitHub Repositories page. Keep your forks up to date with a single click, completely eliminating the repetitive task of manually navigating to every downstream repository.

---

## ✨ Features

- **Native UI Integration**: Injects seamless "Sync Fork" and multi-selection UI directly into the GitHub Repositories page. It looks and feels exactly like a native GitHub feature.
- **Batch Synchronization**: "Sync All Forks" functionality allows you to update every out-of-date fork with a single click.
- **Granular Multi-Select**: Provides "Select Fork" toggles, allowing you to handpick specific repositories to update simultaneously.
- **Real-Time 'Behind' Stats**: Queries the GitHub API dynamically to show exactly how many commits your fork is behind the `upstream` default branch, right on the repo list.
- **Auto-Disabling Logic**: Intelligently disables sync buttons for repositories that are already `Behind: 0` to prevent redundant API calls.
- **Secure Token Storage**: Encrypts and securely stores your GitHub Personal Access Token (PAT) inside your browser's local storage.

## 🛠️ Architecture & Tech Stack

- **Manifest V3**: Built using modern Chrome Extension architecture.
- **Service Workers**: Employs efficient background service workers to handle API rate limiting and CORS-bypassing secure requests.
- **Content Scripts**: Uses advanced DOM manipulation techniques, combined with `MutationObserver` to ensure elements inject smoothly across GitHub's Single Page Application (SPA) navigation.
- **GitHub REST API v3**: Utilizes endpoints like `/compare` and `/merge-upstream` to fetch diff stats and automate merges.

## 🚀 Installation (Developer Mode)

Since this extension is built for customized personal workflows, you can install it locally:

1. Clone or download this repository to your machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Toggle on **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left corner.
5. Select the directory where you saved this repository (`github_sync_fork`).

## 🔑 Configuration

To allow the extension to sync repositories on your behalf, you must provide a GitHub Personal Access Token (PAT).

1. Go to your [GitHub Developer Settings](https://github.com/settings/tokens).
2. Click **Generate new token** (classic).
3. Name the token (e.g., "Fork Sync Extension").
4. **Important**: Under scopes, you **MUST** select:
   - `repo` (Full control of private repositories)
   - `workflow` (Required if your forks contain GitHub Actions, otherwise syncing will fail).
5. Generate the token and copy it.
6. Click the extension icon in your Chrome toolbar to open the Popup Dashboard and paste your token.

## 💻 Usage

1. Navigate to your GitHub profile's [Repositories tab](https://github.com/settings/repositories) or the `?type=fork` filter.
2. You will now see dynamic stats on each forked repository telling you exactly how many commits it is behind.
3. Click **Sync Fork** on an individual repository, or use the **Select Fork** toggles to pick multiple.
4. Hit **Sync All Forks** or **Sync Selected** at the top next to the search bar.
5. Sit back and watch the metrics dynamically update to `Behind: 0`!

## 📜 License
MIT License. Feel free to use, modify, and distribute as you see fit for your developer productivity!

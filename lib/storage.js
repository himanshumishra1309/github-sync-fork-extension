const storage = {
    saveToken : async (token) => {
        return new Promise((resolve) => {
            chrome.storage.sync.set({github_token: token}, () => {
                resolve();
            })
        });
    },

    getToken: async () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['github_token'], (result)=>{
                resolve(result.github_token || '');
            })
        })
    },

    saveSyncTime: async (repoFullName) => {
        return new Promise((resolve) => {
            const key = `sync_time_${repoFullName}`;
            const data = {}
            data[key] = new Date().toLocaleString();
            chrome.storage.local.set(data, resolve);
        })
    },

    getSyncTime: async (repoFullName) => {
        return new Promise((resolve) => {
            const key = `sync_time_${repoFullName}`;
            chrome.storage.local.get([key], (result)=>{
                resolve(result[key] || 'Never');
            });
        })
    }
}
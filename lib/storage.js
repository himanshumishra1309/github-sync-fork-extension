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
    }
}
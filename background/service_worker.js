try {
    importScripts('../lib/storage.js', '../lib/github_api.js');
} catch (e) {
    console.error("Failed to load scripts", e);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    if(request.action === "GET_STATS"){
        console.log("Service Worker heard a sync Request for: ", request.repoName);
        handleGetStats(request.repoName).then(sendResponse);
        return true;
    }

    if(request.action === "SYNC_FORK"){
        console.log(`Service Worker syncing : ${request.repoName}`);
        handleSync(request.repoName).then(sendResponse);
        return true;
    }
});

async function handleGetStats(repoFullName){
    try {
        const [owner, repo] = repoFullName.split('/');
        const repoInfo = await GitHubAPI.getRepoInfo(owner, repo);

        if(!repoInfo.parent){
            return {success: false, error: "Not a fork"};
        }

        const upstreamOwner = repoInfo.parent.owner.login;
        const defaultBranch = repoInfo.default_branch;

        const behindBy = await GitHubAPI.getCommitDifference(owner, repo, upstreamOwner, defaultBranch);

        const lastSynced = await Storage.getSyncTime(repoFullName);

        return { success: true, behindBy: behindBy, lastSynced: lastSynced };
    } catch (error) {
        console.error("Get stats failed: ", error.message);
        return {success: false, error: error.message};
    }
}

async function handleSync(repoFullName){
    try {
        const [owner, repo] = repoFullName.split('/');
        const repoInfo = await GitHubAPI.getRepoInfo(owner, repo);
        const defaultBranch = repoInfo.default_branch;

        await GitHubAPI.syncFork(owner, repo, defaultBranch);

        await Storage.saveSyncTime(repoFullName);

        const updatedTime = await Storage.getSyncTime(repoFullName);

        return {success: true, lastSynced: updatedTime};
    } catch (error) {
        console.error("Sync Failed: ", error.message);
        return {success: false, error: error.message};
    }
}
const GitHubAPI = {
    async request(endpoint, method = 'GET', body=null){
        const token = await Storage.getToken();
        if(!token) throw new Error("Github token missing! Please add it in the extension option.");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        const options = {method, headers};
        if(body) options.body = JSON.stringify(body);

        const response = await fetch(`https://api.github.com${endpoint}`, options);

        if(!response.ok){
            const err = await response.json().catch(()=>({}));
            throw new Error(`GitHub API Error (${response.status}): ${err.message || response.statusText}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {};
    },

    async getRepoInfo(owner, repo){
        return this.request(`/repos/${owner}/${repo}`);
    },

    async getCommitDifference(forkOwner, forkRepo, upstreamOwner, defaultBranch){
        const endpoint = `/repos/${forkOwner}/${forkRepo}/compare/${forkOwner}:${defaultBranch}...${upstreamOwner}:${defaultBranch}?t=${Date.now()}`;
        const result = await this.request(endpoint);
        
        return result.ahead_by;
    },

    async syncFork(owner, repo, branch){
        const endpoint = `/repos/${owner}/${repo}/merge-upstream`;
        return this.request(endpoint, 'POST', { branch: branch });
    }
}
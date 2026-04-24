console.log("Hello from my extension! The current URL is: " + window.location.href);

let lastUrl = location.href;
let selectedForksToSync = [];

const observer = new MutationObserver(() => {
    if(location.href !== lastUrl){
        lastUrl = location.href;
        console.log("Github Fork Sync: URL changed completely to: ", lastUrl);
        evaluatePage();
    }
});

observer.observe(document.body, {childList: true, subtree: true});

function evaluatePage(){
    const url = window.location.href;

    if(url.includes('tab=repositories') && !url.includes('type=fork')){
        console.log("We are on the Mixed Repositories Tab!");
        setTimeout(injectIntoRepoList, 500);
        setTimeout(injectIntoHeaderOptions, 500);
    }

    else if(url.includes('fork=true') || url.includes('type=fork')){
        console.log("We are on the Mixed Repositories Tab!");
        injectIntoRepoList();
        injectIntoHeaderOptions()
    }
}

function injectIntoHeaderOptions(){
    console.log('Header option addition start')

    const searchInput = document.querySelector('#your-repos-filter');
    
    if(!searchInput) {
        console.log("Search bar not found yet!");
        return; 
    }

    const headerOptions = searchInput.closest('.d-flex') || searchInput.parentElement;

    if(document.querySelector('.github-fork-sync-all')) return;

    const forkAll = document.createElement('button')
    
    forkAll.className = 'btn btn-primary ml-3 github-fork-sync-all'
    forkAll.innerText = 'Sync All Forks'
    forkAll.style.marginLeft = '12px';

    forkAll.addEventListener('click', async (e) => {
        e.preventDefault();
        let reposToSync = [];

        if(selectedForksToSync.length > 0){
            reposToSync = selectedForksToSync;
        }
        else{
            document.querySelectorAll('a[itemprop="name codeRepository"]').forEach(el => {
                reposToSync.push(el.getAttribute('href').substring(1));
            });
        }

        if(reposToSync.length === 0) return;

        console.log("Sync All Forks clicked!");
        forkAll.innerText = 'Syncing...';
        forkAll.disabled = true;

        for(const fullPath of reposToSync){
            try{
                await chrome.runtime.sendMessage({action: "SYNC_FORK", repoName: fullPath})
            } catch(error){
                console.error("error syncing all forks: ", error.message)
            }
        }

        forkAll.innerText = "All Synced ✓";

        setTimeout(()=> {
            selectedForksToSync = [];
            evaluatePage();
        }, 2000)
    });

    headerOptions.append(forkAll);
}

function injectIntoRepoList() {
    console.log("Ready to find repositories and draw buttons!")

    const repos = document.querySelectorAll('#user-repositories-list li');

    repos.forEach( repo => {
        if(repo.querySelector('.github-fork-sync-btn')) return;

        const isFork = repo.innerText.includes('Forked from');

        if(isFork){
            const repoNameElement = repo.querySelector('a[itemprop="name codeRepository"]');
            const repoName = repoNameElement ? repoNameElement.innerText.trim() : "Unknown Fork";
            const fullRepoPath = repoNameElement ? repoNameElement.getAttribute('href').substring(1) : "";

            const syncBtn = document.createElement('button');
            syncBtn.innerText = 'Sync Fork';

            syncBtn.className = 'btn btn-sm github-fork-sync-btn';
            syncBtn.style.marginLeft = '10px';
            syncBtn.style.verticalAlign = 'middle';

            syncBtn.addEventListener('click', async (event) => {
                event.preventDefault();
                console.log(`User Requested to sync: ${repoName}`)
                syncBtn.innerText = 'Syncing...';
                syncBtn.disabled = true;

                const response = await chrome.runtime.sendMessage({
                    action: 'SYNC_FORK',
                    repoName: fullRepoPath
                });

                if(response && response.success){
                    syncBtn.innerText = 'Synced ✓';
                    syncBtn.className = 'btn btn-sm btn-primary github-fork-sync-btn';
                    // You could also update the "Behind: 24" text to "Behind: 0" here!
                } else {
                    // It failed!
                    syncBtn.innerText = 'Failed';
                    syncBtn.className = 'btn btn-sm btn-danger github-fork-sync-btn'; // Turn it red
                    console.error("Sync Error:", response ? response.error : "Unknown error");
                    syncBtn.disabled = false; 
                }
            })

            const titleElement = repo.querySelector('h3');
            if(titleElement){
                titleElement.appendChild(syncBtn);
            }

            const footerElement = repo.querySelector('div.f6.color-fg-muted.mt-2') || repo.querySelector('div.mt-2');

            if(footerElement){
                const statsContainer = document.createElement('span');
                statsContainer.className ='github-fork-sync-stats';
                statsContainer.style.marginRight = '16px'

                statsContainer.innerHTML = `
                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-git-commit mr-1">
                        <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5h-3.32ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                    </svg>
                    <span class="commits-behind" style="font-weight: 500; color: #cf222e;">Checking...</span>
                    <span class="last-synced" style="margin-left: 8px;" title="Last auto-synced">⌚ Fetching time...</span>
                `;

                footerElement.prepend(statsContainer);

                chrome.runtime.sendMessage({action: "GET_STATS", repoName: fullRepoPath}, (response) => {
                    const behindSpan = statsContainer.querySelector('.commits-behind');
                    const syncSpan = statsContainer.querySelector('.last-synced');

                    if(response && response.success){
                        behindSpan.innerText = `Behind: ${response.behindBy}`;
                        if(response.behindBy === 0) behindSpan.style.color = '#1a7f37';

                        syncSpan.innerText = `⌚ Last Synced: ${response.lastSynced}`;

                        if(response.behindBy === 0){
                            syncBtn.disabled = true;
                            syncBtn.innerText = 'Up to date';
                        }
                    }

                    else {
                        if (response.error && response.error.includes("token")) {
                            behindSpan.innerText = `⚠️ Click extension to add PAT`;
                            syncSpan.innerText = ``;
                        } else {
                            behindSpan.innerText = `Behind: ?`;
                            syncSpan.innerText = `⌚ Error fetching`;
                        }
                    }
                })
            }

            const starAndStatsDiv = repo.querySelector('div.col-2.d-flex.flex-column.flex-justify-around.flex-items-end.tmp-ml-3');

            if(starAndStatsDiv){                
                const selectBtn = document.createElement('button');
                selectBtn.className = 'btn btn-sm mb-2 github-select-fork-btn';
                selectBtn.style.width = '100%';
                selectBtn.innerText = 'Select Fork'
                selectBtn.innerHTML = `
                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon mr-1">
                        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle>
                    </svg>
                    <span>Select Fork</span>`;
                
                selectBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    const isCurrentlySelected = selectedForksToSync.includes(fullRepoPath);

                    if(!isCurrentlySelected) {
                        selectBtn.classList.remove('btn');
                        selectBtn.classList.add('btn-primary');
                        selectBtn.innerHTML = `
                            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon mr-1">
                                <circle cx="8" cy="8" r="7" fill="currentColor"></circle>
                                <path d="M11.5 5.5l-4 4-2-2" stroke="white" stroke-width="2" fill="none"></path>
                            </svg>
                            <span>Selected</span>`;
                        
                        syncBtn.disabled = true;
                        selectedForksToSync.push(fullRepoPath);
                        console.log(selectedForksToSync);
                    }
                    else {
                        selectBtn.classList.remove('btn-primary');
                        selectBtn.classList.add('btn');
                        selectBtn.innerHTML = `
                            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon mr-1">
                                <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle>
                            </svg>
                            <span>Select Fork</span>`;
                        
                        syncBtn.disabled = false;
                        selectedForksToSync = selectedForksToSync.filter(name => name != fullRepoPath);
                        console.log(selectedForksToSync);
                    }

                    updateMainButton();
                })
                
                starAndStatsDiv.prepend(selectBtn);
            }
        }
    })
}

function updateMainButton(){
    const bigButton = document.querySelector('.github-fork-sync-all');
    if(!bigButton) return;
    
    if(selectedForksToSync.length == 0){
        bigButton.innerText = 'Sync All Fork';
    }
    else{
        bigButton.innerText = `Sync Selected ${selectedForksToSync.length}`;
    }
}

evaluatePage();
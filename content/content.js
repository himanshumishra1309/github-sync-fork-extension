console.log("Hello from my extension! The current URL is: " + window.location.href);

let lastUrl = location.href;

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
    }

    else if(url.includes('fork=true') || url.includes('type=fork')){
        console.log("We are on the Mixed Repositories Tab!");
        injectIntoRepoList();
    }
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

            const syncBtn = document.createElement('button');
            syncBtn.innerText = 'Sync Fork';

            syncBtn.className = 'btn btn-sm github-fork-sync-btn';
            syncBtn.style.marginLeft = '10px';
            syncBtn.style.verticalAlign = 'middle';

            syncBtn.addEventListener('click', (event) => {
                event.preventDefault();
                console.log(`User Requested to sync: ${repoName}`)
                syncBtn.innerText = 'Syncing...';
                syncBtn.disabled = true;
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

                const commitsBehind = '24';
                const lastSynced = '28-03-2026'

                statsContainer.innerHTML = `
                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-git-commit mr-1">
                        <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5h-3.32ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                    </svg>
                    <span style="font-weight: 500; color: #cf222e;">Behind: ${commitsBehind}</span>
                    <span style="margin-left: 8px;" title="Last auto-synced">⌚ Last Synced: ${lastSynced}</span>
                `

                footerElement.prepend(statsContainer)
            }
        }
    })
}

evaluatePage();
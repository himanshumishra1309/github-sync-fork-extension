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
        setTimeout(injectIntoRepoList(), 500);
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
        }
    })
}

evaluatePage();
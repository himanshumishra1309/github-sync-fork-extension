document.addEventListener('DOMContentLoaded', async ()=> {
    const setupContainer = document.getElementById('setup-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const tokenInput = document.getElementById('gh-token');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const messageEl = document.getElementById('message');

    const showMessage = (text, isError = false) => {
        messageEl.textContent = text;
        messageEl.className = `status ${isError ? 'error-text' : 'success-text'}`;
    };

    const inti = async () => {
        const token = await Storage.getToken();

        if(token) {
            setupContainer.classList.add('hidden');
            dashboardContainer.classList.remove('hidden');
        }
        else{
            setupContainer.classList.remove('hidden');
            dashboardContainer.classList.add('hidden');
        }
    }

    saveBtn.addEventListener('click' , async () => {
        const token = tokenInput.value.trim();

        if(!token) return showMessage('Please enter a token', true);

        saveBtn.innerText = 'Validating...';
        saveBtn.disabled = true;

        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {'Authorization': `Bearer ${token}`}
            });

            if(response.ok){
                const userData = await response.json();
                await Storage.saveToken(token);
                showMessage(`Welcome, @${userData.login}!`);
                setTimeout(()=>{
                    messageEl.classList.add('hidden');
                    inti();
                }, 1500);
            }
            else{
                showMessage('Ivalid or expired token.', true)
            }
        } catch (error) {
            showMessage('Network error.', true);
        }

        saveBtn.innerText = 'Connect Github';
        saveBtn.disabled = false;
    })

    resetBtn.addEventListener('click', async ()=> {
        await Storage.saveToken('');
        tokenInput.value = '';
        messageEl.classList.add('hidden');
        inti();
    })

    inti();
})
document.addEventListener('DOMContentLoaded', async()=>{
    const tokenInput = document.getElementById('gh-token');
    const saveBtn = document.getElementById('save-btn');
    const statusMsg = document.getElementById('status');

    const savedToken = await Storage.getToken();
    if(savedToken){
        tokenInput.value = savedToken
    }

    saveBtn.addEventListener('click', async()=>{
        const token = tokenInput.value.trim();

        await Storage.saveToken(token);

        statusMsg.style.display = 'block';
        setTimeout(()=>{
            statusMsg.style.display = 'none';
        }, 2000);
    })
})
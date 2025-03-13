const apiKey= "sk-e6a8fcc552834287ab2b7d88b172b5a3"

function sendMessage(){
    var message = document.getElementById('message-input')
    if(!message.value)
    {
        message.style.border = '1px solid red'
        return
    }

    message.style.border = 'none'

    //Configuração de Status
    var status = document.getElementById('status')
    var btnSubmit = document.getElementById('btn-submit')
    status.innerHTML = 'Carregando...'
    btnSubmit.disabled = true
    btnSubmit.style.cursor = 'not-allowed'
    message.disabled = true

    fetch("https://api.deepseek.com/chat/completions", {
       method: 'POST',
       headers: {
        Accept: "application/json",
        "Contet-Type": "application/json",
        Authorization: 'bearer ${apiKey}'
       },
       body: JSON.stringify({
        model: "DeepSeek-V3",
        messages: message.value,
        max_tokens: 2048,
        temperature: 1.0,
       })
    })
    .then((response) => response.json())
    .then((resoonse) => {
        console.log(response)
    })
}
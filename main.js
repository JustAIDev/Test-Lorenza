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

    fetch("http://localhost:11434/api/generate", {
       method: 'POST',
       headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'bearer ${apiKey}'
       },
       body: JSON.stringify({
           model: "deepseek-r1:8b",
           prompt: message.value,
           stream: false,
        max_tokens: 2048,
        temperature: 1.0,
       })
    })
    .then((response) => response.json())
    .then((response) => {

        const regex = /<think>[\s\S]*?<\/think>/g;
        const textoSemThink = response.response.replace(regex, ''); 
        console.log(textoSemThink.trim());

        let r = textoSemThink.trim()
        showHistoric(message.value,r)
    })
    .catch((e) => {
        console.log('Error -> ',e)
    })
    .finally(() => {
        btnSubmit.disabled = false
        btnSubmit.style.cursor = 'pointer'
        message.disabled = false
    })
}

function showHistoric(message, response){
    var historic = document.getElementById('historic')
    //My messages
    var boxMyMessage = document.createElement('div')
    boxMyMessage.className = 'box-my-message'

    var myMessage = document.createElement('p')
    myMessage.className = 'my-message'
    myMessage.innerHTML = message

    boxMyMessage.appendChild(myMessage)
    historic.appendChild(boxMyMessage)

    //Response messages
    var boxResponseMessage = document.createElement('div')
    boxResponseMessage.className = 'box-response-message'

    var chatResponse = document.createElement('p')
    chatResponse.className = 'chat-message'
    chatResponse.innerHTML = response

    boxResponseMessage.appendChild(chatResponse)
    historic.appendChild(boxResponseMessage)
}
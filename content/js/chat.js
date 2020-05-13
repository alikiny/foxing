const socket=io()

const $messages=document.querySelector('#messages')

const messageTemplate=document.querySelector('#message-template').innerHTML

const locationTemplate=document.querySelector('#location-template').innerHTML
const userList=document.getElementById("user-list").innerHTML

//extract the username and chatroom from the querry, using qs.min.js library
const {username,chatroom}=Qs.parse(location.search,{ignoreQueryPrefix:true})


//scroll to the latest message, unless the user is scrolling to the older message
const autoScroll=()=>{

    //get the last message sent
    const newMessage=$messages.lastElementChild

    //get the actual height of the last message (sum of margin and offsetHeight)
    const heightOfLastMessage=parseInt(getComputedStyle(newMessage).marginBottom)+newMessage.offsetHeight

    //get the visible height of $message
    const visibleHeight=$messages.offsetHeight

    //get the full height of the $message 
    const fullHeight=$messages.scrollHeight +2*parseInt(getComputedStyle($messages).border)

    //get the current scroll position
    const currentScrool=$messages.scrollTop+visibleHeight+heightOfLastMessage
    if(currentScrool>=fullHeight){
        $messages.scrollTop=fullHeight
    }
    

   
    
}


socket.on('locationMessage',(response,username)=>{
    console.log(response.text)
    
    const html=Mustache.render(locationTemplate,{
        user:username,
        url:response.text,
        sharedAt:moment(response.time).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('message',(message,username)=>{
    console.log(message.text)
    
    const html=Mustache.render(messageTemplate,{
        user: username,
        message: message.text,
        time: moment(message.time).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

document.querySelector('#message').addEventListener('change',enableButton)
document.querySelector('form').addEventListener('submit',(e)=>{
    e.preventDefault()

    const message=document.getElementById("message").value

    socket.emit('send',message,(status)=>{
        
        document.getElementById("message").value=''
        document.getElementById('submit').setAttribute('disabled','disabled')
        console.log('Sent '+status)
        
    })
})

document.querySelector("#share-location").addEventListener('click',(e)=>{
    e.preventDefault()
    if(navigator.geolocation){
        document.querySelector('#share-location').setAttribute('disabled','disabled')
        navigator.geolocation.getCurrentPosition((position)=>{
            //console.log(position)
            const longitude=position.coords.longitude
            const latitude= position.coords.latitude
            socket.emit('sendLocation',{
                longitude,
                latitude
            },()=>{
                document.querySelector('#share-location').removeAttribute('disabled')
                console.log("You have shared a location")
            })
        })
    }else{
        return alert('Geo-location is not supported in your browser')
    }
})



function enableButton(){
    
    if(document.querySelector('#message').value.trim().length!=0){
        document.querySelector('#submit').removeAttribute('disabled')
    }else{
        document.querySelector('#submit').setAttribute('disabled','disabled')
    }
}


socket.emit('join',{username,chatroom},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})

socket.on('list',({room,users})=>{
    const html=Mustache.render(userList,{
        room,
        users
    })
    document.getElementById("sidebar").innerHTML=html

})
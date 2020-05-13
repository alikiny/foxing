let users=[]

const addUser= ({id,username,chatroom})=>{
    username=username.trim().toLowerCase()
    chatroom=chatroom.trim().toLowerCase()

    if(!username || !chatroom){
        return{
            error: 'Username and Chat room are required!'
        }
    }

    const searched=users.find((user)=>{
        return user.username===username && user.chatroom===chatroom
    })

    if(searched){
        return {
            error: 'Username is already exist'
        }
    }

    const newUser={id,username,chatroom}
    users.push(newUser)
   
    return {newUser}
}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id
    })

    if(index!==-1){
        return users.splice(index,1)[0]
    }
    return undefined
}

const fetchUser=(userid)=>{
    const result=users.find((user)=>{
        return user.id===userid
    })
    
    return result;
}

const roomUsers=(chatroom)=>{
    const result=users.filter((user)=>{
        return user.chatroom===chatroom.toLowerCase()
    })
    
    return result
}

module.exports={
    addUser,
    removeUser,
    fetchUser,
    roomUsers
}
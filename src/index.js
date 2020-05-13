const express=require('express')
const hbs=require('hbs')
const http= require('http')
const path=require('path')
const socketio=require('socket.io')
const Filter= require('bad-words')
const{addUser,
    removeUser,
    fetchUser,
    roomUsers}=require('./utils/users')


const port=process.env.PORT || 3000

const staticPath=path.join(__dirname,'../content')
const app=express()
const server=http.createServer(app)
const io=socketio(server)

const {newMessage}=require('./utils/messages')
app.use(express.static(staticPath))

io.on('connection',(socket)=>{
    // console.log('New connection')

    
    
    socket.on('join',({username,chatroom},callback)=>{
        const {error,newUser}=addUser({
            id:socket.id,
            username,
            chatroom
        })
        if(error){
            return callback(error)
        }
        socket.join(newUser.chatroom)       
        socket.emit('message',newMessage(`Welcome ${username}`))
        socket.broadcast.to(newUser.chatroom).emit('message',newMessage(`${newUser.username} has joined room`))

        io.to(newUser.chatroom).emit('list',{
            room:newUser.chatroom,
            users:roomUsers(newUser.chatroom)})
    })

    

    socket.on('send',(message,callback)=>{
        const filter= new Filter();
        if(filter.isProfane(message)){
            return callback('Failed. Message contains profane language')
        }
        const user=fetchUser(socket.id)
        
        io.to(user.chatroom).emit('message',newMessage(message),user.username)
    
        callback("Sucessfully")
        
    })
    
    socket.on('disconnect',()=>{
        const left=removeUser(socket.id)
        if(left){
            io.to(left.chatroom).emit('message',newMessage(`${left.username} has left.`))
            io.to(left.chatroom).emit('list',{
                room:left.chatroom,
                users:roomUsers(left.chatroom)})
        }
        
    })

    socket.on('sendLocation',(info, callback)=>{
        const user=fetchUser(socket.id)

        io.to(user.chatroom).emit('locationMessage',newMessage(`https://google.com/maps?q=${info.latitude},${info.longitude}`),user.username)
        callback()
    })
})

server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})
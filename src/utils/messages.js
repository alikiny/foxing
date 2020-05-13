const newMessage=(text)=>{
    return {
        text,
        time: new Date().getTime()
    }
}

module.exports={
    newMessage}
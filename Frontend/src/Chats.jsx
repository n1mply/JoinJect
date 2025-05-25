import { useEffect, useState } from "react"
import Chat from "./Chat"
import './Chats.css'

export default function Chats({apiClient}){
    const [isLoading, setIsLoading] = useState(true)
    const [chats, setChats] = useState([])
    const [currentChat, setCurrentChat] = useState('')

    const fetchChats = async () =>{
        try{
            const response = await apiClient.get('/chats/get')
            setChats(response.data.chats)
            setIsLoading(false)
            console.log(response.data.chats)
        } catch (error){
            console.error(error)
            }
        }


    useEffect(()=>{
        fetchChats()
    }, [apiClient])

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="chats-box">
            <div className="chats-tabs">
                <h1>Chats</h1>
                <div className="chats">
                    {chats.map((chat, index) => (
                        <div className="chat" onClick={()=>{setCurrentChat(chat.username)}}>
                            <div className="chat-info" style={{display: 'flex', alignItems: 'flex-end', justifyContent:'space-between'}}>
                                <p key={index}>@{chat.username}</p>
                                <span style={{fontSize: '12px'}} >{new Date(chat.last_time).toLocaleDateString()}</span>
                            </div>
                            <p className="last-message">{chat.last_message}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Chat apiClient={apiClient} currentChat={currentChat} onChatsUpdate={fetchChats}></Chat>
        </div>
    )
}
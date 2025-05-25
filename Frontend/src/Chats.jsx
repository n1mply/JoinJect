import { useEffect, useState } from "react"
import Chat from "./Chat"
import './Chats.css'

export default function Chats({apiClient}){
    const [isLoading, setIsLoading] = useState(true)
    const [chats, setChats] = useState([])
    const [currentChat, setCurrentChat] = useState('')

    useEffect(()=>{
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
        fetchChats()
    }, [apiClient])

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="chats-box">
            <div className="chats-tabs">
                <h1>Chats</h1>
                <div className="chats">
                    {chats.map((chat, index) => (
                        <div className="chat">
                            <p key={index} onClick={()=>{setCurrentChat(chat.username)}}>@{chat.username}</p>
                            <p className="last-message">{chat.last_message}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Chat apiClient={apiClient} currentChat={currentChat}></Chat>
        </div>
    )
}
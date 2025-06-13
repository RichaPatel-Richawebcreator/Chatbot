import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatrBodyRef = useRef();

  const genrateBotResponse = async (history) => {

    const updateHistory = (text) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), {role:"model", text}]);
    }

    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({contents: history}),
    };
    try {
      // Use the API URL from the environment variables
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}?key=${import.meta.env.VITE_API_KEY}`,
        requestOptions
      );
      const data = await response.json();
  
      // Throw an error if the response is not okay
      if (!response.ok) throw new Error(data.error?.message || "Something went wrong!");
      
      // console.log(data); // Inspect the response data
      // You can return or use the API response here
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
      updateHistory(apiResponseText);
    } catch (error) {
      console.error("Error generating bot response:", error);
    }
  };

  useEffect(() => {
    // Auto scroll chat history update
    chatrBodyRef.current.scrollTo({top: chatrBodyRef.current.scrollHight, behavior: "smooth"});
  }, [chatHistory]);

  return (
    <>
      <h3 style={{color: "#6d4fc2", text-align:"center"}}>Not finding what you’re looking for? Let’s chat — click the button at the bottom right!</h3>
    <div className={`container ${showChatbot ? "show-chatbot": ""}`}>
      <button onClick={() => setShowChatbot(prev => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>
      <div className="chatbot-popup">
        <div className="chatbot-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button onClick={() => setShowChatbot(prev => !prev)}className="material-symbols-rounded">keyboard_arrow_down</button>
        </div>
        {/* chatbot body */}
        <div ref={chatrBodyRef}  className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there <br /> How can I help you today ?
            </p>
          </div>
          {chatHistory.map((chat,index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        <div className="chat-footer">
         <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} genrateBotResponse={genrateBotResponse} />
        </div>
      </div>
    </div>
    </>
  )
}

export default App;

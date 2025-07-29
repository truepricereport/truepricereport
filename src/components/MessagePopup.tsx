import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ReactNode } from 'react';

interface MessagePopupProps {
  onUpdateDescription: (message: string) => void
  popupTitle: string
  onClose: () => void
  defaultMessage: string
  isValuationUnavailable: boolean
}

export function MessagePopup({ onUpdateDescription, popupTitle, onClose, defaultMessage, isValuationUnavailable }: MessagePopupProps) {
  const [message, setMessage] = useState(defaultMessage)
  const maxMessageLength = 300;

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputMessage = e.target.value;
    if (inputMessage.length <= maxMessageLength) {
      setMessage(inputMessage);
    }
  };

  const sendMessage = () => {
    onUpdateDescription(message)
    onClose()
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{popupTitle}</h2>
        <textarea
          className="w-full h-32 p-2 border rounded-md mb-2"
          placeholder="Enter your message here..."
          value={message}
          onChange={handleMessageChange}
          maxLength={maxMessageLength}
        ></textarea>
         <p className="text-sm text-gray-500 mb-4">{message.length}/{maxMessageLength} characters remaining</p>
        <div className="flex justify-end">
          <Button className="bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium" onClick={sendMessage}>{isValuationUnavailable ? 'Contact Us For Personalized Valuation' : 'Send Message'}</Button>
        </div>
      </div>
    </div>
  )
}
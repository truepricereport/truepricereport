import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface MessagePopupProps {
  onUpdateDescription: (message: string) => void
  popupTitle: string
  onClose: () => void
  defaultMessage: string
  isValuationUnavailable: boolean
}

const messageSchema = z.object({
  message: z.string()
    .max(300, { message: "Message must be less than 300 characters." })
});

type MessageFormValues = z.infer<typeof messageSchema>;

export function MessagePopup({ onUpdateDescription, popupTitle, onClose, defaultMessage, isValuationUnavailable }: MessagePopupProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: defaultMessage,
    },
  });

  // Initialize message with defaultMessage
  useEffect(() => {
    setValue("message", defaultMessage);
  }, [defaultMessage, setValue]);

  const message = watch("message"); // Use watch to get the current message

  const sendMessage = (data: MessageFormValues) => {
    onUpdateDescription(data.message);
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{popupTitle}</h2>
        <form onSubmit={handleSubmit(sendMessage)} className="space-y-2">
          <div>
            <textarea
              className="w-full h-32 p-2 border rounded-md mb-2"
              placeholder="Enter your message here..."
              {...register("message")}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
            )}
            <p className="text-sm text-gray-500 mb-4">
              {message ? message.length : 0}/300 characters remaining
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
              type="submit"
            >
              {isValuationUnavailable ? 'Contact Us For Personalized Valuation' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
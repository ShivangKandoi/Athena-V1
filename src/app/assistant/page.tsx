"use client";

import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getChatResponse } from "@/lib/gemini-service";

// Message type definition
type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

// Initial messages
const initialMessages: Message[] = [
  {
    id: uuidv4(),
    content: "Hello! I'm Athena, your personal AI assistant. How can I help you today?",
    role: "assistant",
    timestamp: new Date(),
  },
];

export default function AssistantPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Prepare message history for Gemini API
  const getMessageHistory = () => {
    // Get only actual conversation messages (skip welcome message if it's first)
    return messages
      .filter((msg, index) => !(index === 0 && msg.role === "assistant"))
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  };

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send message to AI assistant
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get message history for context
      const history = getMessageHistory();
      
      // Send to Gemini API
      const response = await getChatResponse(input, history);
      
      // Add AI response
      const aiMessage: Message = {
        id: uuidv4(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  return (
    <MainLayout className="flex flex-col p-0 overflow-hidden">
      <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden px-4">
        {/* Header Section */}
        <div className="bg-violet-900 dark:bg-violet-950 rounded-xl p-5 mb-4 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">AI Assistant</h1>
          <p className="text-violet-200 text-sm">
            Ask me anything and I'll try to help you
          </p>
        </div>

        {/* Messages container - Only this should scroll */}
        <div 
          className="flex-1 overflow-y-auto px-1 pr-2 min-h-0" 
          ref={messagesContainerRef}
        >
          <div className="space-y-6 pb-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "flex-col"
                )}
              >
                {message.role === "user" ? (
                  <div className="bg-violet-600 text-white p-3 rounded-xl max-w-[85%]">
                    <p>{message.content}</p>
                    <div className="text-xs text-violet-200 text-right mt-1">
                      {formatMessageTime(message.timestamp)}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%]">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                      <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 inline-block">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                    <p className="text-sm text-slate-500">Athena is thinking...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input form at bottom */}
        <div className="flex-shrink-0 mb-4 md:mb-1 mt-2 z-10 bg-background">
          <form onSubmit={sendMessage} className="flex gap-2 rounded-lg bg-slate-800 p-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              ref={inputRef}
              className="bg-transparent border-0 text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="bg-violet-600 hover:bg-violet-700 rounded-lg"
            >
              {isLoading ? 
                <Loader2 className="h-4 w-4 animate-spin" /> : 
                <Send className="h-4 w-4" />
              }
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AvatarSelectorProps {
  currentAvatarUrl?: string;
  onSelect: (avatarUrl: string) => void;
  className?: string;
}

const avatarOptions = [
  {
    id: 1,
    name: "Cool Shades",
    url: "/assets/avatars/avatar-1.svg",
  },
  {
    id: 2,
    name: "Green Headphones",
    url: "/assets/avatars/avatar-2.svg",
  },
  {
    id: 3,
    name: "Cyber Style",
    url: "/assets/avatars/avatar-3.svg",
  },
  {
    id: 4,
    name: "Geometric",
    url: "/assets/avatars/avatar-4.svg",
  },
];

export function AvatarSelector({ currentAvatarUrl, onSelect, className }: AvatarSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(currentAvatarUrl);

  const handleSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleSave = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn("flex items-center gap-2", className)}
        >
          {currentAvatarUrl && (
            <div className="relative w-5 h-5 rounded-full overflow-hidden">
              <Image 
                src={currentAvatarUrl} 
                alt="Current avatar" 
                fill 
                className="object-cover"
              />
            </div>
          )}
          Change Avatar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose an avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
          {avatarOptions.map((avatar) => (
            <div
              key={avatar.id}
              className={cn(
                "relative aspect-square rounded-lg cursor-pointer overflow-hidden border-2 transition-all",
                selectedAvatar === avatar.url
                  ? "border-primary ring-2 ring-primary/20 scale-105"
                  : "border-transparent hover:border-primary/50"
              )}
              onClick={() => handleSelect(avatar.url)}
            >
              <Image
                src={avatar.url}
                alt={avatar.name}
                fill
                className="object-cover"
              />
              {selectedAvatar === avatar.url && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedAvatar}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
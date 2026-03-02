"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const uploadOptions = [
  { type: "pdf", label: "PDF Document", icon: "📄", accept: ".pdf" },
  { type: "audio", label: "Audio File", icon: "🎵", accept: ".mp3,.wav,.m4a" },
  { type: "image", label: "Image", icon: "🖼️", accept: ".png,.jpg,.jpeg,.gif" },
];

interface SourceUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SourceUpload({ open, onOpenChange }: SourceUploadProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Source</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Web search */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Find sources from the web
            </label>
            <div className="flex gap-2">
              <Input placeholder="Search the web..." className="flex-1" />
              <Button variant="secondary" size="sm">
                Search
              </Button>
            </div>
          </div>

          <Separator />

          {/* URL */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Add website URL
            </label>
            <div className="flex gap-2">
              <Input placeholder="https://..." className="flex-1" />
              <Button variant="secondary" size="sm">
                Add
              </Button>
            </div>
          </div>

          <Separator />

          {/* File upload options */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Upload a file
            </label>
            <div className="grid grid-cols-3 gap-2">
              {uploadOptions.map((opt) => (
                <label
                  key={opt.type}
                  className="flex flex-col items-center gap-1 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs text-center">{opt.label}</span>
                  <input type="file" accept={opt.accept} className="hidden" />
                </label>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

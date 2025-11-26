"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDropdown,
  ResponsiveDropdownItem,
} from "@/components/ui/responsive-dropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, RefreshCw, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegenerateMenuProps {
  onRegenerate: () => void;
  onRegenerateWithInstructions: (instructions: string) => void;
  disabled?: boolean;
  label?: string;
  contextHint?: string;
  className?: string;
}

export function RegenerateMenu({
  onRegenerate,
  onRegenerateWithInstructions,
  disabled = false,
  label = "Regenerate",
  contextHint = "content",
  className,
}: RegenerateMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [instructions, setInstructions] = useState("");

  const handleSubmitInstructions = () => {
    if (instructions.trim()) {
      onRegenerateWithInstructions(instructions.trim());
      setInstructions("");
      setDialogOpen(false);
    }
  };

  return (
    <>
      <div className={cn("flex items-center", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={disabled}
          className="rounded-r-none border-r-0 flex-1 min-h-[44px]"
        >
          {label}
        </Button>
        <ResponsiveDropdown
          title={label}
          trigger={
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="rounded-l-none px-2 min-h-[44px]"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          }
        >
          <ResponsiveDropdownItem
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={onRegenerate}
          >
            {label}
          </ResponsiveDropdownItem>
          <ResponsiveDropdownItem
            icon={<MessageSquarePlus className="h-4 w-4" />}
            onClick={() => setDialogOpen(true)}
          >
            {label} with instructions
          </ResponsiveDropdownItem>
        </ResponsiveDropdown>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label} with Instructions</DialogTitle>
            <DialogDescription>
              Provide specific instructions for regenerating the {contextHint}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={`e.g., "Focus more on practical examples" or "Make it more concise"`}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitInstructions}
              disabled={!instructions.trim()}
            >
              {label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

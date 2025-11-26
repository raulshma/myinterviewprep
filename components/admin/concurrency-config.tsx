"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Check, Layers } from "lucide-react";
import { setAIConcurrencyLimit } from "@/lib/actions/admin";

interface ConcurrencyConfigProps {
  initialLimit: number;
}

export function ConcurrencyConfig({ initialLimit }: ConcurrencyConfigProps) {
  const [limit, setLimit] = useState(initialLimit);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const result = await setAIConcurrencyLimit(limit);
      if (result.success) {
        setLimit(result.limit);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-muted-foreground shrink-0" />
          <CardTitle className="font-mono">AI Concurrency Limit</CardTitle>
        </div>
        <CardDescription>
          Control how many AI requests can run in parallel during interview prep
          generation. Lower values reduce API load, higher values speed up
          generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 sm:max-w-[200px]">
            <Label className="text-sm text-muted-foreground mb-2 block">
              Max Concurrent Requests
            </Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setLimit(Math.max(1, Math.min(10, val)));
                setSaved(false);
              }}
              min={1}
              max={10}
              className="font-mono w-full min-h-[44px]"
            />
          </div>
          <Button onClick={handleSave} disabled={isPending} className="w-full sm:w-auto min-h-[44px]">
            {isPending ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Default: 2 | Range: 1-10 | When generating interview prep, {limit}{" "}
          module{limit !== 1 ? "s" : ""} will be generated simultaneously.
        </p>
      </CardContent>
    </Card>
  );
}

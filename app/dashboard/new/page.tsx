"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { createInterview, createInterviewFromPrompt } from "@/lib/actions/interview";

export default function NewInterviewPage() {
  const router = useRouter();
  
  // Prompt-based creation state
  const [prompt, setPrompt] = useState("");
  const [isPromptSubmitting, setIsPromptSubmitting] = useState(false);
  
  // Detailed form state
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showManualResume, setShowManualResume] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFileType(file)) {
      setResumeFile(file);
      setShowManualResume(false);
      setErrors((prev) => ({ ...prev, resumeFile: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        resumeFile: "Please upload a PDF or DOCX file",
      }));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isValidFileType(file)) {
        setResumeFile(file);
        setShowManualResume(false);
        setErrors((prev) => ({ ...prev, resumeFile: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          resumeFile: "Please upload a PDF or DOCX file",
        }));
      }
    }
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return validTypes.includes(file.type);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (jobTitle.trim().length < 2) {
      newErrors.jobTitle = "Job title must be at least 2 characters";
    } else if (jobTitle.length > 100) {
      newErrors.jobTitle = "Job title must be at most 100 characters";
    }

    if (company.trim().length < 1) {
      newErrors.company = "Company name is required";
    } else if (company.length > 100) {
      newErrors.company = "Company name must be at most 100 characters";
    }

    if (jobDescription.trim().length < 50) {
      newErrors.jobDescription =
        "Job description must be at least 50 characters";
    } else if (jobDescription.length > 10000) {
      newErrors.jobDescription =
        "Job description must be at most 10000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle prompt-based submission
  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (prompt.trim().length < 10) {
      setGeneralError("Please provide a more detailed prompt (at least 10 characters)");
      return;
    }

    setIsPromptSubmitting(true);

    try {
      const result = await createInterviewFromPrompt({
        prompt: prompt.trim(),
      });

      if (result.success) {
        router.push(`/interview/${result.data._id}`);
      } else {
        if (result.error.code === "RATE_LIMIT") {
          setGeneralError(result.error.message);
        } else {
          setGeneralError(result.error.message);
        }
      }
    } catch (error) {
      console.error("Failed to create interview:", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPromptSubmitting(false);
    }
  };

  // Handle detailed form submission
  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createInterview({
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        jobDescription: jobDescription.trim(),
        resumeFile: resumeFile ?? undefined,
        resumeText: showManualResume ? resumeText.trim() : undefined,
      });

      if (result.success) {
        router.push(`/interview/${result.data._id}`);
      } else {
        if (result.error.code === "VALIDATION_ERROR" && result.error.details) {
          setErrors(result.error.details);
        } else if (result.error.code === "RATE_LIMIT") {
          setGeneralError(result.error.message);
        } else if (result.error.code === "PARSE_ERROR") {
          setErrors((prev) => ({ ...prev, resumeFile: result.error.message }));
          setShowManualResume(true);
        } else {
          setGeneralError(result.error.message);
        }
      }
    } catch (error) {
      console.error("Failed to create interview:", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmitPrompt = prompt.trim().length >= 10;
  const canSubmitDetailed =
    jobTitle.trim().length >= 2 &&
    company.trim().length >= 1 &&
    jobDescription.trim().length >= 50;

  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-mono text-foreground">New Interview Prep</h1>
            <p className="text-sm text-muted-foreground">
              Describe what you're preparing for
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-8 max-w-2xl">
        <div className="space-y-6">
          {generalError && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{generalError}</p>
            </div>
          )}

          {/* Quick Prompt Section */}
          <form onSubmit={handlePromptSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="prompt" className="text-sm text-muted-foreground">
                  Quick Start
                </Label>
              </div>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I'm preparing for a Senior Frontend Engineer interview at Stripe. I have 5 years of React experience..."
                className="font-mono min-h-[120px]"
                disabled={isPromptSubmitting || isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Just describe the role and any relevant context. We'll handle the rest.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={!canSubmitPrompt || isPromptSubmitting || isSubmitting}
              className="w-full"
            >
              {isPromptSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Interview Prep
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Detailed Form Toggle */}
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setShowDetailedForm(!showDetailedForm)}
            disabled={isPromptSubmitting || isSubmitting}
          >
            <span className="text-sm text-muted-foreground">
              Fill in details manually
            </span>
            {showDetailedForm ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {/* Detailed Form */}
          {showDetailedForm && (
            <form onSubmit={handleDetailedSubmit} className="space-y-4 pt-2">
              <div>
                <Label
                  htmlFor="jobTitle"
                  className="text-sm text-muted-foreground mb-2 block"
                >
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    if (errors.jobTitle)
                      setErrors((prev) => ({ ...prev, jobTitle: "" }));
                  }}
                  placeholder="e.g., Senior Frontend Engineer"
                  className={`font-mono ${
                    errors.jobTitle ? "border-destructive" : ""
                  }`}
                  disabled={isSubmitting || isPromptSubmitting}
                />
                {errors.jobTitle && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.jobTitle}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="company"
                  className="text-sm text-muted-foreground mb-2 block"
                >
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (errors.company)
                      setErrors((prev) => ({ ...prev, company: "" }));
                  }}
                  placeholder="e.g., Stripe"
                  className={`font-mono ${
                    errors.company ? "border-destructive" : ""
                  }`}
                  disabled={isSubmitting || isPromptSubmitting}
                />
                {errors.company && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.company}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="resume"
                  className="text-sm text-muted-foreground mb-2 block"
                >
                  Resume (optional)
                </Label>
                {!showManualResume ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed p-8 text-center transition-colors ${
                      isDragging
                        ? "border-foreground bg-muted/50"
                        : resumeFile
                        ? "border-foreground/50 bg-muted/30"
                        : errors.resumeFile
                        ? "border-destructive"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <div className="text-left">
                          <p className="text-sm text-foreground font-mono">
                            {resumeFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(resumeFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setResumeFile(null)}
                          className="ml-2"
                          disabled={isSubmitting || isPromptSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop your resume here, or
                        </p>
                        <label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isSubmitting || isPromptSubmitting}
                          />
                          <span className="text-sm text-foreground hover:underline cursor-pointer">
                            browse files
                          </span>
                        </label>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF or DOCX up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <Textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume text here..."
                      className="font-mono min-h-[150px]"
                      disabled={isSubmitting || isPromptSubmitting}
                    />
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="mt-1 p-0 h-auto"
                      onClick={() => {
                        setShowManualResume(false);
                        setResumeText("");
                      }}
                    >
                      Upload file instead
                    </Button>
                  </div>
                )}
                {errors.resumeFile && (
                  <div className="mt-2">
                    <p className="text-xs text-destructive">
                      {errors.resumeFile}
                    </p>
                    {!showManualResume && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs"
                        onClick={() => {
                          setShowManualResume(true);
                          setResumeFile(null);
                          setErrors((prev) => ({ ...prev, resumeFile: "" }));
                        }}
                      >
                        Enter resume text manually instead
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="jobDescription"
                  className="text-sm text-muted-foreground mb-2 block"
                >
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (errors.jobDescription)
                      setErrors((prev) => ({ ...prev, jobDescription: "" }));
                  }}
                  placeholder="Paste the full job description here for personalized prep materials. The more details, the better we can tailor your preparation..."
                  className={`font-mono min-h-[200px] ${
                    errors.jobDescription ? "border-destructive" : ""
                  }`}
                  disabled={isSubmitting || isPromptSubmitting}
                />
                <div className="flex justify-between mt-1">
                  {errors.jobDescription ? (
                    <p className="text-xs text-destructive">
                      {errors.jobDescription}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {jobDescription.length < 50
                        ? `${50 - jobDescription.length} more characters needed`
                        : "✓ Minimum length met"}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {jobDescription.length}/10000
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!canSubmitDetailed || isSubmitting || isPromptSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Interview Prep
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href="/dashboard">
            <Button type="button" variant="ghost" disabled={isSubmitting || isPromptSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

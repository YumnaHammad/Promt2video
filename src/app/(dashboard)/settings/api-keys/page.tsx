"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  KeyRound,
  Check,
  X,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const providers = [
  {
    id: "OPENAI",
    name: "OpenAI",
    description: "GPT-4 for script generation and DALL·E for images",
    docsUrl: "https://platform.openai.com/api-keys",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "GEMINI",
    name: "Google Gemini",
    description: "Gemini models for script and multimodal generation",
    docsUrl: "https://aistudio.google.com/apikey",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "ANTHROPIC",
    name: "Anthropic",
    description: "Claude for high-quality script writing",
    docsUrl: "https://console.anthropic.com/settings/keys",
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "ELEVENLABS",
    name: "ElevenLabs",
    description: "Natural text-to-speech voice synthesis",
    docsUrl: "https://elevenlabs.io/app/settings/api-keys",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "OPENROUTER",
    name: "OpenRouter",
    description: "Unified access to multiple LLM providers",
    docsUrl: "https://openrouter.ai/keys",
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "KLING",
    name: "Kling AI",
    description: "AI video generation for dynamic scenes",
    docsUrl: "https://klingai.com",
    color: "from-cyan-500 to-blue-600",
  },
];

export default function ApiKeysPage() {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});

  const toggleProvider = (id: string) => {
    setExpandedProvider(expandedProvider === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-8"
    >
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <h1 className="text-fluid-2xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Connect your own AI provider keys to use custom models and reduce
          platform costs.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Bring Your Own Keys</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Keys are encrypted at rest and never shared. When configured,
              enable &quot;Use my API keys&quot; on the create page to route
              generation through your providers.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {providers.map((provider, index) => {
          const isExpanded = expandedProvider === provider.id;
          const hasKey = Boolean(keyValues[provider.id]);

          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(isExpanded && "ring-1 ring-primary/30")}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-lg",
                          provider.color
                        )}
                      >
                        {provider.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasKey ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          <Check className="h-3 w-3" />
                          Configured
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          <X className="h-3 w-3" />
                          Not set
                        </span>
                      )}
                      <Button
                        variant={isExpanded ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleProvider(provider.id)}
                      >
                        {isExpanded ? "Close" : "Configure"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t border-border/50 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Key</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showKeys[provider.id] ? "text" : "password"}
                            placeholder={`Enter your ${provider.name} API key`}
                            value={keyValues[provider.id] ?? ""}
                            onChange={(e) =>
                              setKeyValues((prev) => ({
                                ...prev,
                                [provider.id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                            onClick={() =>
                              setShowKeys((prev) => ({
                                ...prev,
                                [provider.id]: !prev[provider.id],
                              }))
                            }
                          >
                            {showKeys[provider.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Button variant="default" disabled={!keyValues[provider.id]}>
                          Save
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <a
                        href={provider.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Get API key from {provider.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {hasKey && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setKeyValues((prev) => {
                              const next = { ...prev };
                              delete next[provider.id];
                              return next;
                            })
                          }
                        >
                          Remove key
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

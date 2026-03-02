"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Plugin, PluginCategory } from "@/lib/types";

const categoryLabels: Record<PluginCategory, string> = {
  source_connector: "Source Connectors",
  export_format: "Export Formats",
  studio_output: "Studio Outputs",
  theme: "Themes",
  integration: "Integrations",
};

const categoryIcons: Record<PluginCategory, string> = {
  source_connector: "🔌",
  export_format: "📤",
  studio_output: "🎨",
  theme: "🎭",
  integration: "🔗",
};

const mockPlugins: Plugin[] = [
  {
    id: "p1",
    name: "Notion Connector",
    description: "Import and sync pages from Notion workspaces as sources",
    author: "OpenNotebook Community",
    version: "1.2.0",
    category: "source_connector",
    installed: false,
    rating: 4.8,
    downloads: 12400,
    icon: "📝",
  },
  {
    id: "p2",
    name: "Zotero Integration",
    description: "Sync your Zotero library and auto-import references",
    author: "OpenNotebook Community",
    version: "1.0.3",
    category: "source_connector",
    installed: true,
    rating: 4.6,
    downloads: 8200,
    icon: "📚",
  },
  {
    id: "p3",
    name: "LaTeX Export",
    description: "Export notebooks as LaTeX documents with full citation support",
    author: "Academic Tools",
    version: "2.1.0",
    category: "export_format",
    installed: false,
    rating: 4.9,
    downloads: 15600,
    icon: "📜",
  },
  {
    id: "p4",
    name: "Concept Map Generator",
    description: "Generate interactive concept maps from your sources",
    author: "Visual Learning Lab",
    version: "0.9.1",
    category: "studio_output",
    installed: false,
    rating: 4.3,
    downloads: 3400,
    icon: "🗺️",
  },
  {
    id: "p5",
    name: "Dark Academia Theme",
    description: "Warm, scholarly dark theme with serif typography",
    author: "Theme Studio",
    version: "1.0.0",
    category: "theme",
    installed: false,
    rating: 4.7,
    downloads: 9100,
    icon: "🌙",
  },
  {
    id: "p6",
    name: "Obsidian Sync",
    description: "Two-way sync between OpenNotebook and Obsidian vaults",
    author: "OpenNotebook Community",
    version: "1.1.0",
    category: "integration",
    installed: true,
    rating: 4.5,
    downloads: 7300,
    icon: "💎",
  },
  {
    id: "p7",
    name: "Podcast Enhancer",
    description: "Add background music, sound effects, and jingles to generated podcasts",
    author: "Audio Tools",
    version: "0.8.0",
    category: "studio_output",
    installed: false,
    rating: 4.1,
    downloads: 2100,
    icon: "🎵",
  },
  {
    id: "p8",
    name: "Arxiv Connector",
    description: "Search and import papers directly from arXiv",
    author: "Academic Tools",
    version: "1.3.0",
    category: "source_connector",
    installed: false,
    rating: 4.8,
    downloads: 11200,
    icon: "🔬",
  },
];

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-xs text-amber-500">
      {"★".repeat(full)}
      {half && "½"}
      <span className="text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

interface PluginCardProps {
  plugin: Plugin;
  onToggle: (id: string) => void;
}

function PluginCard({ plugin, onToggle }: PluginCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
      <span className="text-2xl mt-0.5">{plugin.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{plugin.name}</span>
          <Badge variant="secondary" className="text-[10px]">
            v{plugin.version}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {plugin.description}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-muted-foreground">
            {plugin.author}
          </span>
          <StarRating rating={plugin.rating} />
          <span className="text-[10px] text-muted-foreground">
            {formatDownloads(plugin.downloads)} installs
          </span>
        </div>
      </div>
      <Button
        variant={plugin.installed ? "outline" : "default"}
        size="sm"
        className="text-xs shrink-0"
        onClick={() => onToggle(plugin.id)}
      >
        {plugin.installed ? "Installed" : "Install"}
      </Button>
    </div>
  );
}

interface PluginMarketplaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PluginMarketplace({ open, onOpenChange }: PluginMarketplaceProps) {
  const [plugins, setPlugins] = useState<Plugin[]>(mockPlugins);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<PluginCategory | "all">(
    "all"
  );

  const categories = Object.keys(categoryLabels) as PluginCategory[];

  const filtered = plugins.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleInstall = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, installed: !p.installed } : p
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🧩</span> Plugin Marketplace
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search plugins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "border hover:bg-accent"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-accent"
              }`}
            >
              {categoryIcons[cat]} {categoryLabels[cat]}
            </button>
          ))}
        </div>

        <Separator />

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-2 py-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No plugins found matching your search.
              </p>
            ) : (
              filtered.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onToggle={toggleInstall}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

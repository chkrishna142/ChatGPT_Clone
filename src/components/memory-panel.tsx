"use client";

import { MemoryItem } from "@/types";
import { Brain, Clock, Search, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryPanel({ isOpen, onClose }: MemoryPanelProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Load all memories on mount
  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen]);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/memory?action=all");
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories);
        setSearchResults(data.memories);
      } else {
        // Failed to load memories
      }
    } catch (error) {
      // Failed to load memories
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(memories);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/memory?query=${encodeURIComponent(searchQuery)}&limit=10`
      );
      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.memories);
      } else {
        // Search failed
      }
    } catch (error) {
      // Search failed
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      const response = await fetch(`/api/memory?id=${memoryId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId));
        setSearchResults((prev) => prev.filter((m) => m.id !== memoryId));
      } else {
        // Failed to delete memory
      }
    } catch (error) {
      // Failed to delete memory
    }
  };

  const filterMemoriesByCategory = (memories: MemoryItem[]) => {
    if (selectedCategory === "all") return memories;
    return memories.filter((memory) => memory.category === selectedCategory);
  };

  const categories = [
    "all",
    "user_preferences",
    "conversation_context",
    "user_facts",
    "discussion_topics",
    "user_skills_interests",
    "interaction_history",
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "user_preferences":
        return "💝";
      case "conversation_context":
        return "💬";
      case "user_facts":
        return "📋";
      case "discussion_topics":
        return "🗣️";
      case "user_skills_interests":
        return "🎯";
      case "interaction_history":
        return "📚";
      default:
        return "🧠";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Memory Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category === "all"
                  ? "All"
                  : category
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Memories List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filterMemoriesByCategory(searchResults).length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {searchQuery
                    ? "No memories found for your search."
                    : "No memories stored yet."}
                </div>
              ) : (
                filterMemoriesByCategory(searchResults).map((memory) => (
                  <div
                    key={memory.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getCategoryIcon(memory.category)}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Tag className="w-3 h-3" />
                          <span>{memory.category.replace("_", " ")}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>
                            {formatTimestamp(memory.metadata.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {memory.metadata.confidence && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {Math.round(memory.metadata.confidence * 100)}%
                            match
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteMemory(memory.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                          title="Delete memory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                      {memory.content}
                    </p>
                    {memory.metadata.importance && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Importance:
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < memory.metadata.importance!
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Memories help the AI provide more personalized responses based on
            your conversations.
          </p>
        </div>
      </div>
    </div>
  );
}

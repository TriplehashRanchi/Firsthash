"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { Send, Loader2, Search, ArrowLeft } from "lucide-react";
import clsx from "clsx";

// 🔗 Axios setup
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});
apiClient.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken(true);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function ChatPage({ role = "admin" }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // 🔄 Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiClient.get("/api/chat/projects");
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchProjects();
  }, []);

  // ✅ Debounced search (to prevent lag)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ Derived filtered list (memoized)
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) =>
        filter === "all" ? true : p.status?.toLowerCase() === filter
      )
      .filter((p) =>
        p.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
  }, [projects, filter, debouncedSearch]);

  // 📨 Fetch chat messages
  const fetchMessages = async (projectId) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/chat/${projectId}/messages`);
      setMessages(res.data || []);
      setTimeout(() => inputRef.current?.focus(), 200);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  // ✉️ Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await apiClient.post(`/api/chat/${selectedProject}/messages`, {
        message: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  // Filter button reusable
  const FilterButton = ({ label, value, color }) => (
    <button
      onClick={() => setFilter(value)}
      className={clsx(
        "px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200",
        filter === value
          ? `${color} text-white`
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 transition-all duration-300 ease-in-out">
      {/* 🧭 Sidebar / Project List */}
      {!selectedProject ? (
        <div className="flex-1 flex flex-col bg-white border-r transition-all duration-300">
          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {role === "admin"
                ? "All Projects"
                : role === "manager"
                ? "My Team Projects"
                : "My Projects"}
            </h2>

            {/* 🔍 Search */}
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 mb-3">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>

            {/* 🔘 Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <FilterButton label="All" value="all" color="bg-blue-600" />
              <FilterButton label="Ongoing" value="ongoing" color="bg-yellow-500" />
              <FilterButton label="Pending" value="pending" color="bg-gray-500" />
              <FilterButton label="Completed" value="completed" color="bg-green-600" />
            </div>
          </div>

          {/* 📜 Project list (chat-like) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {filteredProjects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-10">
                No projects found
              </p>
            ) : (
              filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProject(proj.id);
                    fetchMessages(proj.id);
                  }}
                  className={clsx(
                    "p-3 bg-white rounded-xl border flex justify-between items-center cursor-pointer hover:shadow-sm transition-all",
                    "hover:border-blue-500 hover:bg-blue-50"
                  )}
                >
                  <div>
                    <p className="font-medium text-gray-800 truncate">
                      {proj.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {proj.status}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
                      proj.status?.toLowerCase() === "complete"
                        ? "bg-green-100 text-green-700"
                        : proj.status?.toLowerCase() === "ongoing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {proj.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* 💬 Chat Screen */
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
            <button
              onClick={() => setSelectedProject(null)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">
                {projects.find((p) => p.id === selectedProject)?.name || "Project"}
              </h3>
              <span
                className={clsx(
                  "text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
                  projects.find((p) => p.id === selectedProject)?.status?.toLowerCase() ===
                    "complete"
                    ? "bg-green-100 text-green-700"
                    : projects.find((p) => p.id === selectedProject)?.status?.toLowerCase() ===
                      "ongoing"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {projects.find((p) => p.id === selectedProject)?.status || ""}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
            {loading ? (
              <div className="flex justify-center mt-10 text-gray-400">
                <Loader2 className="animate-spin w-6 h-6" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-400">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "mb-3 flex",
                    msg.sender_name?.includes("Admin")
                      ? "justify-end"
                      : "justify-start"
                  )}
                >
                  <div
                    className={clsx(
                      "px-4 py-2 rounded-2xl max-w-lg shadow-sm",
                      msg.sender_name?.includes("Admin")
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    )}
                  >
                    <div className="text-[17px] break-words">{msg.message}</div>
                    <div className="text-[12px] opacity-70 mt-1 text-right">
                      {msg.sender_name || "Unknown"}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t bg-white p-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Write a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { Button } from "@/components/ui/button";
import { FaRobot, FaCheckCircle, FaBug, FaLightbulb } from "react-icons/fa";
import { BiCodeAlt, BiRun } from "react-icons/bi";
import { MdOutlineSpeed, MdMemory } from "react-icons/md";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Constants ---------- */

// Default boilerplates
const defaultBoilerplates = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    // Write your solution here
    return 0;
}`,
  python: `# Write your solution here
# You can define helper functions above
def solve():
    pass

if __name__ == "__main__":
    solve()`,
  java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // Write your solution here
    }
}`,
  javascript: `// Write your solution here
function main(){
  
}
main();`,
};

// UI language labels -> internal language keys
const languageMap = {
  "C++": "cpp",
  Python: "python",
  Java: "java",
  JavaScript: "javascript",
};

// extensions for label display
const extensionMap = {
  "C++": "cpp",
  Python: "py",
  Java: "java",
  JavaScript: "js",
};

// backend language keys (same as monaco here)
const toBackendLang = (uiLang) => languageMap[uiLang] || "plaintext";

/* ---------- Utils ---------- */

// Try to detect that the saved code belongs to another language (legacy cross-language bug)
function looksLikeWrongLanguage(langKey, code = "") {
  if (!code) return false;
  // NOTE: original code had HTML-escaped patterns; fix to real code
  const hasInclude = /#include\s+</.test(code);
  const hasMainFunc = /int\s+main\s*\(/.test(code);
  const hasDef = /def\s+\w+\s*\(/.test(code);
  const hasClassJava = /public\s+class\s+\w+/.test(code) || /public\s+static\s+void\s+main/.test(code);
  const hasJS = /(function\s+\w+\(|=>|console\.)/.test(code);

  switch (langKey) {
    case "cpp":
      // C++ code signatures are fine
      return hasDef || hasClassJava || hasJS; // if it looks like other langs
    case "python":
      return hasInclude || hasMainFunc || hasClassJava || hasJS;
    case "java":
      return hasInclude || (hasDef && !hasClassJava) || hasJS;
    case "javascript":
      return hasInclude || hasMainFunc || hasClassJava;
    default:
      return false;
  }
}

/* ---------- Component ---------- */

const CodeEditor = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [hints, setHints] = useState([]);
  const [language, setLanguage] = useState("C++"); // UI language
  const [code, setCode] = useState(defaultBoilerplates.cpp);
  const [baseTemplates, setBaseTemplates] = useState(defaultBoilerplates); // merged with question.referenceCode
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [failedCaseIndex, setFailedCaseIndex] = useState(-1);
  const [totalTestCases, setTotalTestCases] = useState(0);
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [view, setView] = useState("question");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const [loading, setLoading] = useState(false); // analyze
  const [feedback, setFeedback] = useState(""); // analyze modal HTML
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [memoryUsed, setMemoryUsed] = useState(null);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const STORAGE_KEY = useMemo(() => `code:${id}`, [id]);
  const [editorReady, setEditorReady] = useState(false);
  const monacoLanguage = toBackendLang(language);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  /* ---------- Effects ---------- */

  // Screen size
  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch question
  useEffect(() => {
    let canceled = false;

    const fetchQuestion = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/questions/${id}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (canceled) return;

        setQuestion(data);
        const tcLen = Array.isArray(data?.testCases) ? data.testCases.length : 0;
        setTotalTestCases(tcLen);

        // Merge referenceCode into baseTemplates without dropping defaults
        if (Array.isArray(data?.referenceCode) && data.referenceCode.length) {
          const merged = { ...defaultBoilerplates };
          data.referenceCode.forEach((rc) => {
            // rc.language expected to be one of: cpp, python, java, javascript
            if (rc?.language && rc?.code && merged[rc.language] !== undefined) {
              merged[rc.language] = rc.code;
            }
          });
          setBaseTemplates(merged);
        } else {
          setBaseTemplates(defaultBoilerplates);
        }
      } catch (err) {
        console.error("Failed to fetch question", err);
        setQuestion(null);
        setBaseTemplates(defaultBoilerplates);
        setTotalTestCases(0);
      }
    };

    fetchQuestion();
    return () => {
      canceled = true;
    };
  }, [id]);

  // Initialize code when language/id/baseTemplates changed
  useEffect(() => {
    try {
      const savedBundle = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const savedForLang = savedBundle?.[language];
      const langKey = toBackendLang(language);

      if (typeof savedForLang === "string") {
        if (looksLikeWrongLanguage(langKey, savedForLang)) {
          const fresh = baseTemplates[langKey] || defaultBoilerplates[langKey] || "";
          setCode(fresh);
          setHasUserEdited(false);
        } else {
          setCode(savedForLang);
          setHasUserEdited(false);
        }
      } else {
        const fresh = baseTemplates[langKey] || defaultBoilerplates[langKey] || "";
        setCode(fresh);
        setHasUserEdited(false);
      }
    } catch {
      const langKey = toBackendLang(language);
      setCode(baseTemplates[langKey] || defaultBoilerplates[langKey] || "");
      setHasUserEdited(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, language, baseTemplates, STORAGE_KEY]);

  // Persist code after user edits (debounced)
  useEffect(() => {
    if (!hasUserEdited) return;
    const t = setTimeout(() => {
      try {
        const savedBundle = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        savedBundle[language] = code;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBundle));
      } catch {
        // ignore storage errors
      }
    }, 350);
    return () => clearTimeout(t);
  }, [code, language, STORAGE_KEY, hasUserEdited]);

  // Shortcuts
  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setVerdict("Running...");
    setOutput("");
    setExecutionTime(null);
    setMemoryUsed(null);

    const startTime = Date.now();
    try {
      // If user did not supply custom input and we have sample test cases, run first sample automatically for quick feedback
  let sampleMode = false;
  if (!input.trim() && safeTestCases.length > 0) sampleMode = true;

      const runSingle = async (inp) => {
        const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: monacoLanguage, code, input: inp }),
        });
        return r.json();
      };

      let result;
      if (!sampleMode) {
        result = await runSingle(input);
      } else {
        // Run all sample test cases sequentially
        const sampleResults = [];
        for (let i = 0; i < safeTestCases.length; i++) {
          const tc = safeTestCases[i];
            const r = await runSingle(tc?.input ?? "");
            const raw = (r?.output ?? r?.error ?? "").toString();
            const got = raw.trim();
            const expected = (tc?.output ?? "").trim();
            const pass = got === expected;
            sampleResults.push({ index: i, pass, expected, got });
            if (!pass) { // stop early on first fail for speed
              result = r; // for generic handling below
              break;
            }
        }
        const firstFail = sampleResults.find(r => !r.pass);
        if (!firstFail) {
          setVerdict("Samples Passed");
          setOutput(sampleResults.map(r => `#${r.index+1} ✅`).join(" \u2022 "));
          toast.success(`All ${sampleResults.length} sample tests passed`);
        } else {
          setVerdict("Samples Failed");
          setOutput(`Sample test #${firstFail.index+1} failed\n\nExpected:\n${firstFail.expected}\n\nYour Output:\n${firstFail.got}`);
          toast.warn(`Sample test #${firstFail.index+1} failed`);
        }
        // Skip further generic success logic
        if (firstFail) {
          // still treat potential runtime errors already set; fall through if error detection below triggers
          // we already set verdict/output above; continue to error detection
        } else {
          // Completed sample mode path; finish early
          setIsRunning(false);
          return;
        }
      }
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (typeof result?.memoryUsed === "number") {
        setMemoryUsed(result.memoryUsed);
      }

      const text = result?.output ?? result?.error ?? "Unknown error";
      setOutput(text);

      const isError =
        typeof text === "string" &&
        (text.includes("Traceback") ||
          text.toLowerCase().includes("error") ||
          text.toLowerCase().includes("exception"));

      if (isError) {
        setVerdict("Runtime Error");
        toast.error("Code execution failed with errors");
      } else if (result?.error) {
        setVerdict("Runtime Error");
        toast.error("Code execution failed");
  } else if (!sampleMode) {
        setVerdict("Executed");
        toast.success("Code ran (execution only)");
      }
    } catch (err) {
      setOutput("Error executing code");
      setVerdict("Runtime Error");
      toast.error("Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  }, [code, input, isRunning, monacoLanguage]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setVerdict("Running all test cases...");
    setOutput("");
    setTestCaseResults([]);
    setFailedCaseIndex(-1);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/questions/${id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: monacoLanguage,
            code,
          }),
        }
      );

      const result = await response.json();

      if (result?.success) {
        setOutput("All test cases passed! Great job!");
        setVerdict("Accepted");
        setFailedCaseIndex(-1);
        setTestCaseResults(
          Array(totalTestCases).fill({ passed: true })
        );
        toast.success("Solution accepted! All test cases passed!");

        // Record submission (if user present)
        if (user?._id) {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user._id,
              questionId: id,
              code,
              language, // keep UI label for display in history if your backend expects UI label, else use monacoLanguage
              status: "Accepted",
            }),
          });
        }
      } else {
        setVerdict("Wrong Answer");
        const failIdx = typeof result?.failedCaseIndex === "number" ? result.failedCaseIndex : 0;
        setFailedCaseIndex(failIdx);

        const expected = result?.expected ?? "";
        const actual = result?.actual ?? "";

        const statusArray = [];
        for (let i = 0; i < totalTestCases; i++) {
          if (i < failIdx) statusArray.push({ passed: true });
          else if (i === failIdx) statusArray.push({ passed: false, expected, actual });
          else statusArray.push({ passed: null });
        }
        setTestCaseResults(statusArray);

        setOutput(
          `Test case #${failIdx + 1} failed\n\nExpected:\n${expected}\n\nYour Output:\n${actual}\n\nCheck your logic and try again.`
        );

        toast.error(`Wrong answer on test case ${failIdx + 1}`);

        if (user?._id) {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user._id,
              questionId: id,
              code,
              language,
              status: "Wrong Answer",
            }),
          });
        }
      }
    } catch (err) {
      setOutput("Submission error - please try again");
      setVerdict("Submission Error");
      toast.error("Submission failed - please try again");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, id, isSubmitting, language, monacoLanguage, totalTestCases, user?._id]);

  const keyHandler = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) handleRun();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        if (!isSubmitting) handleSubmit();
      }
    },
    [handleRun, handleSubmit, isRunning, isSubmitting]
  );

  useEffect(() => {
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [keyHandler]);

  // AI analyze code
  const handleAnalyze = useCallback(async () => {
    const trimmed = (code || "").trim();
    if (!trimmed) {
      toast.info("Please enter some code before requesting analysis.");
      return;
    }
    setLoading(true);
    setFeedback("");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, language }),
      });
      const data = await response.json();
      const fb = data?.feedback || "No feedback received.";
      setFeedback(String(fb));
    } catch (error) {
      console.error("Error analyzing code:", error);
      setFeedback("Something went wrong while analyzing your code.");
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  // Generate hint for question
  const generateHint = useCallback(async (questionID) => {
    // Show loading state in UI by placing a placeholder hint
    setHints(["🤖 AI is analyzing the problem and generating hints..."]);

    try {
      const payload = {
        code: `Problem: ${question?.title || ""}\n\nDescription: ${question?.description || ""}\n\nConstraints: ${question?.constraints || ""}`,
        language: "hint-generation",
        questionData: {
          title: question?.title || "",
          description: question?.description || "",
          constraints: question?.constraints || "",
          testCases: Array.isArray(question?.testCases)
            ? question.testCases.slice(0, 2)
            : [],
        },
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const text = String(data?.feedback || "");

      if (text) {
        // Split into blocks by blank lines or single newlines
        const blocks = text.includes("\n\n")
          ? text.split("\n\n")
          : text.split("\n");
        let hintArray = blocks
          .map((h) => h.trim())
          .filter((h) => h.length > 0)
          .map((h) => h.replace(/^\d+\.\s*/, "")) // drop leading numbering
          .map((h) => (h.startsWith("💡") || h.startsWith("🎯") || h.startsWith("🧠") ? h : `💡 ${h}`))
          .filter((h) => h.length > 10);

        if (hintArray.length === 0) {
          hintArray = [
            "💡 Try breaking down the problem into smaller steps and think about the algorithm needed.",
          ];
        }
        setHints(hintArray);
        toast.success("AI hints generated successfully!");
      } else {
        setHints([
          "💡 Try breaking down the problem step by step.",
          "🎯 Consider the time and space complexity.",
          "🧠 Think about edge cases and constraints.",
        ]);
        toast.success("AI hints generated!");
      }
    } catch (err) {
      console.error("Error generating hints:", err);
      setHints([
        "💡 Break down the problem into smaller sub-problems.",
        "🎯 Consider what data structures might be helpful.",
        "🧠 Think about the algorithm's time complexity.",
        "⚡ Look for patterns in the sample test cases.",
      ]);
      toast.error("Error connecting to AI. Showing general hints instead.");
    }
  }, [question?.constraints, question?.description, question?.testCases, question?.title]);

  const handleLanguageChange = (value) => {
    if (value === language) return;
    setLanguage(value); // init effect will load appropriate code
    setHasUserEdited(false);
  };

  /* ---------- Render ---------- */

  const showVerdictChip = verdict && verdict !== "Running all test cases...";
  const safeTestCases = Array.isArray(question?.testCases) ? question.testCases : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] text-white">
      {/* Header */}
      <div className="bg-[#1e1e2e]/80 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-[#00FFC6] to-[#4ecdc4] rounded-full"></div>
            <h1 className="text-xl font-bold text-white">
              {question?.title || "Loading Problem..."}
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#00FFC6]/10 rounded-full">
              <div className="w-2 h-2 bg-[#00FFC6] rounded-full animate-pulse"></div>
              <span className="text-[#00FFC6] text-sm font-medium">AlgoJudgeX</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {typeof executionTime === "number" && (
              <div className="flex items-center gap-2 text-gray-400">
                <MdOutlineSpeed className="w-4 h-4" />
                <span className="text-sm">{executionTime}ms</span>
              </div>
            )}
            {typeof memoryUsed === "number" && (
              <div className="flex items-center gap-2 text-gray-400">
                <MdMemory className="w-4 h-4" />
                <span className="text-sm">{memoryUsed.toFixed(1)}MB</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Mobile toggle */}
        {isSmallScreen && (
          <motion.div
            className="flex mb-6 p-1 bg-[#1e1e2e]/50 rounded-xl backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setView("question")}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                view === "question"
                  ? "bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-[#2c2f4a]/50"
              }`}
            >
              📝 Problem
            </button>
            <button
              onClick={() => setView("editor")}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                view === "editor"
                  ? "bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-[#2c2f4a]/50"
              }`}
            >
              💻 Code
            </button>
          </motion.div>
        )}

        {/* Main content */}
        {isSmallScreen ? (
          <AnimatePresence mode="wait">
            {view === "question" && (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="overflow-auto"
              >
                <div className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] rounded-lg flex items-center justify-center">
                      <BiCodeAlt className="w-6 h-6 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] bg-clip-text text-transparent">
                      {question?.title}
                    </h1>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {question?.description}
                    </p>
                  </div>

                  {question?.constraints && (
                    <motion.div
                      className="p-6 mt-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-lg font-semibold mb-3 text-orange-400">
                        ⚠️ Constraints:
                      </h3>
                      <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                        {question?.constraints}
                      </pre>
                    </motion.div>
                  )}

                  <div className="mt-8 space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      📊 Sample Test Cases
                    </h3>
                    {safeTestCases.slice(0, 2).map((tc, index) => (
                      <motion.div
                        key={index}
                        className="grid gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {tc.input && (
                          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-5 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                                <span className="text-black text-xs font-bold">IN</span>
                              </div>
                              <h4 className="text-green-400 font-semibold">
                                Input #{index + 1}
                              </h4>
                            </div>
                            <pre className="bg-[#0d1117] text-green-300 p-4 rounded-lg overflow-auto whitespace-pre-wrap font-mono text-sm">
                              {tc.input}
                            </pre>
                          </div>
                        )}
                        {tc.output && (
                          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-5 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                                <span className="text-white text-xs font-bold">OUT</span>
                              </div>
                              <h4 className="text-blue-400 font-semibold">
                                Output #{index + 1}
                              </h4>
                            </div>
                            <pre className="bg-[#0d1117] text-blue-300 p-4 rounded-lg overflow-auto whitespace-pre-wrap font-mono text-sm">
                              {tc.output}
                            </pre>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => generateHint(id)}
                      className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-all duration-300"
                    >
                      <FaLightbulb className="mr-2" />
                      💡 Get AI Hint
                    </Button>

                    {Array.isArray(hints) && hints.length > 0 && (
                      <div className="mt-6">
                        <Accordion type="multiple" className="w-full space-y-3">
                          {hints.map((hint, index) => (
                            <AccordionItem
                              key={index}
                              value={`hint-${index}`}
                              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl px-4"
                            >
                              <AccordionTrigger className="text-purple-400 hover:text-purple-300">
                                💡 Hint {index + 1}
                              </AccordionTrigger>
                              <AccordionContent className="text-gray-300 pb-4">
                                {hint}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {view === "editor" && (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1a1b26] to-[#24253a] p-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-400 text-sm font-mono">
                          solution.{extensionMap[language] || "txt"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="bg-[#2c2f4a] text-white px-3 py-1 rounded-lg border border-gray-600 focus:border-[#00FFC6] focus:outline-none text-sm"
                        >
                          <option value="C++">C++</option>
                          <option value="Java">Java</option>
                          <option value="Python">Python</option>
                          <option value="JavaScript">JavaScript</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="h-[400px]">
                    <Editor
                      height="400px"
                      language={monacoLanguage}
                      value={code}
                      onChange={(val) => {
                        setCode(val || "");
                        setHasUserEdited(true);
                      }}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        lineNumbers: "on",
                        glyphMargin: true,
                        folding: true,
                        lineDecorationsWidth: 10,
                        renderLineHighlight: "all",
                        cursorBlinking: "smooth",
                        automaticLayout: true,
                      }}
                    />
                  </div>

                  <div className="p-4 bg-gradient-to-r from-[#1a1b26] to-[#24253a] border-t border-gray-700/50">
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex gap-3">
                        <motion.button
                          onClick={handleRun}
                          disabled={isRunning}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00FFC6]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isRunning ? (
                            <>
                              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                              Running...
                            </>
                          ) : (
                            <>
                              <BiRun className="w-5 h-5" />
                              Run Code
                            </>
                          )}
                        </motion.button>

                        <motion.button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="w-5 h-5" />
                              Submit Solution
                            </>
                          )}
                        </motion.button>
                      </div>

                      <motion.button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <FaRobot className="w-5 h-5" />
                            AI Analysis
                          </>
                        )}
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-gray-400 mb-2 font-medium">Test Input:</h4>
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Enter test input here..."
                          className="w-full h-24 bg-[#0d1117] text-green-300 p-3 rounded-lg border border-gray-600 focus:border-[#00FFC6] focus:outline-none resize-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {(output || verdict) && (
                  <motion.div
                    className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/30 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">OUT</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">Execution Result</h3>
                    </div>

                    <div className="space-y-4">
                      {output && (
                        <div>
                          <h4 className="text-gray-400 mb-2 font-medium">Output:</h4>
                          <pre className="bg-[#0d1117] text-green-300 p-4 rounded-lg overflow-auto whitespace-pre-wrap font-mono text-sm border border-gray-700">
                            {output}
                          </pre>
                        </div>
                      )}

                      {verdict && (
                        <div>
                          <h4 className="text-gray-400 mb-2 font-medium">Verdict:</h4>
                          <div
                            className={`p-4 rounded-lg border text-lg font-semibold ${
                              verdict === "Accepted" || verdict === "Sample Passed" || verdict === "Samples Passed"
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : verdict === "Running all test cases..." || verdict === "Running..."
                                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                                : verdict === "Failed" || verdict === "Wrong Answer" || verdict === "Runtime Error" || verdict === "Submission Error" || verdict === "Sample Failed" || verdict === "Samples Failed"
                                ? "bg-red-500/10 border-red-500/30 text-red-400"
                                : "bg-gray-500/10 border-gray-500/30 text-gray-300"
                            }`}
                          >
                            {verdict}
                          </div>

                          {showVerdictChip && verdict !== 'Executed' && totalTestCases > 0 && (
                            <div className="mt-4">
                              <h4 className="text-gray-400 mb-3 font-medium">Test Cases:</h4>
                              <div className="flex flex-wrap gap-2">
                                {Array.from({ length: totalTestCases }, (_, idx) => {
                                  const item = testCaseResults[idx];
                                  const isPassed = item?.passed === true || verdict === 'Accepted';
                                  const isFail = item?.passed === false || idx === failedCaseIndex;
                                  return (
                                    <div
                                      key={idx}
                                      className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                                        isFail
                                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                          : "bg-green-500/20 text-green-400 border border-green-500/30"
                                      }`}
                                    >
                                      {isFail ? <FaBug className="w-4 h-4" /> : <FaCheckCircle className="w-4 h-4" />}
                                      Test {idx + 1}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <Split
            className="flex h[calc(100vh-40px)] gap-4"
            sizes={[50, 50]}
            minSize={300}
            gutterSize={10}
            direction="horizontal"
          >
            {/* Left Panel */}
            <div className="bg-[#1E1E2E] p-6 rounded-xl shadow-lg overflow-auto">
              <h1 className="text-3xl font-bold text-blue-400">{question?.title}</h1>
              <p className="text-gray-300 mt-4 leading-relaxed">{question?.description}</p>

              {question?.constraints && (
                <div className="p-4 mt-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold mb-2">Constraints:</h3>
                  <pre className="text-gray-300 whitespace-pre-wrap">{question?.constraints}</pre>
                </div>
              )}

              {safeTestCases.slice(0, 2).map((tc, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3">
                  {tc.input && (
                    <div className="bg-[#10131c] p-4 rounded-lg border border-[#2e354a]">
                      <h3 className="text-md font-medium text-gray-300 mb-1 mt-1">💡 Input #{index + 1}</h3>
                      <pre className="bg-[#1e1e2e] text-green-400 p-3 rounded overflow-auto whitespace-pre-wrap">
                        {tc.input}
                      </pre>
                    </div>
                  )}
                  {tc.output && (
                    <div className="bg-[#10131c] p-4 rounded-lg border border-[#2e354a]">
                      <h3 className="text-md font-medium text-gray-300 mb-1 mt-1">✅ Output #{index + 1}</h3>
                      <pre className="bg-[#1e1e2e] text-yellow-300 p-3 rounded overflow-auto whitespace-pre-wrap">
                        {tc.output}
                      </pre>
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-6">
                <Button
                  onClick={() => generateHint(id)}
                  title="Ask AI for a contextual hint"
                  className="relative group overflow-hidden border border-[#00FFC6]/40 text-[#00FFC6] bg-transparent hover:text-black transition-colors duration-300 rounded-md px-5 py-2 font-medium"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#00FFC6] via-[#27eebd] to-[#4ecdc4] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2">
                    <FaLightbulb className="text-yellow-300 group-hover:text-black transition-colors" />
                    <span>Generate Hint</span>
                  </span>
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-px bg-gradient-to-r from-transparent via-[#00FFC6] to-transparent transition-all duration-500" />
                </Button>

                {Array.isArray(hints) && hints.length > 0 ? (
                  <div className="my-4">
                    <Accordion type="multiple" className="w-full">
                      {hints.map((hint, index) => (
                        <AccordionItem key={index} value={`hint-${index}`}>
                          <AccordionTrigger>Hint {index + 1}</AccordionTrigger>
                          <AccordionContent>{hint}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-4">No hints available.</p>
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col space-y-4 overflow-auto p-2">
              <div className="flex flex-wrap gap-3 items-center bg-[#1e1f2f] border border-gray-700/60 rounded-xl p-3 shadow-inner">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 pl-1">
                    Language
                  </span>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[170px] bg-[#25283b] border-gray-600 text-gray-200 h-10 focus:border-[#00FFC6] focus:ring-0 focus:outline-none text-sm">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e2230] border border-gray-700 text-gray-200 shadow-xl">
                      {["C++", "Python", "Java", "JavaScript"].map((l) => (
                        <SelectItem
                          key={l}
                          value={l}
                          className={
                            "data-[state=checked]:bg-[#00FFC6] data-[state=checked]:text-black focus:bg-[#2d3345] focus:text-white cursor-pointer text-sm"
                          }
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{l}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg[#30394d] text-gray-300 font-mono">
                              .{extensionMap[l]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2 ml-auto">
                  <motion.button
                    onClick={handleRun}
                    disabled={isRunning}
                    title="Run (Ctrl+Enter)"
                    className="px-4 h-10 flex items-center gap-2 bg-gradient-to-r from-[#00FFC6] to-[#4ecdc4] text-black font-semibold rounded-lg hover:shadow hover:shadow-[#00FFC6]/30 transition disabled:opacity-50"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {isRunning ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <BiRun className="w-4 h-4" />
                    )}
                    {isRunning ? "Running" : "Run"}
                  </motion.button>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    title="Submit (Ctrl+Shift+Enter)"
                    className="px-4 h-10 flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow hover:shadow-green-600/30 transition disabled:opacity-50"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaCheckCircle className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Submitting" : "Submit"}
                  </motion.button>

                  <motion.button
                    onClick={handleAnalyze}
                    disabled={loading}
                    title="AI Analysis"
                    className="px-4 h-10 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow hover:shadow-blue-600/30 transition disabled:opacity-50"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaRobot className="w-4 h-4" />
                    )}
                    {loading ? "Analyzing" : "AI"}
                  </motion.button>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden shadow-lg shadow-black/20">
                {!editorReady && (
                  <div className="w-full h-[300px] flex flex-col items-center justify-center gap-3 bg-[#141823] animate-pulse">
                    <div className="w-10 h-10 border-4 border-[#00FFC6] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Initializing editor...</p>
                  </div>
                )}
                <Editor
                  height="300px"
                  language={monacoLanguage}
                  value={code}
                  onChange={(val) => {
                    setCode(val || "");
                    setHasUserEdited(true);
                  }}
                  theme="vs-dark"
                  onMount={() => setEditorReady(true)}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    smoothScrolling: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-400 px-1">
                <div className="flex items-center gap-1 bg-[#242b3a] px-2 py-1 rounded-md border border-gray-600/40">
                  <code className="font-mono">Ctrl+Enter</code>
                  <span>Run</span>
                </div>
                <div className="flex items-center gap-1 bg-[#242b3a] px-2 py-1 rounded-md border border-gray-600/40">
                  <code className="font-mono">Ctrl+Shift+Enter</code>
                  <span>Submit</span>
                </div>
                {monacoLanguage === "plaintext" && <span className="text-amber-400">Fallback: plaintext</span>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-white mb-2">Input</h3>
                  <Textarea
                    className="bg-[#1e1e1e] text-white"
                    rows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter test input here..."
                  />
                </div>
                <div>
                  <h3 className="text-white mb-2">Output</h3>
                  <Textarea className="bg-[#1e1e1e] text-white" rows={4} value={output} readOnly />
                </div>
              </div>

              <div className="mt-2 p-4 border rounded bg-[#1e1e2f]">
                <h3 className="text-white text-lg font-semibold mb-2">Verdict:</h3>
                <p
                  className={`text-lg mb-4 ${
                    verdict === "Accepted" || verdict === "Sample Passed" || verdict === "Samples Passed"
                      ? "text-green-500"
                      : verdict === "Running all test cases..." || verdict === "Running..."
                      ? "text-yellow-400"
                      : verdict === "Failed" || verdict === "Wrong Answer" || verdict === "Runtime Error" || verdict === "Submission Error" || verdict === "Sample Failed" || verdict === "Samples Failed"
                      ? "text-red-500"
                      : "text-white"
                  }`}
                >
                  {verdict || ""}
                </p>

                {showVerdictChip && verdict !== 'Executed' && totalTestCases > 0 && (
                  <div className="flex space-x-2 flex-wrap">
                    {Array.from({ length: totalTestCases }, (_, idx) => {
                      const testResult = testCaseResults[idx];
                      const isPassed = testResult ? testResult.passed === true : verdict === 'Accepted';
                      return (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded text-white text-sm font-medium ${
                            isPassed ? "bg-green-600" : "bg-red-600"
                          }`}
                        >
                          Testcase {idx + 1}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Split>
        )}

        {/* Feedback Modal */}
        {feedback && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
            <div className="relative bg-gradient-to-br from-[#1c1f33]/80 to-[#2c2f4a]/90 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden border border-white/10 backdrop-blur-lg">
              <button
                onClick={() => setFeedback("")}
                className="absolute top-3 right-4 text-white hover:text-red-500 text-2xl font-bold z-10"
                aria-label="Close"
              >
                &times;
              </button>

              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">🧠 Gemini Code Review</h2>
              </div>

              <div className="p-5 overflow-y-auto max-h-[65vh] text-sm leading-relaxed custom-scrollbar text-gray-300 whitespace-pre-wrap">
                <span
                  dangerouslySetInnerHTML={{
                    __html: String(feedback).replace(/\*\*(.*?)\*\*/g, `<span class='text-white font-medium'>$1</span>`),
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;

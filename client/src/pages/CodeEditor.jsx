import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { Button } from "@/components/ui/button";
import { FaRobot, FaPlay, FaCheckCircle, FaBug, FaClock, FaLightbulb } from "react-icons/fa";
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

const boilerplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // your code goes here
    return 0;
}`,
  python: `# your code goes here
print("Hello, world!")`,
  java: `public class Main {
    public static void main(String[] args) {
        // your code goes here
    }
}`,
  javascript: `// your code goes here
console.log("Hello, world!");`,
};

const languageMap = {
  "C++": "cpp",
  Python: "python",
  Java: "java",
  JavaScript: "javascript",
};

const CodeEditor = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [hints, setHints] = useState([]);
  const [language, setLanguage] = useState("C++");
  const [code, setCode] = useState(boilerplates["cpp"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [failedCaseIndex, setFailedCaseIndex] = useState(-1);
  const [totalTestCases, setTotalTestCases] = useState(0);
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [view, setView] = useState("question"); // for small screens toggle
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [memoryUsed, setMemoryUsed] = useState(null);

  useEffect(() => {
    // Listener to check screen width
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // md breakpoint at 768px
    };
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/questions/${id}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setQuestion(data);
        setTotalTestCases(data.testCases.length || 0);
      } catch (err) {
        console.error("Failed to fetch question", err);
        setQuestion(null);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleLanguageChange = (value) => {
    setLanguage(value);
    setCode(boilerplates[languageMap[value]]);
  };

  const generateHint = async (questionID) => {
    try {
      // Show loading state
      setHints(["🤖 AI is analyzing the problem and generating hints..."]);
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: `Problem: ${question?.title}\n\nDescription: ${question?.description}\n\nConstraints: ${question?.constraints}`,
            language: "hint-generation",
            questionData: {
              title: question?.title,
              description: question?.description,
              constraints: question?.constraints,
              testCases: question?.testCases?.slice(0, 2) || []
            }
          }),
        }
      );

      const data = await response.json();

      if (data.feedback) {
        // Parse the AI response to extract hints
        let hintsText = data.feedback;
        
        // Try to extract numbered hints or split by common separators
        let hintArray = [];
        
        if (hintsText.includes('\n\n')) {
          hintArray = hintsText.split('\n\n').filter(hint => hint.trim().length > 0);
        } else if (hintsText.includes('\n')) {
          hintArray = hintsText.split('\n').filter(hint => hint.trim().length > 0);
        } else {
          hintArray = [hintsText];
        }
        
        // Clean up hints and ensure they're useful
        hintArray = hintArray.map((hint, index) => {
          let cleanHint = hint.trim();
          // Remove numbers if they exist at the beginning
          cleanHint = cleanHint.replace(/^\d+\.\s*/, '');
          // Add hint emoji if not present
          if (!cleanHint.startsWith('💡') && !cleanHint.startsWith('🎯') && !cleanHint.startsWith('🧠')) {
            cleanHint = `💡 ${cleanHint}`;
          }
          return cleanHint;
        }).filter(hint => hint.length > 10); // Filter out very short hints
        
        setHints(hintArray.length > 0 ? hintArray : ["💡 Try breaking down the problem into smaller steps and think about the algorithm needed."]);
        toast.success("🧠 AI hints generated successfully!");
      } else {
        setHints(["💡 Try breaking down the problem step by step.", "🎯 Consider the time and space complexity.", "🧠 Think about edge cases and constraints."]);
        toast.success("AI hints generated!");
      }

    } catch (err) {
      console.error("Error generating hints:", err);
      setHints([
        "💡 Break down the problem into smaller sub-problems.",
        "🎯 Consider what data structures might be helpful.",
        "🧠 Think about the algorithm's time complexity.",
        "⚡ Look for patterns in the sample test cases."
      ]);
      toast.error("Error connecting to AI. Showing general hints instead.");
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setVerdict("Running...");
    setOutput("");
    setExecutionTime(null);
    setMemoryUsed(null);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: languageMap[language],
            code,
            input,
          }),
        }
      );
      const result = await response.json();
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setMemoryUsed(Math.random() * 50 + 10); // Mock memory usage for now

      if (result.output) {
        setOutput(result.output);

        if (
          result.output.includes("Traceback") ||
          result.output.toLowerCase().includes("error") ||
          result.output.toLowerCase().includes("exception")
        ) {
          setVerdict("Runtime Error");
          toast.error("Code execution failed with errors");
        } else {
          setVerdict("Success");
          toast.success("Code executed successfully!");
        }
      } else {
        setOutput(result.error || "Unknown error");
        setVerdict("Runtime Error");
        toast.error("Code execution failed");
      }
    } catch (err) {
      setOutput("Error executing code");
      setVerdict("Runtime Error");
      toast.error("Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setVerdict("Running all test cases...");
    setOutput("");
    setTestCaseResults([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/questions/${id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: languageMap[language],
            code,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setOutput("🎉 All test cases passed! Great job!");
        setVerdict("Accepted");
        setFailedCaseIndex(-1);
        setTestCaseResults(Array(totalTestCases).fill({ passed: true }));
        toast.success("🎉 Solution accepted! All test cases passed!");

        const response2 = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/submissions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user._id,
              questionId: id,
              code,
              language,
              status: "Accepted",
            }),
          }
        );
      } else {
        setVerdict("Wrong Answer");
        setFailedCaseIndex(result.failedCaseIndex);
        const resultsArray = [];
        for (let i = 0; i < totalTestCases; i++) {
          if (i < result.failedCaseIndex) {
            resultsArray.push({ passed: true });
          } else if (i === result.failedCaseIndex) {
            resultsArray.push({
              passed: false,
              expected: result.expected,
              actual: result.actual,
            });
          } else {
            resultsArray.push({ passed: null });
          }
        }
        setTestCaseResults(resultsArray);

        setOutput(
          `❌ Test case #${result.failedCaseIndex + 1} failed\n\nExpected Output:\n${
            result.expected
          }\n\nYour Output:\n${result.actual}\n\n💡 Check your logic and try again!`
        );
        
        toast.error(`Wrong answer on test case ${result.failedCaseIndex + 1}`);

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
    } catch (err) {
      setOutput("❌ Submission error - please try again");
      setVerdict("Submission Error");
      toast.error("Submission failed - please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      alert("Please enter some code.");
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language }),
        }
      );
      // console.log(code);
      // console.log(language);
      // console.log(response);
      const data = await response.json();
      console.log(data);
      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error analyzing code:", error);
      setFeedback("Something went wrong while analyzing your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#161A30] to-[#1a1f2e] text-white">
      {/* Enhanced Header */}
      <div className="bg-[#1e1e2e]/80 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-[#00FFC6] to-[#4ecdc4] rounded-full"></div>
            <h1 className="text-xl font-bold text-white">{question?.title || "Loading Problem..."}</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#00FFC6]/10 rounded-full">
              <div className="w-2 h-2 bg-[#00FFC6] rounded-full animate-pulse"></div>
              <span className="text-[#00FFC6] text-sm font-medium">AlgoJudgeX</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {executionTime && (
              <div className="flex items-center gap-2 text-gray-400">
                <MdOutlineSpeed className="w-4 h-4" />
                <span className="text-sm">{executionTime}ms</span>
              </div>
            )}
            {memoryUsed && (
              <div className="flex items-center gap-2 text-gray-400">
                <MdMemory className="w-4 h-4" />
                <span className="text-sm">{memoryUsed.toFixed(1)}MB</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Small Screen Toggle Buttons */}
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

        {/* Main Content */}
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
                {/* Enhanced Question Panel */}
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
                      <h3 className="text-lg font-semibold mb-3 text-orange-400">⚠️ Constraints:</h3>
                      <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                        {question?.constraints}
                      </pre>
                    </motion.div>
                  )}

                  {/* Enhanced Test Cases */}
                  <div className="mt-8 space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">📊 Sample Test Cases</h3>
                    {question?.testCases.slice(0, 2).map((tc, index) => (
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
                              <h4 className="text-green-400 font-semibold">Input #{index + 1}</h4>
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
                              <h4 className="text-blue-400 font-semibold">Output #{index + 1}</h4>
                            </div>
                            <pre className="bg-[#0d1117] text-blue-300 p-4 rounded-lg overflow-auto whitespace-pre-wrap font-mono text-sm">
                              {tc.output}
                            </pre>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Enhanced Hints Section */}
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

                    {hints && hints.length > 0 && (
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
                {/* Enhanced Code Editor Panel */}
                <div className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2c2f4a]/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/30 overflow-hidden">
                  {/* Editor Header */}
                  <div className="bg-gradient-to-r from-[#1a1b26] to-[#24253a] p-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-400 text-sm font-mono">
                          solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={language}
                          onChange={handleLanguageChange}
                          className="bg-[#2c2f4a] text-white px-3 py-1 rounded-lg border border-gray-600 focus:border-[#00FFC6] focus:outline-none text-sm"
                        >
                          <option value="cpp">C++</option>
                          <option value="java">Java</option>
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="h-[400px]">
                    <Editor
                      height="400px"
                      language={languageMap[language]}
                      value={code}
                      onChange={setCode}
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

                  {/* Action Buttons */}
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

                    {/* Input Section */}
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

                {/* Enhanced Output Section */}
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
                          <div className={`p-4 rounded-lg border text-lg font-semibold ${
                            verdict === "Success"
                              ? "bg-green-500/10 border-green-500/30 text-green-400"
                              : verdict === "Running all test cases..." || verdict === "Running..."
                              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                              : verdict === "Failed"
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : "bg-gray-500/10 border-gray-500/30 text-gray-300"
                          }`}>
                            {verdict}: {output}
                          </div>

                          {/* Test Cases Status */}
                          {verdict && verdict !== "Running all test cases..." && totalTestCases > 0 && (
                            <div className="mt-4">
                              <h4 className="text-gray-400 mb-3 font-medium">Test Cases:</h4>
                              <div className="flex flex-wrap gap-2">
                                {[...Array(totalTestCases).keys()].map((idx) => {
                                  const isPassed = verdict === "Success" || idx !== failedCaseIndex;
                                  return (
                                    <div
                                      key={idx}
                                      className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                                        isPassed 
                                          ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                                      }`}
                                    >
                                      {isPassed ? (
                                        <FaCheckCircle className="w-4 h-4" />
                                      ) : (
                                        <FaBug className="w-4 h-4" />
                                      )}
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
            className="flex h-[calc(100vh-40px)] gap-4"
            sizes={[50, 50]}
            minSize={300}
            gutterSize={10}
            direction="horizontal"
          >
          {/* Left Panel */}
          <div className="bg-[#1E1E2E] p-6 rounded-xl shadow-lg overflow-auto">
            <h1 className="text-3xl font-bold text-blue-400">
              {question?.title}
            </h1>
            <p className="text-gray-300 mt-4 leading-relaxed">
              {question?.description}
            </p>

            {question?.constraints && (
              <div className="p-4 mt-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-2">Constraints:</h3>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {question?.constraints}
                </pre>
              </div>
            )}

            {question?.testCases.slice(0, 2).map((tc, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3"
              >
                {tc.input && (
                  <div className="bg-[#10131c] p-4 rounded-lg border border-[#2e354a]">
                    <h3 className="text-md font-medium text-gray-300 mb-1 mt-1">
                      💡 Input #{index + 1}
                    </h3>
                    <pre className="bg-[#1e1e2e] text-green-400 p-3 rounded overflow-auto whitespace-pre-wrap">
                      {tc.input}
                    </pre>
                  </div>
                )}
                {tc.output && (
                  <div className="bg-[#10131c] p-4 rounded-lg border border-[#2e354a]">
                    <h3 className="text-md font-medium text-gray-300 mb-1 mt-1">
                      ✅ Output #{index + 1}
                    </h3>
                    <pre className="bg-[#1e1e2e] text-yellow-300 p-3 rounded overflow-auto whitespace-pre-wrap">
                      {tc.output}
                    </pre>
                  </div>
                )}
              </div>
            ))}
            <div className="mt-6">
              <Button variant="outline" onClick={() => generateHint(id)}>
                💡 Generate Hint
              </Button>

              {hints && hints.length > 0 ? (
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
                <p className="text-sm text-gray-500 italic mt-4">
                  No hints available.
                </p>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col space-y-4 overflow-auto p-2">
            <div className="flex justify-between items-center">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C++">C++</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Java">Java</SelectItem>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-x-2">
                <Button variant="secondary" onClick={handleRun}>
                  Run
                </Button>
                <Button onClick={handleSubmit}>Submit</Button>
                <Button
                  onClick={handleAnalyze}
                  className="bg-blue-600 hover:bg-blue-700 text-white  font-semibold"
                >
                  {loading ? "Analyzing..." : <FaRobot />}
                </Button>
              </div>
            </div>

            <div className="border rounded overflow-hidden">
              <Editor
                height="300px"
                language={languageMap[language]}
                value={code}
                onChange={(val) => setCode(val)}
                theme="vs-dark"
              />
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
                <Textarea
                  className="bg-[#1e1e1e] text-white"
                  rows={4}
                  value={output}
                  readOnly
                />
              </div>
            </div>

            <div className="mt-2 p-4 border rounded bg-[#1e1e2f]">
              <h3 className="text-white text-lg font-semibold mb-2">
                Verdict:
              </h3>
              <p
                className={`text-lg mb-4 ${
                  verdict === "Success"
                    ? "text-green-500"
                    : verdict === "Running all test cases..." ||
                      verdict === "Running..."
                    ? "text-yellow-400"
                    : verdict === "Failed"
                    ? "text-red-500"
                    : "text-white"
                }`}
              >
                {verdict ? `${verdict}: ${output}` : ""}
              </p>

              {/* Show test cases only if verdict is not empty, not running, and totalTestCases > 0 */}
              {verdict &&
                verdict !== "Running all test cases..." &&
                totalTestCases > 0 && (
                  <div className="flex space-x-2 flex-wrap">
                    {[...Array(totalTestCases).keys()].map((idx) => {
                      const isPassed =
                        verdict === "Success" || idx !== failedCaseIndex;
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

      {feedback && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
          <div className="relative bg-gradient-to-br from-[#1c1f33]/80 to-[#2c2f4a]/90 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden border border-white/10 backdrop-blur-lg">
            {/* Close Button */}
            <button
              onClick={() => setFeedback(false)}
              className="absolute top-3 right-4 text-white hover:text-red-500 text-2xl font-bold z-10"
              aria-label="Close"
            >
              &times;
            </button>

            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🧠 Gemini Code Review
              </h2>
            </div>

            {/* Feedback Content (Scrollable + Colored Text) */}
            <div className="p-5 overflow-y-auto max-h-[65vh] text-sm leading-relaxed custom-scrollbar text-gray-300 whitespace-pre-wrap">
              <span
                dangerouslySetInnerHTML={{
                  __html: feedback.replace(
                    /\*\*(.*?)\*\*/g,
                    `<span class='text-white font-medium'>$1</span>`
                  ),
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

const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/authMiddleware");
const Question = require("../models/questionModel.js");
const axios = require("axios");
const dotenv = require("dotenv");
const fetch=require("node-fetch")
dotenv.config();

const backendurl= process.env.BACKEND_URL;

// Sample questions data
const sampleQuestions = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
    constraints: `• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.`,
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" },
      { input: "[3,3]\n6", output: "[0,1]" }
    ],
    hints: [
      "Try using a hash map to store the numbers you've seen so far",
      "For each number, check if (target - current_number) exists in your hash map"
    ],
    referenceCode: [
      {
        language: "javascript",
        code: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`
      },
      {
        language: "python",
        code: `def twoSum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []`
      }
    ]
  },
  {
    title: "Palindrome Number",
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

**Example 1:**
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

**Example 2:**
Input: x = -121
Output: false`,
    constraints: `• -2^31 <= x <= 2^31 - 1`,
    testCases: [
      { input: "121", output: "true" },
      { input: "-121", output: "false" },
      { input: "10", output: "false" }
    ],
    hints: [
      "Negative numbers are not palindromes",
      "Convert to string and check if it reads the same forwards and backwards"
    ],
    referenceCode: [
      {
        language: "javascript",
        code: `function isPalindrome(x) {
    if (x < 0) return false;
    
    const str = x.toString();
    let left = 0;
    let right = str.length - 1;
    
    while (left < right) {
        if (str[left] !== str[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}`
      }
    ]
  },
  {
    title: "FizzBuzz",
    description: `Given an integer n, return a string array answer (1-indexed) where:

• answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
• answer[i] == "Fizz" if i is divisible by 3.
• answer[i] == "Buzz" if i is divisible by 5.
• answer[i] == i (as a string) if none of the above conditions are true.

**Example:**
Input: n = 15
Output: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]`,
    constraints: `• 1 <= n <= 10^4`,
    testCases: [
      { input: "3", output: '["1","2","Fizz"]' },
      { input: "5", output: '["1","2","Fizz","4","Buzz"]' }
    ],
    hints: [
      "Check divisibility by 15 first (both 3 and 5)",
      "Use modulo operator (%) to check divisibility"
    ],
    referenceCode: [
      {
        language: "javascript",
        code: `function fizzBuzz(n) {
    const result = [];
    
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) {
            result.push("FizzBuzz");
        } else if (i % 3 === 0) {
            result.push("Fizz");
        } else if (i % 5 === 0) {
            result.push("Buzz");
        } else {
            result.push(i.toString());
        }
    }
    
    return result;
}`
      }
    ]
  }
];


// Seed database with sample questions
router.post("/seed", async (req, res) => {
  try {
    // Clear existing questions (optional)
    await Question.deleteMany({});
    
    // Insert sample questions
    const insertedQuestions = await Question.insertMany(sampleQuestions);
    
    res.status(201).json({
      message: `Successfully seeded ${insertedQuestions.length} sample questions`,
      questions: insertedQuestions.map(q => ({ id: q._id, title: q.title }))
    });
  } catch (error) {
    console.error("Error seeding questions:", error);
    res.status(500).json({ 
      message: "Failed to seed questions", 
      error: error.message 
    });
  }
});

// GET all questions
router.get("/", async (req, res) => {
  const questions = await Question.find();
  res.json(questions);
});

// POST new question
router.post("/", isAdmin, async (req, res) => {
  const question = new Question(req.body);
  await question.save();
  res.status(201).json(question);
});

// PUT update question
router.put("/:id", isAdmin, async (req, res) => {
  const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

// DELETE a question
router.delete("/:id", isAdmin, async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

//GET question by ID
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question,);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching question" });
  }
});

//GENERATE AI hints
router.post('/generate-hints/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Call n8n webhook
    const response = await fetch('https://bathinanna.app.n8n.cloud/webhook-test/webhook/hint-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: questionId,
        title: question.title,
        description: question.description
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'n8n failed to generate hints' });
    }

    const result = await response.json();
    const rawOutput = result[0]?.output;
    if (!rawOutput) {
      return res.status(500).json({ error: 'Invalid format received from n8n' });
    }

    
    const hintsArray = rawOutput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')); 

    if (hintsArray.length === 0) {
      return res.status(500).json({ error: 'No hints extracted from n8n output' });
    }

    question.hints = hintsArray;
    await question.save();

    res.json({
      message: 'Hints generated successfully',
      questionId,
      hints: hintsArray
    });

  } catch (error) {
    console.error('Error generating hints:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/:id/reference-code", async (req, res) => {
  const { id } = req.params
  console.log(id);
  const { cpp, python, java, javascript } = req.body

  try {
    const question = await Question.findById(id)
    if (!question) {
      return res.status(404).json({ error: "Question not found" })
    }

    
    let updatedSolutions = question.referenceCode.filter(
      (sol) => !["cpp", "python", "java", "javascript"].includes(sol.language)
    )

    const newSolutions = []

    if (cpp) newSolutions.push({ language: "cpp", code: cpp })
    if (python) newSolutions.push({ language: "python", code: python })
    if (java) newSolutions.push({ language: "java", code: java })
    if (javascript) newSolutions.push({ language: "javascript", code: javascript })

    // Replace existing languages with new values
    newSolutions.forEach((newSol) => {
      const existingIndex = question.referenceCode.findIndex(
        (sol) => sol.language === newSol.language
      )
      if (existingIndex !== -1) {
        question.referenceCode[existingIndex].code = newSol.code
      } else {
        question.referenceCode.push(newSol)
      }
    })

    await question.save()

    res.status(200).json({
      message: "Reference solutions updated successfully",
      referenceCode: question.referenceCode,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/:id/reference-code", async (req, res) => {
  const questionId = req.params.id;
  try {
    const question = await Question.findById(questionId); 
    if (!question || !question.referenceCode) {
      return res.status(404).json({ error: "Reference code not found." });
    }
    res.json({ referenceCode: question.referenceCode });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/:id/submit", async (req, res) => {
  const { id } = req.params;
  const { language, code } = req.body;

  try {
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const testCases = question.testCases;

    for (let i = 0; i < testCases.length; i++) {
      const { input, output: expectedOutput } = testCases[i];

      const response = await axios.post(`${backendurl}/execute`, {
        language,
        code,
        input,
      });

      const resultOutput = response.data.output?.trim();
      const expected = expectedOutput?.trim();

      if (resultOutput !== expected) {
        return res.json({
          success: false,
          failedCaseIndex: i,
          expected,
          actual: resultOutput,
        });
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Submission error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;

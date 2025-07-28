const mongoose = require("mongoose");
const Question = require("../models/questionModel.js");
require("dotenv").config();

const sampleQuestions = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
Input: nums = [3,2,4], target = 6
Output: [1,2]

**Example 3:**
Input: nums = [3,3], target = 6
Output: [0,1]`,
    constraints: `• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.`,
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]"
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]"
      },
      {
        input: "[3,3]\n6",
        output: "[0,1]"
      }
    ],
    hints: [
      "Try using a hash map to store the numbers you've seen so far",
      "For each number, check if (target - current_number) exists in your hash map",
      "Store both the value and its index in the hash map"
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
      },
      {
        language: "cpp",
        code: `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        
        map[nums[i]] = i;
    }
    
    return {};
}`
      },
      {
        language: "java",
        code: `import java.util.HashMap;
import java.util.Map;

public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        
        map.put(nums[i], i);
    }
    
    return new int[]{};
}`
      }
    ]
  },
  {
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.

**Example 1:**
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

**Example 2:**
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]`,
    constraints: `• 1 <= s.length <= 10^5
• s[i] is a printable ascii character.`,
    testCases: [
      {
        input: '["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]'
      },
      {
        input: '["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]'
      }
    ],
    hints: [
      "Use two pointers approach - one at the beginning and one at the end",
      "Swap characters and move pointers towards each other",
      "Continue until the pointers meet in the middle"
    ],
    referenceCode: [
      {
        language: "javascript",
        code: `function reverseString(s) {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // Swap characters
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
    
    return s;
}`
      },
      {
        language: "python",
        code: `def reverseString(s):
    left, right = 0, len(s) - 1
    
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    
    return s`
      },
      {
        language: "cpp",
        code: `#include <vector>
using namespace std;

void reverseString(vector<char>& s) {
    int left = 0;
    int right = s.size() - 1;
    
    while (left < right) {
        swap(s[left], s[right]);
        left++;
        right--;
    }
}`
      },
      {
        language: "java",
        code: `public void reverseString(char[] s) {
    int left = 0;
    int right = s.length - 1;
    
    while (left < right) {
        char temp = s[left];
        s[left] = s[right];
        s[right] = temp;
        left++;
        right--;
    }
}`
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
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

**Example 3:**
Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.`,
    constraints: `• -2^31 <= x <= 2^31 - 1`,
    testCases: [
      {
        input: "121",
        output: "true"
      },
      {
        input: "-121",
        output: "false"
      },
      {
        input: "10",
        output: "false"
      },
      {
        input: "0",
        output: "true"
      }
    ],
    hints: [
      "Negative numbers are not palindromes",
      "You can convert to string and check if it reads the same forwards and backwards",
      "Alternative: Reverse the number mathematically and compare with original"
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
      },
      {
        language: "python",
        code: `def isPalindrome(x):
    if x < 0:
        return False
    
    s = str(x)
    return s == s[::-1]`
      },
      {
        language: "cpp",
        code: `#include <string>
using namespace std;

bool isPalindrome(int x) {
    if (x < 0) return false;
    
    string s = to_string(x);
    int left = 0, right = s.length() - 1;
    
    while (left < right) {
        if (s[left] != s[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}`
      },
      {
        language: "java",
        code: `public boolean isPalindrome(int x) {
    if (x < 0) return false;
    
    String s = String.valueOf(x);
    int left = 0, right = s.length() - 1;
    
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) {
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

**Example 1:**
Input: n = 3
Output: ["1","2","Fizz"]

**Example 2:**
Input: n = 5
Output: ["1","2","Fizz","4","Buzz"]

**Example 3:**
Input: n = 15
Output: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]`,
    constraints: `• 1 <= n <= 10^4`,
    testCases: [
      {
        input: "3",
        output: '["1","2","Fizz"]'
      },
      {
        input: "5",
        output: '["1","2","Fizz","4","Buzz"]'
      },
      {
        input: "15",
        output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]'
      }
    ],
    hints: [
      "Check divisibility by 15 first (both 3 and 5)",
      "Then check divisibility by 3, then by 5",
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
      },
      {
        language: "python",
        code: `def fizzBuzz(n):
    result = []
    
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    
    return result`
      },
      {
        language: "cpp",
        code: `#include <vector>
#include <string>
using namespace std;

vector<string> fizzBuzz(int n) {
    vector<string> result;
    
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) {
            result.push_back("FizzBuzz");
        } else if (i % 3 == 0) {
            result.push_back("Fizz");
        } else if (i % 5 == 0) {
            result.push_back("Buzz");
        } else {
            result.push_back(to_string(i));
        }
    }
    
    return result;
}`
      },
      {
        language: "java",
        code: `import java.util.ArrayList;
import java.util.List;

public List<String> fizzBuzz(int n) {
    List<String> result = new ArrayList<>();
    
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) {
            result.add("FizzBuzz");
        } else if (i % 3 == 0) {
            result.add("Fizz");
        } else if (i % 5 == 0) {
            result.add("Buzz");
        } else {
            result.add(String.valueOf(i));
        }
    }
    
    return result;
}`
      }
    ]
  },
  {
    title: "Maximum Subarray",
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

**Example 1:**
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

**Example 2:**
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.

**Example 3:**
Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.`,
    constraints: `• 1 <= nums.length <= 10^5
• -10^4 <= nums[i] <= 10^4`,
    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        output: "6"
      },
      {
        input: "[1]",
        output: "1"
      },
      {
        input: "[5,4,-1,7,8]",
        output: "23"
      }
    ],
    hints: [
      "This is a classic dynamic programming problem (Kadane's Algorithm)",
      "Keep track of the maximum sum ending at each position",
      "If the current sum becomes negative, restart from the current element"
    ],
    referenceCode: [
      {
        language: "javascript",
        code: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}`
      },
      {
        language: "python",
        code: `def maxSubArray(nums):
    max_sum = current_sum = nums[0]
    
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum`
      },
      {
        language: "cpp",
        code: `#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.size(); i++) {
        currentSum = max(nums[i], currentSum + nums[i]);
        maxSum = max(maxSum, currentSum);
    }
    
    return maxSum;
}`
      },
      {
        language: "java",
        code: `public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}`
      }
    ]
  }
];

async function seedQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing questions (optional)
    await Question.deleteMany({});
    console.log("Cleared existing questions");

    // Insert sample questions
    const insertedQuestions = await Question.insertMany(sampleQuestions);
    console.log(`✅ Successfully inserted ${insertedQuestions.length} sample questions:`);
    
    insertedQuestions.forEach((question, index) => {
      console.log(`${index + 1}. ${question.title} (ID: ${question._id})`);
    });

    console.log("\n🎉 Database seeded successfully!");
    console.log("You can now visit localhost:5173/questions to see the problems");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seeding function
if (require.main === module) {
  seedQuestions();
}

module.exports = { seedQuestions, sampleQuestions };

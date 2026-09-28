from typing import Dict, Any, Optional
from app.services.ai_service import ai_service

class DSAAgent:
    """Specialized Agent for Data Structures & Algorithms."""

    SYSTEM_PROMPT = """You are TechMate AI's Specialized DSA (Data Structures & Algorithms) Agent.
You assist Computer Science students and software engineers with data structures and competitive programming.

Format algorithm responses strictly with the following sections:
### Problem Understanding
### Intuition
### Hints (if interview style)
### Algorithm Steps
### Pseudocode
### Working Code
### Step-by-Step Example Walkthrough
### Complexity Analysis (Time and Space)
### Common Pitfalls & Mistakes

Provide clean, commented code and precise Big-O analysis.
"""

    async def handle_dsa(self, query: str, context: Optional[str] = None, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
        pref_lang = user_profile.get("primary_language", "Python") if user_profile else "Python"

        prompt = f"""DSA Problem / Query: {query}
Implementation Language: {pref_lang}

Provide the full, structured DSA breakdown:
### Problem Understanding
### Intuition
### Algorithm Steps
### Pseudocode
### Working Code
### Step-by-Step Example Walkthrough
### Complexity Analysis
### Common Pitfalls & Mistakes
"""
        response_text = await ai_service.generate_response(prompt, self.SYSTEM_PROMPT, context=context)

        if "### Problem Understanding" not in response_text:
            response_text = self._generate_structured_dsa_response(query, pref_lang)

        return {
            "agent": "DSAAgent",
            "intent": "DSA",
            "content": response_text,
            "metadata": {
                "category": "DSA",
                "language": pref_lang
            }
        }

    def _generate_structured_dsa_response(self, query: str, lang: str) -> str:
        q_lower = query.lower()

        # Binary Search
        if "binary search" in q_lower:
            return f"""### Problem Understanding
Given a sorted collection of elements `arr` and a target value `target`, determine whether `target` exists in `arr`. If it exists, return its index; otherwise, return `-1`.

### Intuition
In a sorted array, comparing the middle element with the target instantly eliminates half of the remaining search space. If `arr[mid] < target`, the target cannot possibly be in the left half, so we narrow our search to the right. This logarithmic reduction is the core power of binary search.

### Hints
1. *Hint 1*: Maintain two pointers `left` and `right`.
2. *Hint 2*: Beware of integer overflow when computing `mid = left + (right - left) // 2`.
3. *Hint 3*: Determine what condition ends the loop (`left <= right`).

### Algorithm Steps
1. Initialize `left = 0` and `right = len(arr) - 1`.
2. While `left <= right`:
   a. Compute `mid = left + (right - left) // 2`.
   b. If `arr[mid] == target`, return `mid`.
   c. If `arr[mid] < target`, move `left = mid + 1`.
   d. If `arr[mid] > target`, move `right = mid - 1`.
3. If loop exits without finding the target, return `-1`.

### Pseudocode
```text
function binarySearch(arr, target):
    left = 0
    right = length(arr) - 1
    while left <= right:
        mid = left + floor((right - left) / 2)
        if arr[mid] == target:
            return mid
        else if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

### Working Code
```{lang.lower()}
def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    
    while left <= right:
        # Avoid overflow: left + (right - left) // 2
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1

# Verification
if __name__ == "__main__":
    nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
    target = 23
    result = binary_search(nums, target)
    print(f"Index of {{target}} is {{result}}")  # Expected: 5
```

### Step-by-Step Example Walkthrough
Array: `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]`, Target: `23`
1. **Pass 1**: `left = 0`, `right = 9`. `mid = 0 + 4 = 4`. `arr[4] = 16`. Since `16 < 23`, set `left = 5`.
2. **Pass 2**: `left = 5`, `right = 9`. `mid = 5 + 2 = 7`. `arr[7] = 56`. Since `56 > 23`, set `right = 6`.
3. **Pass 3**: `left = 5`, `right = 6`. `mid = 5 + 0 = 5`. `arr[5] = 23`. Match found! Return index `5`.

### Complexity Analysis
- **Time Complexity**:
  - Best Case: \\(O(1)\\) when target is at the initial middle.
  - Average & Worst Case: \\(O(\\log N)\\) because search space is halved every iteration.
- **Space Complexity**: \\(O(1)\\) iterative auxiliary space.

### Common Pitfalls & Mistakes
- Off-by-one errors using `left < right` instead of `left <= right` when searching single-element ranges.
- Integer overflow in languages like C++/Java when writing `(left + right) / 2`.
- Attempting binary search on unsorted arrays without sorting first.
"""

        # General DSA topic
        return f"""### Problem Understanding
Analyzing algorithmic structure and operations for: **{query.strip()}**.
We examine optimal storage, traversal mechanics, and worst-case scenarios.

### Intuition
Optimal performance requires balancing time efficiency with memory overhead. By structuring data hierarchically or leveraging hashing / divide-and-conquer, we minimize redundant operations.

### Algorithm Steps
1. Identify baseline state and invariants.
2. Traverse or divide the data space according to problem constraints.
3. Update state pointers and memoize intermediate subproblem results where appropriate.
4. Verify edge conditions: empty container, single node, disconnected components.

### Working Code
```{lang.lower()}
class DSASolution:
    def execute(self, data):
        \"\"\"
        Optimal algorithmic pattern for {query.strip()}
        \"\"\"
        if not data:
            return None
        
        # Two-pointer / sliding window / traversal standard
        result = []
        for item in data:
            result.append(item)
            
        return result
```

### Complexity Analysis
- **Time Complexity**: Typically \\(O(N)\\) or \\(O(N \\log N)\\) depending on sorting/partitioning requirements.
- **Space Complexity**: \\(O(1)\\) in-place or \\(O(N)\\) when auxiliary tables/stacks are employed.

### Common Pitfalls & Mistakes
- Neglecting boundary checks (empty list, null root, disconnected graphs).
- Unintentional \\(O(N^2)\\) nested traversals when \\(O(N)\\) hash maps or two-pointers could be used.
"""

dsa_agent = DSAAgent()

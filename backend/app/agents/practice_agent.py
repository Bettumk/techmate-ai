import random
from typing import Dict, Any, List

class PracticeAgent:
    """Specialized Agent for Practice Mode (MCQ, Coding Challenges, Debugging)."""

    QUESTIONS_BANK = {
        "Data Structures": [
            {
                "id": "ds_1",
                "question": "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?",
                "type": "MCQ",
                "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
                "correct_option_index": 2,
                "explanation": "When an unbalanced BST degenerates into a linear linked list (e.g. inserting sorted elements 1, 2, 3...), search complexity degrades to O(N)."
            },
            {
                "id": "ds_2",
                "question": "Which data structure is best suited for implementing a FIFO (First-In, First-Out) queuing mechanism with O(1) operations?",
                "type": "MCQ",
                "options": ["Array with shift()", "Doubly Linked List / Circular Buffer", "Binary Heap", "Stack"],
                "correct_option_index": 1,
                "explanation": "A Doubly Linked List or circular buffer maintains front and rear pointers to achieve O(1) enqueue and dequeue without shifting elements."
            },
            {
                "id": "ds_3",
                "question": "In a Max-Heap containing N elements, what is the time complexity to insert a new element?",
                "type": "MCQ",
                "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
                "correct_option_index": 1,
                "explanation": "Inserting an element appends it to the end of the complete binary tree and 'bubbles up' (heapifies), requiring at most O(log N) swaps along tree height."
            }
        ],
        "Algorithms": [
            {
                "id": "algo_1",
                "question": "Which algorithmic paradigm does Merge Sort utilize?",
                "type": "MCQ",
                "options": ["Greedy Approach", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
                "correct_option_index": 2,
                "explanation": "Merge Sort divides the array into halves recursively, sorts them, and merges the sorted halves back together."
            },
            {
                "id": "algo_2",
                "question": "What is the primary difference between Dijkstra's algorithm and the Bellman-Ford algorithm?",
                "type": "MCQ",
                "options": [
                    "Dijkstra only works on unweighted graphs",
                    "Bellman-Ford can detect negative weight cycles while Dijkstra fails with negative weights",
                    "Dijkstra runs in O(V * E) while Bellman-Ford runs in O((V + E) log V)",
                    "Bellman-Ford only works on directed acyclic graphs (DAGs)"
                ],
                "correct_option_index": 1,
                "explanation": "Dijkstra's greedy assumption breaks with negative edge weights. Bellman-Ford relaxes edges V-1 times and detects negative weight cycles in O(V * E) time."
            }
        ],
        "DBMS": [
            {
                "id": "dbms_1",
                "question": "Which property in ACID ensures that concurrent transactions execute as if they were running serially?",
                "type": "MCQ",
                "options": ["Atomicity", "Consistency", "Isolation", "Durability"],
                "correct_option_index": 2,
                "explanation": "Isolation guarantees that uncommitted data from one transaction is hidden from other concurrent transactions."
            },
            {
                "id": "dbms_2",
                "question": "What kind of database index is typically used as the primary clustered index in relational databases like PostgreSQL and MySQL InnoDB?",
                "type": "MCQ",
                "options": ["Hash Index", "B+ Tree", "Inverted Index", "Bitmap Index"],
                "correct_option_index": 1,
                "explanation": "B+ Trees maintain sorted order on disk, optimize sequential scans through linked leaf nodes, and have balanced logarithmic depth."
            }
        ],
        "Operating Systems": [
            {
                "id": "os_1",
                "question": "Which of the following is NOT one of the four necessary Coffman conditions for a Deadlock?",
                "type": "MCQ",
                "options": ["Mutual Exclusion", "Hold and Wait", "Preemptive Scheduling", "Circular Wait"],
                "correct_option_index": 2,
                "explanation": "The condition is 'No Preemption', meaning resources cannot be forcibly confiscated. Preemptive scheduling actually avoids or breaks deadlocks."
            }
        ]
    }

    def get_practice_set(self, topic: str, difficulty: str, count: int = 5) -> List[Dict[str, Any]]:
        pool = []
        for key, q_list in self.QUESTIONS_BANK.items():
            if topic.lower() in key.lower() or "all" in topic.lower():
                pool.extend(q_list)

        if not pool:
            # Fallback to all questions
            for q_list in self.QUESTIONS_BANK.values():
                pool.extend(q_list)

        random.shuffle(pool)
        return pool[:count]

    def evaluate_answers(self, questions: List[Dict[str, Any]], user_answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        results = []
        score = 0
        total = len(questions)

        # map answers by id
        ans_map = {ans.get("id"): ans.get("selected_option") for ans in user_answers}

        for q in questions:
            qid = q.get("id")
            correct_idx = q.get("correct_option_index")
            chosen = ans_map.get(qid)
            is_correct = (chosen == correct_idx)

            if is_correct:
                score += 1

            results.append({
                "id": qid,
                "question": q.get("question"),
                "selected_option": chosen,
                "correct_option": correct_idx,
                "is_correct": is_correct,
                "explanation": q.get("explanation")
            })

        return {
            "score": score,
            "total": total,
            "percentage": round((score / max(total, 1)) * 100, 1),
            "results": results
        }

practice_agent = PracticeAgent()

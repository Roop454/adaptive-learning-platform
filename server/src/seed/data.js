// Seed catalogue for the Adaptive Learning Platform.
//
// Each question stores answerIndex (0-based) so the server can grade attempts.
// Difficulty runs 1 (gentle) to 5 (hard) and drives the adaptive engine.

export const courses = [
  {
    title: "Python Foundations",
    slug: "python-foundations",
    description: "Start programming with Python: syntax, data types, control flow, and functions.",
    level: "beginner",
    lessons: [
      {
        title: "Variables and Types",
        topic: "python-basics",
        difficulty: 1,
        estimatedMinutes: 12,
        summary: "How Python stores values and the core built-in types.",
        prerequisites: [],
        questions: [
          {
            prompt: "Which of these creates an integer in Python?",
            options: ["x = '5'", "x = 5", "x = 5.0", "x = [5]"],
            answerIndex: 1,
          },
          {
            prompt: "What type does len('hello') return?",
            options: ["str", "float", "int", "list"],
            answerIndex: 2,
          },
          {
            prompt: "Which value is falsy in Python?",
            options: ["'0'", "[]", "1", "'None'"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "Control Flow",
        topic: "control-flow",
        difficulty: 2,
        estimatedMinutes: 15,
        summary: "Make decisions and repeat work with if, for, and while.",
        prerequisites: ["python-basics"],
        questions: [
          {
            prompt: "What does range(0, 5) produce?",
            options: ["0,1,2,3,4", "1,2,3,4,5", "0,1,2,3,4,5", "0..5 inclusive"],
            answerIndex: 0,
          },
          {
            prompt: "Which keyword skips to the next loop iteration?",
            options: ["stop", "pass", "continue", "exit"],
            answerIndex: 2,
          },
          {
            prompt: "An if/elif/else chain runs how many of its blocks?",
            options: ["All matching", "At most one", "Exactly two", "None"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "Functions and Scope",
        topic: "functions",
        difficulty: 3,
        estimatedMinutes: 18,
        summary: "Package logic into reusable functions and understand scope.",
        prerequisites: ["control-flow"],
        questions: [
          {
            prompt: "What does a function return with no explicit return statement?",
            options: ["0", "None", "''", "An error"],
            answerIndex: 1,
          },
          {
            prompt: "A variable defined inside a function is...",
            options: ["Global", "Local to that function", "A constant", "Shared across files"],
            answerIndex: 1,
          },
          {
            prompt: "Which lets a function accept any number of positional args?",
            options: ["*args", "&args", "args[]", "...args"],
            answerIndex: 0,
          },
        ],
      },
    ],
  },
  {
    title: "Data Structures & Algorithms",
    slug: "dsa-core",
    description: "The building blocks of problem solving: arrays, recursion, and sorting.",
    level: "intermediate",
    lessons: [
      {
        title: "Arrays and Lists",
        topic: "arrays",
        difficulty: 2,
        estimatedMinutes: 15,
        summary: "Indexing, iteration, and common array operations.",
        prerequisites: ["python-basics"],
        questions: [
          {
            prompt: "What is the index of the first element of an array?",
            options: ["1", "0", "-1", "Depends on language"],
            answerIndex: 1,
          },
          {
            prompt: "Average time to access an element by index is...",
            options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
            answerIndex: 2,
          },
          {
            prompt: "Which operation is typically O(n) on a dynamic array?",
            options: ["Access by index", "Append at end (amortised)", "Insert at front", "Read length"],
            answerIndex: 2,
          },
        ],
      },
      {
        title: "Recursion",
        topic: "recursion",
        difficulty: 4,
        estimatedMinutes: 20,
        summary: "Solve problems by having a function call itself.",
        prerequisites: ["functions"],
        questions: [
          {
            prompt: "Every recursive function needs a...",
            options: ["Loop", "Base case", "Global variable", "Class"],
            answerIndex: 1,
          },
          {
            prompt: "What is the risk of missing a base case?",
            options: ["Slow sort", "Infinite recursion", "Syntax error", "Wrong type"],
            answerIndex: 1,
          },
          {
            prompt: "Factorial(0) is usually defined as...",
            options: ["0", "1", "undefined", "-1"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "Sorting Basics",
        topic: "sorting",
        difficulty: 3,
        estimatedMinutes: 18,
        summary: "Compare simple sorts and understand their trade-offs.",
        prerequisites: ["arrays"],
        questions: [
          {
            prompt: "Average time complexity of merge sort is...",
            options: ["O(n)", "O(n log n)", "O(n^2)", "O(1)"],
            answerIndex: 1,
          },
          {
            prompt: "Which sort repeatedly swaps adjacent out-of-order items?",
            options: ["Bubble sort", "Quick sort", "Heap sort", "Radix sort"],
            answerIndex: 0,
          },
          {
            prompt: "A stable sort preserves...",
            options: ["Memory", "Relative order of equal keys", "Speed", "Recursion depth"],
            answerIndex: 1,
          },
        ],
      },
    ],
  },
  {
    title: "SQL & Databases",
    slug: "sql-databases",
    description: "Query and shape relational data with SQL.",
    level: "beginner",
    lessons: [
      {
        title: "SELECT Basics",
        topic: "sql-basics",
        difficulty: 1,
        estimatedMinutes: 12,
        summary: "Read rows and columns from a table.",
        prerequisites: [],
        questions: [
          {
            prompt: "Which clause filters rows?",
            options: ["ORDER BY", "WHERE", "GROUP BY", "LIMIT"],
            answerIndex: 1,
          },
          {
            prompt: "SELECT * returns...",
            options: ["All columns", "One column", "No rows", "Only keys"],
            answerIndex: 0,
          },
          {
            prompt: "Which keyword removes duplicate rows?",
            options: ["UNIQUE", "DISTINCT", "ONLY", "DEDUPE"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "Joins",
        topic: "joins",
        difficulty: 3,
        estimatedMinutes: 20,
        summary: "Combine rows from related tables.",
        prerequisites: ["sql-basics"],
        questions: [
          {
            prompt: "An INNER JOIN returns...",
            options: [
              "All rows from both tables",
              "Only rows matching in both tables",
              "Only left table rows",
              "Only unmatched rows",
            ],
            answerIndex: 1,
          },
          {
            prompt: "A LEFT JOIN keeps all rows from...",
            options: ["The right table", "The left table", "Neither", "Both always"],
            answerIndex: 1,
          },
          {
            prompt: "Joins match rows using...",
            options: ["Row numbers", "A join condition", "Alphabetical order", "Insert time"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "Aggregation",
        topic: "aggregation",
        difficulty: 3,
        estimatedMinutes: 16,
        summary: "Summarise data with GROUP BY and aggregate functions.",
        prerequisites: ["sql-basics"],
        questions: [
          {
            prompt: "Which function counts rows?",
            options: ["SUM()", "COUNT()", "AVG()", "MAX()"],
            answerIndex: 1,
          },
          {
            prompt: "GROUP BY is used to...",
            options: ["Sort rows", "Collapse rows into groups", "Join tables", "Delete rows"],
            answerIndex: 1,
          },
          {
            prompt: "HAVING filters...",
            options: ["Individual rows", "Grouped results", "Columns", "Indexes"],
            answerIndex: 1,
          },
        ],
      },
    ],
  },
  {
    title: "Web Development with React",
    slug: "react-web",
    description: "Build interactive, component-based user interfaces.",
    level: "intermediate",
    lessons: [
      {
        title: "HTML & CSS Essentials",
        topic: "html-css",
        difficulty: 1,
        estimatedMinutes: 14,
        summary: "Structure and style a page.",
        prerequisites: [],
        questions: [
          {
            prompt: "Which tag creates the largest heading?",
            options: ["<h6>", "<head>", "<h1>", "<title>"],
            answerIndex: 2,
          },
          {
            prompt: "CSS 'flexbox' is mainly used for...",
            options: ["Database queries", "Layout", "Animation only", "Form validation"],
            answerIndex: 1,
          },
          {
            prompt: "Which CSS property changes text colour?",
            options: ["font", "color", "background", "fill"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "React Components",
        topic: "react-basics",
        difficulty: 2,
        estimatedMinutes: 18,
        summary: "Build UI from reusable components and props.",
        prerequisites: ["html-css"],
        questions: [
          {
            prompt: "A React component returns...",
            options: ["SQL", "JSX", "CSS files", "A database row"],
            answerIndex: 1,
          },
          {
            prompt: "Data passed into a component is called...",
            options: ["state", "props", "hooks", "refs"],
            answerIndex: 1,
          },
          {
            prompt: "Component names in React should be...",
            options: ["lowercase", "Capitalised", "ALL CAPS", "numbers"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "State and Hooks",
        topic: "react-state",
        difficulty: 3,
        estimatedMinutes: 20,
        summary: "Manage changing data with useState and useEffect.",
        prerequisites: ["react-basics"],
        questions: [
          {
            prompt: "Which hook stores local component state?",
            options: ["useFetch", "useState", "useQuery", "useStore"],
            answerIndex: 1,
          },
          {
            prompt: "useEffect runs...",
            options: ["Never", "After render", "Before parsing", "Only on errors"],
            answerIndex: 1,
          },
          {
            prompt: "Calling setState causes the component to...",
            options: ["Unmount", "Re-render", "Freeze", "Reload the page"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "Talking to APIs",
        topic: "apis",
        difficulty: 4,
        estimatedMinutes: 22,
        summary: "Fetch and send data over HTTP from the browser.",
        prerequisites: ["react-state"],
        questions: [
          {
            prompt: "Which HTTP method typically creates a resource?",
            options: ["GET", "POST", "DELETE", "HEAD"],
            answerIndex: 1,
          },
          {
            prompt: "A 401 response usually means...",
            options: ["Success", "Not found", "Unauthorised", "Server error"],
            answerIndex: 2,
          },
          {
            prompt: "fetch() returns a...",
            options: ["String", "Promise", "Number", "Component"],
            answerIndex: 1,
          },
        ],
      },
    ],
  },
  {
    title: "Intro to Machine Learning",
    slug: "ml-intro",
    description: "The core ideas behind training models from data.",
    level: "advanced",
    lessons: [
      {
        title: "What is Machine Learning?",
        topic: "ml-basics",
        difficulty: 2,
        estimatedMinutes: 15,
        summary: "Supervised vs unsupervised learning and where ML fits.",
        prerequisites: ["python-basics"],
        questions: [
          {
            prompt: "Supervised learning trains on data that is...",
            options: ["Unlabeled", "Labeled", "Encrypted", "Streaming only"],
            answerIndex: 1,
          },
          {
            prompt: "Clustering is an example of...",
            options: ["Supervised learning", "Unsupervised learning", "A database", "A web server"],
            answerIndex: 1,
          },
          {
            prompt: "The data a model learns from is the...",
            options: ["Test set", "Training set", "Log file", "Schema"],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "Regression",
        topic: "regression",
        difficulty: 4,
        estimatedMinutes: 20,
        summary: "Predict continuous values and measure error.",
        prerequisites: ["ml-basics"],
        questions: [
          {
            prompt: "Regression predicts a...",
            options: ["Category", "Continuous number", "Cluster id", "Boolean only"],
            answerIndex: 1,
          },
          {
            prompt: "A common regression error metric is...",
            options: ["Accuracy", "Mean Absolute Error", "Precision", "Recall"],
            answerIndex: 1,
          },
          {
            prompt: "Overfitting means the model...",
            options: [
              "Generalises well",
              "Memorises training data and fails on new data",
              "Is too simple",
              "Has no parameters",
            ],
            answerIndex: 1,
          },
        ],
      },
      {
        title: "Classification",
        topic: "classification",
        difficulty: 4,
        estimatedMinutes: 20,
        summary: "Predict discrete categories and evaluate the results.",
        prerequisites: ["ml-basics"],
        questions: [
          {
            prompt: "Classification predicts a...",
            options: ["Continuous number", "Category", "Timestamp", "File path"],
            answerIndex: 1,
          },
          {
            prompt: "Accuracy is the share of predictions that are...",
            options: ["Fast", "Correct", "Labeled", "Numeric"],
            answerIndex: 1,
          },
          {
            prompt: "A confusion matrix compares predictions against...",
            options: ["The schema", "The true labels", "The code", "The server logs"],
            answerIndex: 1,
          },
        ],
      },
    ],
  },
];

// Demo learners used by the seed script to generate realistic activity so the
// analytics and recommendation screens have something to show on first run.
export const demoLearners = [
  { name: "Demo Learner", email: "demo@learn.dev", password: "demo1234", goals: ["python-basics", "sql-basics"] },
  { name: "Aarav Sharma", email: "aarav@learn.dev", password: "demo1234", goals: ["react-basics"] },
  { name: "Mei Lin", email: "mei@learn.dev", password: "demo1234", goals: ["ml-basics"] },
  { name: "Diego Torres", email: "diego@learn.dev", password: "demo1234", goals: ["joins"] },
  { name: "Sara Khan", email: "sara@learn.dev", password: "demo1234", goals: ["recursion"] },
];

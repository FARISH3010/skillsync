/**
 * Curated high-yield learning resources mapped by competency, subject domain, or skill keyword.
 * Includes documentation, official learning paths, interactive tutorials, video series, and university lecture notes.
 */

export const RESOURCE_CATALOG = {
  // Cloud & Containers
  "docker": [
    { title: "Docker Official Docs & Get Started Tutorial", type: "Docs", url: "https://docs.docker.com/get-started/", provider: "Docker" },
    { title: "Docker for Beginners (Hands-on Lab)", type: "Tutorial", url: "https://docker-curriculum.com/", provider: "Docker Curriculum" },
    { title: "FreeCodeCamp: Docker Full Course", type: "Video", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", provider: "YouTube" }
  ],
  "kubernetes": [
    { title: "Kubernetes Official Interactive Basics", type: "Docs", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", provider: "Kubernetes" },
    { title: "KubeAcademy: Container Orchestration", type: "Course", url: "https://kube.academy/", provider: "VMware" },
    { title: "Kubernetes Crash Course for Beginners", type: "Video", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4", provider: "TechWorld with Nana" }
  ],
  "aws": [
    { title: "AWS Cloud Essentials & Ramp-Up Guide", type: "Course", url: "https://aws.amazon.com/training/learn-about/cloud-practitioner/", provider: "AWS Training" },
    { title: "AWS Hands-On Labs (Free Tier)", type: "Hands-on", url: "https://aws.amazon.com/getting-started/hands-on/", provider: "AWS" }
  ],
  "cloud": [
    { title: "Cloud Architecture Principles & Patterns", type: "Docs", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/", provider: "Microsoft Learn" },
    { title: "AWS / Google Cloud Digital Leader Path", type: "Course", url: "https://cloud.google.com/learn/training", provider: "Google Cloud" }
  ],

  // Full-Stack & Web
  "react": [
    { title: "React Official Interactive Docs (react.dev)", type: "Docs", url: "https://react.dev/learn", provider: "React Core Team" },
    { title: "Full Stack Open: Deep Dive Into Modern Web", type: "Course", url: "https://fullstackopen.com/en/", provider: "University of Helsinki" },
    { title: "Epic React Essentials by Kent C. Dodds", type: "Tutorial", url: "https://epicreact.dev/articles", provider: "Epic React" }
  ],
  "next.js": [
    { title: "Next.js Official App Router Course", type: "Course", url: "https://nextjs.org/learn", provider: "Vercel" },
    { title: "Next.js Architecture & Server Actions Guide", type: "Docs", url: "https://nextjs.org/docs", provider: "Vercel" }
  ],
  "typescript": [
    { title: "TypeScript Handbook & Executable Playground", type: "Docs", url: "https://www.typescriptlang.org/docs/handbook/intro.html", provider: "Microsoft" },
    { title: "Execute Program: TypeScript for Developers", type: "Tutorial", url: "https://www.executeprogram.com/courses/typescript", provider: "Execute Program" }
  ],
  "javascript": [
    { title: "MDN Web Docs: JavaScript Guide", type: "Docs", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", provider: "MDN" },
    { title: "JavaScript.info: The Modern JavaScript Tutorial", type: "Book", url: "https://javascript.info/", provider: "Ilya Kantor" }
  ],
  "tailwind": [
    { title: "Tailwind CSS Official Documentation & Components", type: "Docs", url: "https://tailwindcss.com/docs", provider: "Tailwind Labs" },
    { title: "Tailwind UI Screencasts & Layout Recipes", type: "Tutorial", url: "https://www.youtube.com/@TailwindLabs", provider: "YouTube" }
  ],
  "node": [
    { title: "Node.js Official API Reference & Guides", type: "Docs", url: "https://nodejs.org/en/learn", provider: "OpenJS Foundation" },
    { title: "The Odin Project: NodeJS Backend Path", type: "Course", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs", provider: "The Odin Project" }
  ],

  // Databases & Caching
  "postgresql": [
    { title: "PostgreSQL Official Tutorial & Schema Docs", type: "Docs", url: "https://www.postgresql.org/docs/current/tutorial.html", provider: "PostgreSQL Global" },
    { title: "Postgres Guide: Performance Tuning & Indexes", type: "Guide", url: "https://www.postgresguide.com/", provider: "Postgres Guide" },
    { title: "SQLBolt: Interactive SQL Lessons", type: "Hands-on", url: "https://sqlbolt.com/", provider: "SQLBolt" }
  ],
  "redis": [
    { title: "Redis University: In-Memory Data Structures", type: "Course", url: "https://university.redis.com/", provider: "Redis University" },
    { title: "Redis Patterns & Microservice Caching Guide", type: "Docs", url: "https://redis.io/docs/manual/client-side-caching/", provider: "Redis Labs" }
  ],
  "mongodb": [
    { title: "MongoDB University (Free Certifications Path)", type: "Course", url: "https://learn.mongodb.com/", provider: "MongoDB" },
    { title: "MongoDB Aggregation Pipeline Builder Guide", type: "Docs", url: "https://www.mongodb.com/docs/manual/core/aggregation-pipeline/", provider: "MongoDB" }
  ],
  "database": [
    { title: "CMU 15-445/645 Database Systems Lecture Series", type: "Lectures", url: "https://15445.courses.cs.cmu.edu/", provider: "Carnegie Mellon" },
    { title: "Use The Index, Luke! A Guide to Database Performance", type: "Book", url: "https://use-the-index-luke.com/", provider: "Markus Winand" }
  ],

  // Message Queues & Streaming
  "kafka": [
    { title: "Confluent Developer: Apache Kafka 101", type: "Course", url: "https://developer.confluent.io/courses/apache-kafka/events/", provider: "Confluent" },
    { title: "Apache Kafka Quickstart & Pub/Sub Docs", type: "Docs", url: "https://kafka.apache.org/quickstart", provider: "Apache Foundation" }
  ],

  // DevOps & CI/CD
  "ci/cd": [
    { title: "GitHub Actions Documentation & Workflow Templates", type: "Docs", url: "https://docs.github.com/en/actions", provider: "GitHub" },
    { title: "GitLab CI/CD Fundamentals & Deployment Pipelines", type: "Tutorial", url: "https://docs.gitlab.com/ee/ci/", provider: "GitLab" }
  ],
  "git": [
    { title: "Pro Git Book (Free Full Online Edition)", type: "Book", url: "https://git-scm.com/book/en/v2", provider: "Git SCM" },
    { title: "Learn Git Branching Interactive Sandbox", type: "Interactive", url: "https://learngitbranching.js.org/", provider: "LGB" }
  ],

  // Python & Microservices
  "python": [
    { title: "Real Python: Tutorials & Pythonic Best Practices", type: "Tutorial", url: "https://realpython.com/", provider: "Real Python" },
    { title: "Official Python 3.12+ Documentation & Tutorial", type: "Docs", url: "https://docs.python.org/3/tutorial/", provider: "Python.org" }
  ],
  "fastapi": [
    { title: "FastAPI Official Documentation & Interactive OpenAPI Tutorial", type: "Docs", url: "https://fastapi.tiangolo.com/tutorial/", provider: "Tiangolo" },
    { title: "Building High-Throughput Async APIs with FastAPI", type: "Guide", url: "https://fastapi.tiangolo.com/advanced/", provider: "FastAPI" }
  ],

  // AI, Data Science & Machine Learning
  "generative ai": [
    { title: "Google Cloud Generative AI Learning Path", type: "Course", url: "https://www.cloudskillsboost.google/journeys/118", provider: "Google Cloud" },
    { title: "DeepLearning.AI: LangChain & LLM Application Development", type: "Course", url: "https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/", provider: "Andrew Ng / DeepLearning.AI" },
    { title: "Hugging Face NLP Course: Transformer Architecture", type: "Course", url: "https://huggingface.co/learn/nlp-course", provider: "Hugging Face" }
  ],
  "machine learning": [
    { title: "Machine Learning Specialization by Andrew Ng", type: "Course", url: "https://www.coursera.org/specializations/machine-learning-introduction", provider: "Stanford / Coursera" },
    { title: "Scikit-Learn User Guide & Machine Learning Tutorials", type: "Docs", url: "https://scikit-learn.org/stable/user_guide.html", provider: "Scikit-Learn" }
  ],
  "deep learning": [
    { title: "PyTorch Deep Learning with PyTorch (Free Course)", type: "Book/Course", url: "https://www.learnpytorch.io/", provider: "Daniel Bourke" },
    { title: "Fast.ai: Practical Deep Learning for Coders", type: "Course", url: "https://course.fast.ai/", provider: "fast.ai" }
  ],

  // System Design & Architecture
  "system design": [
    { title: "System Design Primer by Donne Martin", type: "GitHub", url: "https://github.com/donnemartin/system-design-primer", provider: "GitHub (250k+ Stars)" },
    { title: "ByteByteGo: Visual System Design Newsletter & Articles", type: "Articles", url: "https://blog.bytebytego.com/", provider: "Alex Xu" }
  ],

  // Algorithms & Core CS
  "data structures": [
    { title: "MIT 6.006: Introduction to Algorithms", type: "Lectures", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", provider: "MIT OpenCourseWare" },
    { title: "NeetCode Roadmap & DSA Visualizer", type: "Interactive", url: "https://neetcode.io/roadmap", provider: "NeetCode" }
  ],
  "algorithms": [
    { title: "Algorithms, Part I by Princeton University", type: "Course", url: "https://www.coursera.org/learn/algorithms-part1", provider: "Princeton / Sedgewick" },
    { title: "Visualgo: Visualising Algorithms and Data Structures", type: "Interactive", url: "https://visualgo.net/", provider: "VisuAlgo" }
  ],
  "software engineering": [
    { title: "Google Engineering Practices Documentation", type: "Guide", url: "https://google.github.io/eng-practices/", provider: "Google" },
    { title: "Refactoring.Guru: Design Patterns & Clean Architecture", type: "Guide", url: "https://refactoring.guru/design-patterns", provider: "Refactoring Guru" }
  ],

  // Professional Domains (Law, MBA, etc.)
  "law": [
    { title: "Harvard Law School Course Materials & Case Law Access", type: "Lectures", url: "https://hls.harvard.edu/", provider: "Harvard Law" },
    { title: "Stanford CodeX: Center for Legal Informatics", type: "Research", url: "https://law.stanford.edu/codex-the-stanford-center-for-legal-informatics/", provider: "Stanford Law" },
    { title: "Cornell Legal Information Institute (LII)", type: "Library", url: "https://www.law.cornell.edu/", provider: "Cornell Law" }
  ],
  "legal": [
    { title: "International Bar Association (IBA) Legal Practice Resources", type: "Guide", url: "https://www.ibanet.org/", provider: "IBA" },
    { title: "World Intellectual Property Organization (WIPO) Academy", type: "Course", url: "https://www.wipo.int/academy/en/", provider: "WIPO" }
  ],
  "business": [
    { title: "MIT Sloan Executive & Open Course Management Insights", type: "Lectures", url: "https://mitsloan.mit.edu/", provider: "MIT Sloan" },
    { title: "Harvard Business Review Case Studies & Management Frameworks", type: "Articles", url: "https://hbr.org/", provider: "HBR" }
  ]
};

/**
 * Returns a list of 2-3 matched educational resources for any given course name,
 * course description, or mapped skill list.
 */
export function getResourcesForCourse(courseName = "", description = "", mappedSkills = []) {
  const queryTokens = [
    courseName.toLowerCase(),
    description.toLowerCase(),
    ...mappedSkills.map(s => (typeof s === 'string' ? s : s.skill_name || '').toLowerCase())
  ].join(' ');

  const matched = [];
  const addedUrls = new Set();

  for (const [key, resources] of Object.entries(RESOURCE_CATALOG)) {
    if (queryTokens.includes(key)) {
      for (const res of resources) {
        if (!addedUrls.has(res.url)) {
          matched.push(res);
          addedUrls.add(res.url);
        }
      }
    }
  }

  // Fallback defaults if no specialized keyword matched
  if (matched.length === 0) {
    const cleanSearch = encodeURIComponent(courseName || "Computer Science and Engineering");
    return [
      {
        title: `${courseName} Documentation & Syllabus Guides`,
        type: "Docs",
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${cleanSearch}`,
        provider: "Open Knowledge"
      },
      {
        title: `MIT OpenCourseWare Lectures: ${courseName}`,
        type: "Lectures",
        url: `https://ocw.mit.edu/search/?q=${cleanSearch}`,
        provider: "MIT OCW"
      },
      {
        title: `Coursera Specialized Academic Path: ${courseName}`,
        type: "Course",
        url: `https://www.coursera.org/search?query=${cleanSearch}`,
        provider: "Coursera"
      }
    ];
  }

  return matched.slice(0, 3);
}

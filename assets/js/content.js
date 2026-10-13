/**
 * Edit this file to update the site. Paths are relative to the website root.
 * Research summaries and lecture resources can be expanded as the work develops.
 * See README.md for complete examples.
 */
export const site = {
  name: "Ethan (Yisong) Cao",
  bio: [
    "I’m a fourth-year undergraduate at the University of Virginia, majoring in Data Science with a concentration in Machine Learning and Data Engineering, and minoring in Computer Science.",
    "I’m fascinated by the mechanisms underlying deep neural networks, especially transformers. This has led me to investigate the mechanisms and alignment of large language models and multimodal transformers.",
    "I believe in research for impact. I measure my work by whether it addresses persistent challenges or uncovers insights that have not yet surfaced in the field. I’m open to inquiries and opportunities, not to mention I am actively seeking graduate opportunities and internships myself.",
  ],
  portrait: "./assets/images/portrait.jpg",
  portraitAlt: "Ethan (Yisong) Cao wearing a straw hat and holding a yellow rubber duck.",
  portraitWidth: 1276,
  portraitHeight: 1702,
  links: [
    { label: "ethan128@me.com", url: "mailto:ethan128@me.com" },
    { label: "wkt7ne@virginia.edu", url: "mailto:wkt7ne@virginia.edu" },
    { label: "GitHub", url: "https://github.com/JuneWayne" },
  ],
  cv: {
    "url": "./assets/PDFs/Ethan%20Cao%20Resume.pdf",
    "education": [
      {
        "degree": "B.S. in Data Science",
        "institution": "University of Virginia · School of Data Science",
        "detail": "Concentration in Machine Learning & Data Engineering",
        "status": "Expected May 2027"
      },
      {
        "degree": "M.S. in Data Science",
        "institution": "University of Virginia · School of Data Science",
        "detail": "Concentration in Artificial Intelligence",
        "status": "Admitted · Expected August 2028"
      }
    ],
    "coursework": [
      "Advanced Cloud Computing",
      "Deep Learning",
      "Mathematics for Machine Learning",
      "Data Engineering"
    ],
    "skills": [
      {
        "title": "Programming",
        "items": [
          "Python",
          "SQL",
          "Java",
          "C++",
          "HTML/CSS"
        ]
      },
      {
        "title": "Machine learning & AI",
        "items": [
          "PyTorch",
          "scikit-learn",
          "TensorFlow",
          "CUDA",
          "LangChain",
          "LangGraph",
          "CrewAI",
          "OpenAI API",
          "Generative AI"
        ]
      },
      {
        "title": "Data & systems",
        "items": [
          "Git/GitHub",
          "Unix/Linux",
          "Prefect",
          "Relational & NoSQL databases",
          "Hadoop",
          "Spark",
          "DuckDB",
          "Kafka",
          "Docker"
        ]
      }
    ],
    "experiences": [
      {
        "id": "cisco",
        "organization": "Cisco Systems",
        "role": "Data Scientist Intern",
        "category": "Industry",
        "dates": "May – August 2026",
        "location": "Durham–Raleigh, North Carolina",
        "summary": "Worked on LLM auditing for prompt-injection defenses, semantic search, and a full-stack escalation tracking platform.",
        "highlights": [
          "Developed a lightweight LLM audit workflow using Jacobian-lens techniques with Qwen and Cisco Antares/Foundation-Sec models.",
          "Built semantic search using Sentence-Transformer embeddings, pgvector, and cosine-similarity ranking.",
          "Built FastAPI and Next.js services backed by PostgreSQL, deployed through OpenShift and Jenkins CI/CD."
        ],
        "photo": {
          "src": "./assets/images/experience/cisco-internship.jpg",
          "alt": "Ethan standing beside a Cisco sign outside the campus.",
          "width": 1279,
          "height": 1706
        },
        "links": [
          {
            "label": "Related research: prompt-injection defenses",
            "url": "./index.html#prompt-injection"
          }
        ]
      },
      {
        "id": "spatial-ai",
        "organization": "Spatial Artificial Intelligence Lab",
        "role": "Undergraduate Researcher",
        "category": "Research",
        "dates": "January 2026 – Present",
        "location": "Charlottesville, Virginia",
        "summary": "Investigating the mechanisms of autoregressive 3D mesh transformers and how their attention heads represent geometry.",
        "highlights": [
          "Studied attention sinks and active/dormant attention-head behavior in MeshXL.",
          "Built a PyTorch pipeline with forward hooks to extract attention matrices, weights, and hidden states.",
          "Analyzed geometric feature preferences and hidden-state retrieval across layers to investigate mesh generation."
        ],
        "links": [
          {
            "label": "Related research: 3D transformers",
            "url": "./index.html#mesh-transformers"
          }
        ]
      },
      {
        "id": "guest-lecture",
        "organization": "University of Virginia · McIntire School of Commerce",
        "role": "Guest Lecturer · COMM 4351",
        "category": "Teaching",
        "dates": "October 2025",
        "location": "Charlottesville, Virginia",
        "summary": "Guest lecture on AI agents in Professor Natasha Foutz’s Marketing Analytics and Big Data class, with hands-on examples in APIs, LangChain, retrieval, and hierarchical multi-agent systems.",
        "photo": {
          "src": "./assets/images/experience/guest-lecture.jpg",
          "alt": "Ethan presenting Agent Frameworks and Databases in a COMM 4351 lecture.",
          "width": 1613,
          "height": 975,
          "wide": true
        },
        "links": [
          {
            "label": "Lecture notebooks and teaching materials",
            "url": "./teaching.html"
          }
        ]
      },
      {
        "id": "align",
        "organization": "Align Technology",
        "role": "AI & Automation Intern",
        "category": "Industry",
        "dates": "May – August 2025",
        "location": "San Jose, California",
        "summary": "Built and shipped a multi-agent RAG chatbot for market research, used by 20,000+ Align employees.",
        "highlights": [
          "Developed the chatbot using Azure AI Foundry, Copilot Studio, Teams SDK, and LangChain.",
          "Combined multimodal embeddings and OCR to improve retrieval from charts, dashboards, and tables.",
          "Fine-tuned o4-mini in Azure AI Foundry to improve response quality and document-specific retrieval relevance."
        ],
        "photo": {
          "src": "./assets/images/experience/align-internship.jpg",
          "alt": "Ethan outside an Align office building with its sign visible above.",
          "width": 1279,
          "height": 1706
        }
      },
      {
        "id": "visual-intelligence",
        "organization": "Visual Intelligence Lab",
        "role": "Research Intern",
        "category": "Research",
        "dates": "April – September 2025",
        "location": "Charlottesville, Virginia",
        "summary": "Trained physics-aware recurrent convolutional networks to model advection and diffusion in 2D shear-flow systems.",
        "highlights": [
          "Designed and trained PARCv2 neural networks in PyTorch.",
          "Accelerated training through spatial downsampling and timestep skipping.",
          "Compared Euler and RK4 integrators and selected checkpoints to improve rollout stability."
        ],
        "links": [
          {
            "label": "PARCtorch code",
            "url": "https://github.com/JuneWayne/PARCtorch/"
          }
        ]
      },
      {
        "id": "active-learning",
        "organization": "Active Learning Lab",
        "role": "Undergraduate Researcher",
        "category": "Research",
        "dates": "December 2024 – May 2026",
        "location": "Charlottesville, Virginia",
        "summary": "Studied how early-career data science roles evolve through an unsupervised NLP pipeline built from LinkedIn job descriptions.",
        "highlights": [
          "Collected hourly job data and embedded more than 10,000 early-career postings.",
          "Used UMAP, HDBSCAN, class-based TF-IDF, and LLM labeling to identify 45 role groupings.",
          "Measured month-to-month semantic shifts and within-cluster consistency to study emerging micro-professions."
        ],
        "links": [
          {
            "label": "Related research: semantic shifts",
            "url": "./index.html#semantic-shifts"
          },
          {
            "label": "Project code",
            "url": "https://github.com/JuneWayne/Latent-Representation-Job-Market/tree/main"
          }
        ]
      },
      {
        "id": "tencent",
        "organization": "Tencent",
        "role": "Internship",
        "category": "Industry",
        "summary": "Internship experience at Tencent.",
        "dates": "May – August 2024",
        "photo": {
          "src": "./assets/images/experience/tencent-internship.jpg",
          "alt": "Ethan beside a purple cartoon cat mascot during his Tencent internship.",
          "width": 1706,
          "height": 1279,
          "wide": true
        }
      }
    ]
  },
  research: [
    {
      "id": "prompt-injection",
      "title": "Robust Prompt-Injection Defenses for Agentic Systems",
      "summary": "Investigating prompt-injection defenses for agentic systems. The current demo supports visual auditing of how language models respond to prompt-injection inputs.",
      "kind": "Ongoing research",
      "links": [
        {
          "label": "Interactive demo",
          "url": "https://junewayne.github.io/Verbalizing-LLMs-For-AI-Defense/?model=antares-1b"
        }
      ]
    },
    {
      "id": "mesh-transformers",
      "title": "Interpreting 3D Autoregressive Transformers",
      "summary": "Studying how attention heads in autoregressive mesh transformers relate to the geometric properties of triangles, with comparisons across four 3D generation model families.",
      "kind": "Work in progress",
      "details": [
        "The current analysis examines MeshGPT, MeshXL, DeepMesh, and MeshMosaic using 500 ShapeNet meshes across five object categories. It compares attention-head preferences for triangle area, aspect ratio, and orientation."
      ],
      "links": [
        {
          "label": "Research summary (PDF)",
          "url": "./assets/PowerPoints/Collaboration%20Request.pdf"
        },
        {
          "label": "Slides (PowerPoint)",
          "url": "./assets/PowerPoints/Collaboration%20Request.pptx",
          "download": true
        }
      ]
    },
    {
      "id": "semantic-shifts",
      "title": "Tracking Semantic Evolution of Data Science Roles",
      "summary": "Studying how early-career data science roles change over time through sentence embeddings, unsupervised clustering, and temporal analysis of job descriptions.",
      "kind": "Draft manuscript",
      "details": [
        "The draft analyzes 10,603 early-career job postings using sentence embeddings, UMAP, HDBSCAN, and temporal stability measures to study specialized role groupings and their semantic shifts.",
        "With Leah Kim, Brian Wright, and Ali Rivera at UVA’s Active Learning Lab."
      ],
      "links": [
        {
          "label": "Draft paper (PDF)",
          "url": "./assets/PDFs/Tracking%20Semantic%20Evolution%20of%20DS%20roles%20%281%29.pdf"
        }
      ]
    }
  ],
  teaching: [
    {
      "code": "COMM 4351",
      "title": "Marketing Analytics and Big Data",
      "institution": "University of Virginia",
      "role": "Guest Lecturer",
      "term": "October 2025",
      "photo": {
        "src": "./assets/images/experience/guest-lecture.jpg",
        "alt": "Ethan presenting Agent Frameworks and Databases in a COMM 4351 lecture.",
        "width": 1613,
        "height": 975
      },
      "description": "A guest lecture in Professor Natasha Foutz’s class on building AI agents, with hands-on notebooks covering APIs, chatbots, LangChain, retrieval-augmented generation, and hierarchical multi-agent workflows.",
      "materials": [
        {
          "title": "APIs and Chatbots",
          "summary": "HTTP requests, API responses, conversational applications, and an introduction to multi-agent workflows.",
          "url": "./assets/Python_notebook/APIs_%26_Chatbot.ipynb"
        },
        {
          "title": "LangChain 101",
          "summary": "Prompt templates, structured outputs, document retrieval, and a minimal tool-calling agent.",
          "url": "./assets/Python_notebook/Langchain_101.ipynb"
        },
        {
          "title": "Hierarchical Agents with CrewAI",
          "summary": "A manager-and-analysts workflow combining web research, local vector stores, and retrieval-augmented generation.",
          "url": "./assets/Python_notebook/CrewAI_Hierarchical_Web_RAG_LocalDB_Tutorial.ipynb"
        }
      ]
    },
    {
      "code": "SARC 5400",
      "title": "Data Visualization",
      "institution": "University of Virginia",
      "role": "Teaching Assistant",
      "description": "Teaching assistant for SARC 5400: Data Visualization."
    },
    {
      "title": "Charlottesville Debate League",
      "institution": "Charlottesville, Virginia",
      "role": "Tournament Chair",
      "description": "Organizing, planning, and managing speech and debate tournaments for Charlottesville middle school students.",
      "photo": {
        "src": "./assets/images/experience/cdl-team.jpg",
        "alt": "The Charlottesville Debate League team gathered in a lecture hall.",
        "width": 1706,
        "height": 1279
      }
    }
  ],
  // Homepage previews; add other animals here as your collection grows.
  animals: [
    { title: "Layla", src: "./assets/images/cats/layla-sofa.jpg", width: 1280, height: 1669,
      alt: "Layla looking over her shoulder while resting on a cream sofa.", url: "./cat.html", position: "50% 0%" },
  ],
  cat: {
    name: "Layla",
    bio: "Born in Shanghai, home with me since she was four months old.",
    description: "A collection of her little moments, big stretches, and very important naps.",
    loves: ["Catnip", "Mouse toys", "Hide-and-seek", "Ducks"],
    hero: "./assets/images/cats/layla-sofa.jpg",
    heroAlt: "Layla looking over her shoulder while resting on a cream sofa.",
    photos: [
      { id: "sofa", src: "./assets/images/cats/layla-sofa.jpg", width: 1280, height: 1669,
        alt: "Layla looking over her shoulder while resting on a cream sofa.",
        title: "On the sofa", category: "Layla", position: "50% 0%" },
      { id: "chair-closeup", src: "./assets/images/cats/layla-chair-closeup.jpg", width: 1280, height: 1707,
        alt: "A close-up of Layla looking up from beside a wicker chair.",
        title: "Up close", category: "Layla" },
      { id: "sunlight", src: "./assets/images/cats/layla-sunlight.jpg", width: 1280, height: 1707,
        alt: "Layla resting on a dark cushion in a patch of sunlight.",
        title: "A sunny spot", category: "Layla" },
      { id: "sofa-nap", src: "./assets/images/cats/layla-nap.jpg", width: 1279, height: 1706,
        alt: "Layla curled up with her paws tucked on a cream sofa cushion.",
        title: "Time for a nap", category: "Layla" },
      { id: "whiskers", src: "./assets/images/cats/layla-whiskers.jpg", width: 1279, height: 1706,
        alt: "Layla sitting upright with her chin lifted and whiskers spread.",
        title: "Whiskers", category: "Layla" },
      { id: "belly-up-new", src: "./assets/images/cats/layla-belly-up.jpg", width: 1279, height: 1706,
        alt: "Layla lying belly-up on the wooden floor beside a wall.",
        title: "Paws up", category: "Layla" },
      { id: "floor-nap", src: "./assets/images/cats/layla-floor-nap.jpg", width: 1279, height: 1706,
        alt: "Layla asleep on her back beside a wooden chair.",
        title: "Completely comfortable", category: "Layla" },
      { id: "belly-up", src: "./assets/images/cats/layla.jpg", width: 3024, height: 4032,
        alt: "Layla lying on her back on the wooden floor, looking up at the camera.",
        title: "The upside-down approach", category: "Layla" },
    ],
  },
};

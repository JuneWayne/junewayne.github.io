/**
 * Edit this file to update the site. Paths are relative to the website root.
 * Research summaries and lecture resources can be expanded as the work develops.
 * See README.md for complete examples.
 */
export const site = {
  name: "Ethan (Yisong) Cao",
  bio: [
    "I’m a fourth-year undergraduate at the University of Virginia, majoring in Data Science with a concentration in Artificial Intelligence and minoring in Computer Science.",
    "I am primarily interested in the mechanistic interpretability of large language models and multimodal models, with a focus deciphering reward hacking and misalignment behaviors that arise during post-training.",
    "Additionally, my interests include investigating the verbalization techniques of LLM hidden activations for safety alignment auditing, exploring new transformer architecture design for efficient reasoning, as well as investigating how effective data curation could be done to reduce post-training costs for practical industry settings.",
    "I believe in research for impact. I measure my work by whether it addresses persistent challenges or uncovers insights that have not yet surfaced in the field. I’m open to inquiries and opportunities, not to mention I am actively seeking graduate opportunities and internships myself."
  ],
  portrait: "./assets/images/portrait.jpg",
  portraitAlt: "Ethan (Yisong) Cao wearing a straw hat and holding a yellow rubber duck.",
  portraitWidth: 1276,
  portraitHeight: 1702,
  links: [
    { label: "Personal Email", url: "mailto:ethan128@me.com" },
    { label: "UVA outlook", url: "mailto:wkt7ne@virginia.edu" },
    { label: "GitHub", url: "https://github.com/JuneWayne" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/ethan-yisong-cao/" },
  ],
  cv: {
    "url": "./assets/Resume/Ethan_Cao_PhD_CV.pdf",
    "education": [
      {
        "degree": "B.S. in Data Science",
        "institution": "University of Virginia · School of Data Science and School of Engineering",
        "detail": "Concentration in Artificial Intelligence | Minor in Computer Science",
        "status": "September 2023 – May 2027",
        "notes": [
          "Major GPA: 3.95/4.00     Cumulative GPA: 3.80/4.00"
        ]
      }
    ],
    "coursework": [
      {
        "title": "Machine Learning",
        "courses": [
          {
            "code": "CS 3501",
            "title": "Foundations of Data Analysis",
            "description": "Traditional machine learning and deep learning methods for analyzing data."
          },
          {
            "code": "DS 3021",
            "title": "Analytics I: Machine Learning I",
            "description": "Data preparation, feature engineering, and evaluation of machine learning models."
          },
          {
            "code": "DS 4021",
            "title": "Analytics II: Machine Learning II",
            "description": "Neural networks, kernel methods, and ensembles for more advanced prediction tasks."
          },
          {
            "code": "DS 4024",
            "title": "Value II: Explainable AI",
            "description": "Methods for interpreting model behavior and communicating AI decisions."
          },
          {
            "code": "DS 4125",
            "title": "Introduction to Deep Learning",
            "description": "Neural network architectures and training methods for learning from data."
          },
          {
            "code": "CS 4771",
            "title": "Reinforcement Learning",
            "description": "Learning policies for sequential decisions through rewards and interaction.",
            "status": "In progress · Fall 2026"
          },
          {
            "title": "Large Language Models",
            "description": "Language model architectures, training, and applications."
          },
          {
            "title": "Recommender Systems",
            "description": "Methods for ranking and recommending items based on user preferences."
          }
        ]
      },
      {
        "title": "Statistics",
        "courses": [
          {
            "code": "DS 2026",
            "title": "Computational Probability",
            "description": "Probability concepts and computational methods for reasoning about uncertainty."
          },
          {
            "code": "DS 3026",
            "title": "Inference and Prediction",
            "description": "Statistical inference and predictive modeling for drawing conclusions from data."
          },
          {
            "code": "PHS 3102",
            "title": "Introduction to Public Health Research: Population Data Analysis",
            "description": "Analyzing population health data to formulate and evaluate research questions."
          }
        ]
      },
      {
        "title": "Math",
        "courses": [
          {
            "code": "MATH 1320",
            "title": "Calculus II",
            "description": "Integration techniques, infinite series, and applications of single-variable calculus."
          },
          {
            "code": "MATH 2310",
            "title": "Calculus III",
            "description": "Multivariable calculus, partial derivatives, and integration in higher dimensions."
          },
          {
            "code": "CS 2120",
            "title": "Discrete Mathematics and Theory I",
            "description": "Logic, proofs, sets, and discrete structures used in computer science."
          },
          {
            "code": "PHIL 2420",
            "title": "Introduction to Symbolic Logic",
            "description": "Formal reasoning through symbolic representations of arguments and logical validity."
          },
          {
            "code": "DS 3025",
            "title": "Mathematics for Data Science",
            "description": "Mathematical foundations for understanding data science models and algorithms."
          },
          {
            "code": "MATH 3350",
            "title": "Applied Linear Algebra",
            "description": "Matrices, vector spaces, and linear transformations with applied problem solving.",
            "status": "In progress · Fall 2026"
          }
        ]
      },
      {
        "title": "CS & Software",
        "courses": [
          {
            "code": "CS 1110",
            "title": "Introduction to Programming",
            "description": "Programming fundamentals, control flow, and computational problem solving."
          },
          {
            "code": "DS 1001",
            "title": "Foundations of Data Science",
            "description": "An introduction to the value, design, analytics, and systems of data science."
          },
          {
            "code": "DS 2022",
            "title": "Systems I: Introduction to Computing",
            "description": "Computing foundations and tools for working with data systems."
          },
          {
            "code": "SARC 5400",
            "title": "Data Visualization",
            "description": "Visual methods for exploring data and communicating patterns and insights."
          },
          {
            "code": "DS 2023",
            "title": "Design I: Communicating with Data",
            "description": "Designing clear visualizations and narratives to communicate data effectively."
          },
          {
            "code": "CS 2100",
            "title": "Data Structures and Algorithms I",
            "description": "Data structures and algorithms for organizing and processing information efficiently."
          },
          {
            "code": "CS 2501",
            "title": "Intro to Research",
            "description": "An introduction to the practices and skills involved in computer science research.",
            "links": [
              {
                "label": "Project paper",
                "url": "https://junewayne.github.io/Multilingual-Gender-Bias-in-NLP/"
              }
            ]
          },
          {
            "code": "DS 2024",
            "title": "Value I: Ethics and Policy in Data Science",
            "description": "Ethical and policy questions surrounding the collection and use of data."
          },
          {
            "code": "DS 3022",
            "title": "Data Engineering",
            "description": "Building reliable pipelines for collecting, processing, storing, and managing data."
          },
          {
            "code": "DS 4320",
            "title": "Data by Design",
            "description": "Designing data representations and workflows around the questions they need to answer."
          },
          {
            "code": "DS 5220",
            "title": "Advanced Cloud Computing",
            "description": "Cloud infrastructure and services for deploying and operating data applications."
          },
          {
            "code": "CS 3140",
            "title": "Software Development Essentials",
            "description": "Software design, testing, and construction of maintainable applications.",
            "status": "In progress · Fall 2026"
          },
          {
            "code": "DS 4221",
            "title": "Advanced Databases",
            "description": "Advanced database concepts for organizing, querying, and managing data.",
            "status": "In progress · Fall 2026"
          },
          {
            "code": "MAE 6270",
            "title": "Experimental Robotics",
            "description": "Building and programming robots with sensors, actuators, and ROS.",
            "status": "In progress · Fall 2026",
            "links": [
              {
                "label": "Technical report",
                "url": "https://junewayne.github.io/MAE6270-FridgeBot/report/"
              },
              {
                "label": "Slides",
                "url": "https://junewayne.github.io/MAE6270-FridgeBot/"
              }
            ]
          }
        ]
      },
      {
        "title": "Hobbies",
        "courses": [
          {
            "code": "EGMT 1510",
            "title": "Engaging Aesthetics: Punching Up — American Satire"
          },
          {
            "code": "EGMT 1540",
            "title": "Ethical Engagement: Political Myths — Then and Now"
          },
          {
            "code": "ENWR 1510",
            "title": "Writing and Critical Inquiry: Writing about Culture and Society"
          },
          {
            "code": "COMM 1800",
            "title": "Foundations of Commerce"
          },
          {
            "code": "EGMT 1520",
            "title": "Empirical Engagement: In-Consciousness"
          },
          {
            "code": "EGMT 1530",
            "title": "Engaging Differences: Solidarity Beyond the Hashtag"
          },
          {
            "code": "HIEA 2031",
            "title": "Modern China"
          },
          {
            "code": "PSYC 2600",
            "title": "Introduction to Social Psychology"
          },
          {
            "code": "UNST 3910",
            "title": "Self and Organizations"
          },
          {
            "code": "COMM 4569",
            "title": "Management Consulting Practicum in Costa Rica"
          },
          {
            "code": "SLAV 2360",
            "title": "Dracula",
            "status": "In progress · Fall 2026"
          },
          {
            "code": "UNST 3920",
            "title": "Teams, Leadership, and Organizations",
            "status": "In progress · Fall 2026"
          }
        ]
      }
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
        "logo": "./assets/images/logos/cisco.svg",
        "role": "Data Scientist Intern",
        "category": "Industry",
        "dates": "May – August 2026",
        "summary": "Post-trained Qwen2.5-1.5B, Qwen3.5-4B, and Cisco’s Antares-1B and Foundation-Sec-8B-Reasoning models using Jacobian-Lens to audit Cisco’s agentic systems on their effectiveness in prompt injection defense.",
        "highlights": [
          "Deployed a search engine for escalations using Sentence Transformer embeddings stored in pgvector. Designed system that ranks escalation descriptions by cosine similarity to the user’s query during inference.",
          "Built a full stack Escalation Tracking platform with FastAPI, Next.js, and PostgreSQL, and deployed on OpenShift containers."
        ],
        "photo": {
          "src": "./assets/images/experience/cisco-internship.jpg",
          "alt": "Ethan standing beside a Cisco sign outside the campus.",
          "width": 1279,
          "height": 1706
        },
        "links": [
          {
            "label": "Project demo",
            "url": "https://junewayne.github.io/Verbalizing-LLMs-For-AI-Defense/"
          }
        ],
        "expandOnClick": true
      },
      {
        "id": "align",
        "organization": "Align Technology",
        "logo": "./assets/images/logos/align.png",
        "role": "AI & Automation Intern",
        "category": "Industry",
        "dates": "May – August 2025",
        "summary": "Built and shipped a multi-agent RAG chatbot used by over 20,000 Align employees for market research. Integrated LangChain, Azure AI Foundry, Copilot Studio, and the Teams SDK in Python.",
        "highlights": [
          "Improved retrieval from charts, dashboards, and tables with Cohere v4 multimodal embeddings and OCR for text-heavy images. Customer satisfaction increased by over 116%.",
          "Fine-tuned o4-mini in Azure AI Foundry using supervised fine-tuning, reinforcement learning, and document-specific question–answer pairs to improve response quality and retrieval relevance."
        ],
        "photo": {
          "src": "./assets/images/experience/align-internship.jpg",
          "alt": "Ethan outside an Align office building with its sign visible above.",
          "width": 1279,
          "height": 1706
        }
      },
      {
        "id": "tencent",
        "organization": "Tencent IEG",
        "logo": "./assets/images/logos/tencent.png",
        "role": "Data Analyst Intern",
        "category": "Industry",
        "summary": "Gaming market research, data analysis, and interactive Power BI dashboards for the Greater Asia market.",
        "dates": "May – August 2024",
        "photo": {
          "src": "./assets/images/experience/tencent-internship.jpg",
          "alt": "Ethan beside a purple cartoon cat mascot during his Tencent internship.",
          "width": 1706,
          "height": 1279,
          "wide": false
        },
        "highlights": [
          "Analyzed Greater Asia gaming market trends using data from 10,000+ survey respondents and 1,000+ web-scraped Twitch/YouTube datasets in Python, and built automated interactive Power BI dashboards for presentations.",
          "Researched strategic solutions for Age of Empires and Meta Star that improved user retention by 14% and user satisfaction by 21%, through UI, in-game GPT, and gameplay optimization feedback surveys.",
          "Conducted business case studies of Apex Legends and Valorant in Korea and Japan, covering advertising strategies, KOL partnerships, and revenue outlook through 10+ interviews with Riot Games industry specialists."
        ]
      }
    ]
  },
  research: [
    {
      "id": "prompt-injection",
      "title": "Actionable Interpretability: Effective Data Curation for LoRA Fine-Tuning SLMs against Prompt Injection",
      "summary": "Compared eight ways to curate 256 training pairs from the Fine-Grained Indirect Prompt Injection dataset. Designed a Pairwise Selection Score (PSS) to select prompt pairs that linear probes & the model underperforms as training dataset.",
      "details": [
        "Used a Jacobian Lens to read Qwen2.5-7B’s intermediate hidden states and identify the prompt pairs it found hardest to classify. Used those pairs to fine-tune Qwen with LoRA and examined the feature distribution of the dataset selected by J-Lens.",
        "Evaluated the fine-tuned models on separate prompt-injection benchmarks. The Jacobian Lens yielded the lowest overall attack success rate and selected more cases where the source text falsely claimed the user’s task was complete."
      ],
      "role": "First Author",
      "dates": "May 2026 – November 2026",
      "supervisors": "Rachel Williamson and Devin Bender",
      "labs": [
        {
          "label": "Cisco Foundation AI",
          "url": "https://www.cisco.com/site/us/en/solutions/artificial-intelligence/foundation-ai/index.html"
        }
      ],
      "links": [
        {
          "label": "Hugging Face article",
          "url": "https://huggingface.co/blog/JuneWay128/actionable-interpretability-curating-effective-pro"
        },
        {
          "label": "Interactive demo",
          "url": "https://junewayne.github.io/Verbalizing-LLMs-For-AI-Defense/"
        }
      ],
      "linkToResource": true
    },
    {
      "id": "semantic-shifts",
      "title": "Interpreting Early-Career Job Advertisements with Sparse Autoencoders and Semantic Clustering",
      "summary": "Developed PERC (Preprocessing, Embedding, Reduction, Clustering) to analyze 36,081 early-career job postings collected over 1.5 years. Evaluated seven ways to segment a job posting text to identify patterns across occupations and over time.",
      "details": [
        "Applied Goodfire’s pretrained Sparse Autoencoder (SAE) to examine layer-19 activations from Llama-3.1-8B to identify features associated with technical skills and job responsibilities from occupation and monthly clusters.",
        "Compared hypotheses generated by GPT-6 Luna from SAE features, PERC clusters, and job posting description text alone. Tested the hypotheses on postings from held-out companies and discovered recurring themes about early career job roles."
      ],
      "role": "First Author",
      "dates": "January 2024 – November 2026",
      "supervisors": "Dr. Brian Wright and Ali Rivera",
      "labs": [
        {
          "label": "Active Learning Lab",
          "url": "https://datascience.virginia.edu/people/brian-wright"
        }
      ],
      "links": [
        {
          "label": "arXiv preprint",
          "url": "https://arxiv.org/abs/2611.21586"
        }
      ],
      "linkToResource": true
    },
    {
      "id": "mesh-transformers",
      "image": "./assets/slides/mesh-transformers/image4.gif",
      "imageAlt": "Animated generation of triangular meshes in five categories: chair, table, airplane, bottle, and lamp. Extracted from slide 2 of the 3D transformer interpretation presentation.",
      "imageWidth": 1650,
      "imageHeight": 374,
      "animationStill": "./assets/images/research/mesh-generation-still.png",
      "animationLabel": "Open mesh-generation animation at full size",
      "title": "Rule-Based Attention: Replacing Attention Heads in 3D Generative Mesh Transformers for Efficient Generation",
      "summary": "Measured which geometric features attention heads attend to during unconditional and conditional generation across four families of autoregressive mesh transformers (MeshGPT, MeshXL, DeepMesh, and MeshMosaic).",
      "details": [
        "Designed a preference-ratio metric and three rule-based replacements for attention heads. MeshXL maintained generation quality with up to 50% of the measured heads replaced.",
        "Evaluated conditional and unconditional generation using kernel and Fréchet distances in Uni3D embedding space. Used Chamfer distance to compare generated meshes with their nearest training shapes."
      ],
      "role": "First Author",
      "ongoing": true,
      "supervisors": "Dr. Lei Li",
      "labs": [
        {
          "label": "Spatial AI Lab",
          "url": "https://craigleili.github.io/"
        }
      ],
      "links": [
        {
          "label": "Research proposal",
          "url": "https://junewayne.github.io/3D-Mesh-Transformer-Mech-Interp/"
        }
      ],
      "linkToResource": true
    },
    {
      "id": "reward-hacking",
      "title": "Reward Hacking: Examining the Effects of Weight Deletion on Reward-Hacking Behavior of LLMs",
      "summary": "Investigating whether selectively deleting model weights can make a model more likely to exploit gaps in a reward function, and whether such effects of reward hacking transfers or generalizes to unseen tasks.",
      "details": [
        "Designing controlled experiments to test whether learned weight deletion makes models more prone to reward hacking during coding RL, measuring how often they pass contradictory unit tests and how accurately they solve the original tasks."
      ],
      "ongoing": true,
      "supervisors": "Ahson Saiyed and Dr. Chirag Agarwal",
      "labs": [
        {
          "label": "Aikyam Lab",
          "url": "https://chirag-agarwall.github.io/"
        }
      ],
      "links": [],
      "homeDetailsOnly": true
    },
    {
      "id": "fluid-dynamics",
      "image": "./assets/images/research/parc-shearflow-tracer.gif",
      "imageAlt": "PARCv2 with RK4: animated snapshot predictions of tracer advection and diffusion on a test sample, beside ground truth. Extracted from slide 40 of the shear-flow presentation.",
      "imageWidth": 720,
      "imageHeight": 360,
      "animationStill": "./assets/images/research/parc-shearflow-tracer-still.png",
      "title": "Physics-Aware Convolutional Neural Network: A ShearFlow Dataset Adaptation",
      "summary": "Trained a physics-aware recurrent convolutional neural network (PARCv2) in PyTorch to predict advection and diffusion in two-dimensional shear flow. Reduced training time by over 67% using one-third spatial down sampling and time-step skipping.",
      "details": [
        "Reduced rollouts mean squared error by over 81% after comparing Euler and RK4 integrators under the same model configurations and selecting checkpoints by validation loss."
      ],
      "role": "Research Intern",
      "dates": "April 2025 – September 2025",
      "supervisors": "Joseph Choi and Dr. Stephen Baek",
      "labs": [
        {
          "label": "Visual Intelligence Lab",
          "url": "https://stephenbaek.com/lab/"
        }
      ],
      "links": [
        {
          "label": "Research presentation",
          "url": "https://junewayne.github.io/ShearFlow-PARC-NN/"
        },
        {
          "label": "View slides",
          "url": "./parc-slides.html"
        },
        {
          "label": "Download PowerPoint",
          "url": "./assets/PowerPoints/ShearFlow-PARC-web.pptx",
          "download": true
        },
        {
          "label": "PARCtorch code",
          "url": "https://github.com/JuneWayne/PARCtorch/"
        }
      ],
      "linkToResource": true
    },
    {
      "id": "multilingual-bias",
      "title": "CS 2501: Intro to Research – Multilingual Bias in Gendered Linguistic Context of NLP Models",
      "summary": "An NLP research project that discovered that toxicity and sentiment scores generally changed more for English comments with female pronouns than for those with male pronouns after translation into Turkish or Finnish (the two genderless languages).",
      "details": [
        "Built a four-language dataset by translating a pronoun-balanced sample of RtGender Reddit comments from English into Dutch, Turkish, and Finnish. Used perturbation sensitivity analysis to compare predictions from eight language-specific classifiers."
      ],
      "role": "Course project",
      "dates": "September 2025 – December 2025",
      "supervisors": "Dr. Briana Morrison",
      "organization": "University of Virginia",
      "links": [
        {
          "label": "Project paper",
          "url": "https://junewayne.github.io/Multilingual-Gender-Bias-in-NLP/"
        }
      ],
      "linkToResource": true
    },
    {
      "id": "robotic-navigation",
      "title": "MAE 6270: Experimental Robotics – Calibrated Automatic & Teleoperated Robotic Navigation",
      "summary": "Designed a four-wheel-drive ROS 2 robot for joystick teleoperation and automated maneuvers. Calibrated its drive system by developing a linear regression model to measure patterns in observed driven distance to expected motion distance.",
      "details": [
        "Built a graphics user interface via Qt design that displayed compressed video from the robot’s RGB-D camera alongside 3D LiDAR scans, allowing the operator to assess obstacles and navigate remotely over Wi-Fi and via the GUI solely."
      ],
      "role": "Course project",
      "dates": "September 2026 – November 2026",
      "supervisors": "Dr. Tomonari Furukawa",
      "organization": "University of Virginia",
      "links": [
        {
          "label": "Presentation slides",
          "url": "https://junewayne.github.io/MAE6270-FridgeBot/"
        },
        {
          "label": "Technical report",
          "url": "https://junewayne.github.io/MAE6270-FridgeBot/report/"
        }
      ],
      "linkToResource": true
    }
  ],
  teaching: [
    {
      "code": "COMM 4351",
      "title": "Marketing Analytics with Big Data",
      "institution": "University of Virginia",
      "role": "Guest Lecturer",
      "term": "September 2025 – December 2026",
      "photo": {
        "src": "./assets/images/experience/guest-lecture.jpg",
        "alt": "Ethan presenting Agent Frameworks and Databases in a COMM 4351 lecture.",
        "width": 1613,
        "height": 975,
        "position": "50% 55%"
      },
      "description": "Taught Multi-Agent Orchestration in Market Research workflows, designing Retrieval Augmented Generation (RAG) systems for preserving agent memory in such workflows, and Python basics in data manipulation and exploratory data analysis.",
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
      ],
      "id": "comm-4351",
      "instructor": "Professor Natasha Foutz"
    },
    {
      "code": "SARC 5400",
      "title": "Data Visualization",
      "institution": "University of Virginia",
      "role": "Teaching Assistant",
      "id": "sarc-5400",
      "term": "January 2025 – April 2025",
      "description": "Taught and advised Data Visualization & Story Telling Techniques and supervised MSDS student final data visualization.",
      "photo": {
        "src": "./assets/images/experience/sarc-5400.jpeg",
        "alt": "A SARC 5400 lecture in front of a wall of data visualizations.",
        "width": 865,
        "height": 1085,
        "position": "50% 75%"
      },
      "instructor": "Professor Eric Field"
    },
    {
      "title": "Charlottesville Debate League",
      "institution": "Charlottesville, Virginia",
      "role": "Debate Coach & Tournament Chair",
      "description": "I joined the Charlottesville Debate League as a debate coach and taught for a year at several local middle schools before transitioning to tournament committee chair, where I organized, planned, and managed speech and debate tournaments for Charlottesville middle school students.",
      "photo": {
        "src": "./assets/images/experience/cdl-team.jpg",
        "alt": "The Charlottesville Debate League team gathered in a lecture hall.",
        "width": 1706,
        "height": 1279,
        "position": "50% 60%"
      },
      "id": "cdl",
      "term": "January 2024 – Present"
    },
    {
      "id": "msba-grader",
      "code": "GBAC 7209 · GBAC 7215",
      "title": "Data Analytics II & III",
      "role": "Teaching Assistant",
      "term": "January 2026 – April 2026",
      "description": "Taught and graded MSBA data analytics course student homework and projects, covering topics on predictive analytics, deep learning, and text analytics.",
      "instructor": "Professor Mousavi"
    }
  ],
  // Homepage previews; add other animals here as your collection grows.
  animals: [
    { title: "Layla", src: "./assets/images/cats/layla-sofa.jpg", width: 1280, height: 1669,
      alt: "Layla looking over her shoulder while resting on a cream sofa.", url: "./cat.html", position: "50% 0%" },
    { title: "Blake", src: "./assets/images/cats/blake-loaf.jpg", width: 1279, height: 1706, alt: "Blake looking up with his paws tucked beneath him.", url: "./blake.html", position: "50% 60%" },
  ],
  blake: {
    "name": "Blake",
    "bio": "I met Blake in North Carolina during my internship.\nHe had a sister too (Sheriff) but she wasn't as affective as Blake.\nI thank my landlord and the cat owner for their generosity in allowing me to take care of the two cats over the summer.",
    "description": "",
    "loves": [],
    "hero": "./assets/images/cats/blake-loaf.jpg",
    "heroAlt": "Blake looking up with his paws tucked beneath him.",
    "photos": [
        {
            "id": "blake-selfie",
            "src": "./assets/images/cats/blake-selfie.jpg",
            "width": 1706,
            "height": 1279,
            "alt": "Ethan beside Blake, who is stretched across the back of a chair.",
            "title": "Together",
            "category": "Blake"
        },
        {
            "id": "blake-counter",
            "src": "./assets/images/cats/blake-counter.jpg",
            "width": 960,
            "height": 1282,
            "alt": "Blake stretched out on a kitchen counter while being petted.",
            "title": "Kitchen company",
            "category": "Blake"
        },
        {
            "id": "blake-bottle",
            "src": "./assets/images/cats/blake-bottle.jpg",
            "width": 1279,
            "height": 1706,
            "alt": "Blake holding a water bottle between his paws.",
            "title": "Finders keepers",
            "category": "Blake"
        },
        {
            "id": "blake-sofa",
            "src": "./assets/images/cats/blake-sofa.jpg",
            "width": 960,
            "height": 1282,
            "alt": "Blake curled up beside Ethan on the sofa.",
            "title": "On the sofa",
            "category": "Blake"
        },
        {
            "id": "blake-loaf",
            "src": "./assets/images/cats/blake-loaf.jpg",
            "width": 1279,
            "height": 1706,
            "alt": "Blake looking up with his paws tucked beneath him.",
            "title": "Paws tucked",
            "category": "Blake"
        },
        {
            "id": "blake-glasses",
            "src": "./assets/images/cats/blake-glasses.jpg",
            "width": 932,
            "height": 1658,
            "alt": "Blake wearing glasses while resting on a cardboard scratcher.",
            "title": "Borrowed glasses",
            "category": "Blake"
        }
    ]
},
  cat: {
    name: "Layla",
    bio: "Layla was adopted back in 2022,\nshe was born on April 19, 2022.",
    description: "",
    loves: [],
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
      { id: "head", src: "./assets/images/cats/layla-head.jpg", width: 1279, height: 1706,
        alt: "The top of Layla’s head, ears, and whiskers as she looks up.",
        title: "Looking up", category: "Layla" },
    ],
  },
};

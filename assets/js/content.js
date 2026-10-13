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
  // Set url to "./assets/documents/cv.pdf" after adding your PDF.
  cv: { url: null, updated: null },
  research: [
    {
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
      "description": "A guest lecture on building AI agents, with hands-on notebooks covering APIs, chatbots, LangChain, retrieval-augmented generation, and hierarchical multi-agent workflows.",
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

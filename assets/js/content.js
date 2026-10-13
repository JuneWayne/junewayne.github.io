/**
 * Edit this file to update the site. Paths are relative to the website root.
 * Research and teaching are intentionally empty until real entries are supplied.
 * See README.md for complete examples.
 */
export const site = {
  name: "Ethan (Yisong) Cao",
  bio: [
    "I’m a fourth-year undergraduate at the University of Virginia, majoring in Data Science with a concentration in Machine Learning and Data Engineering, and minoring in Computer Science.",
    "I’m fascinated by the mechanisms underlying deep neural networks, especially transformers. This has led me to investigate the mechanisms and alignment of large language models and multimodal transformers.",
    "I believe in research for impact. I measure my work by whether it addresses persistent challenges or uncovers insights that have not yet surfaced in the field. I’m open to inquiries and opportunities, not to mention I am actively seeking graduate opportunities and internships myself.",
  ],
  // Set to "./assets/images/portrait.jpg" after adding your photo.
  portrait: null,
  portraitAlt: "Portrait of Ethan (Yisong) Cao",
  links: [
    { label: "ethan128@me.com", url: "mailto:ethan128@me.com" },
    { label: "wkt7ne@virginia.edu", url: "mailto:wkt7ne@virginia.edu" },
    { label: "GitHub", url: "https://github.com/JuneWayne" },
  ],
  // Set url to "./assets/documents/cv.pdf" after adding your PDF.
  cv: { url: null, updated: null },
  research: [],
  teaching: [],
  // Homepage previews; add other animals here as your collection grows.
  animals: [
    { title: "Layla", src: "./assets/images/cats/layla2.jpg", width: 3024, height: 4032,
      alt: "Layla peeking around a wooden chair while lying on her back.", url: "./cat.html" },
    { title: "Ducks", src: "./assets/images/cats/duck2.jpg", width: 1276, height: 1702,
      alt: "A white bird reaching toward pellets in an outstretched hand.", url: "./cat.html#photos" },
  ],
  cat: {
    name: "Layla",
    bio: "Born in Shanghai, home with me since she was four months old.",
    description: "A collection of her little moments, big stretches, and very important naps.",
    loves: ["Catnip", "Mouse toys", "Hide-and-seek", "Ducks"],
    hero: "./assets/images/cats/layla2.jpg",
    heroAlt: "Layla peeking around a wooden chair while lying on her back.",
    photos: [
      { id: "belly-up", src: "./assets/images/cats/layla.jpg", width: 3024, height: 4032,
        alt: "Layla lying on her back on the wooden floor, looking up at the camera.",
        title: "The upside-down approach", description: "Belly up, paws tucked, waiting to be noticed.", category: "Layla" },
      { id: "hide-and-seek", src: "./assets/images/cats/layla2.jpg", width: 3024, height: 4032,
        alt: "Layla lying behind a chair leg with her head peeking out.",
        title: "A questionable hiding spot", description: "Hide-and-seek, with a little help from the furniture.", category: "Layla" },
      { id: "big-stretch", src: "./assets/images/cats/layla3.jpg", width: 4032, height: 3024,
        alt: "Layla stretched out on the floor beside a rug.",
        title: "A very important stretch", description: "The floor is hers. The rest of us can work around it.", category: "Layla" },
      { id: "chair-meeting", src: "./assets/images/cats/laylaandmaomi.jpg", width: 1280, height: 1706,
        alt: "Layla and another silver cat facing each other around a wooden chair.",
        title: "An impromptu meeting", description: "Two cats. One chair. Plenty to discuss.", category: "Layla" },
      { id: "ducks-one", src: "./assets/images/cats/duck1.jpg", width: 1280, height: 1707,
        alt: "Three white birds beside a water basin in an outdoor enclosure.", title: "A few of her favorite things",
        description: "The ducks deserve a place in Layla’s album, too.", category: "Her world" },
      { id: "ducks-two", src: "./assets/images/cats/duck2.jpg", width: 1276, height: 1702,
        alt: "A white bird reaching toward pellets in an outstretched hand.", title: "More from the duck files",
        description: "There is always room for one more duck photo.", category: "Her world" },
    ],
  },
};

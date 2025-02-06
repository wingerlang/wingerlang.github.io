interface Post {
  title: string;
  content: string;
}

const posts: Post[] = [
  { title: "Första inlägget", content: "Detta är mitt första inlägg." },
  { title: "Andra inlägget", content: "Detta är mitt andra inlägg." }
];

// Funktion som renderar inläggen i div#blog
function renderPosts() {
  const blogDiv = document.getElementById("blog");
  if (!blogDiv) return;
  
  posts.forEach((post: Post) => {
    const article = document.createElement("article");
    const h2 = document.createElement("h2");
    h2.textContent = post.title;
    const p = document.createElement("p");
    p.textContent = post.content;
    
    article.appendChild(h2);
    article.appendChild(p);
    blogDiv.appendChild(article);
  });
}

// Kör renderPosts när dokumentet är färdigladdat
document.addEventListener("DOMContentLoaded", renderPosts);

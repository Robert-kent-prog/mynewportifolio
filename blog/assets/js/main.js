(() => {
  "use strict";

  const posts = Array.isArray(window.blogPosts) ? [...window.blogPosts] : [];
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = siteNav
    ? Array.from(siteNav.querySelectorAll('a[href^="#"], a[href$="index.html"]'))
    : [];
  const revealElements = document.querySelectorAll(".reveal");
  const currentYear = document.getElementById("current-year");
  const totalPosts = document.getElementById("total-posts");
  const totalTopics = document.getElementById("total-topics");
  const spotlightCard = document.getElementById("spotlight-card");
  const topicsGrid = document.getElementById("topics-grid");
  const filterGroup = document.getElementById("filter-group");
  const featuredGrid = document.getElementById("featured-grid");
  const archiveGrid = document.getElementById("archive-grid");
  const searchInput = document.getElementById("search-input");
  const resultsCount = document.getElementById("results-count");
  const emptyState = document.getElementById("empty-state");

  const categoryMeta = {
    JavaScript: {
      description:
        "Fundamentals, syntax, and practical reasoning for developers learning the language well.",
    },
    Linux: {
      description:
        "Environment setup, terminal workflows, and tooling that supports practical engineering work.",
    },
    Backend: {
      description:
        "Architecture, APIs, data, and server-side thinking as the archive expands.",
    },
    Mobile: {
      description:
        "React Native notes, build lessons, and product implementation details from app work.",
    },
  };

  const state = {
    query: "",
    category: "All",
  };

  const hasActiveFilters = () =>
    state.category !== "All" || state.query.trim().length > 0;

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  if (totalPosts) {
    totalPosts.textContent = `${posts.length} published posts`;
  }

  const categories = Array.from(new Set(posts.map((post) => post.category)));

  if (totalTopics) {
    totalTopics.textContent = `${categories.length} active categories`;
  }

  const closeMenu = () => {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
      siteNav.classList.toggle("is-open", !isExpanded);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !siteNav.contains(target) &&
        !menuToggle.contains(target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const createPostCard = (post, mode = "archive") => {
    const tagMarkup = post.tags
      .slice(0, mode === "featured" ? 4 : 3)
      .map((tag) => `<span class="tag">${tag}</span>`)
      .join("");

    return `
      <article class="post-card post-card-${mode}">
        <div class="post-media">
          <img
            src="${post.image}"
            alt="${post.title}"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-category">${post.category}</span>
            <span class="post-platform">${post.platform}</span>
          </div>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <div class="tag-list">${tagMarkup}</div>
          <a
            class="text-link"
            href="${post.url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read article <i class="bi bi-arrow-up-right"></i>
          </a>
        </div>
      </article>
    `;
  };

  const renderSpotlight = (filteredPosts) => {
    if (!spotlightCard) return;

    const isFiltering = hasActiveFilters();
    const activePosts =
      filteredPosts.length > 0 ? filteredPosts : isFiltering ? [] : posts;

    if (activePosts.length === 0) {
      spotlightCard.innerHTML = `
        <span class="spotlight-label">Search status</span>
        <div class="spotlight-copy">
          <p class="spotlight-meta">No matching posts</p>
          <h2>No article matched that search yet.</h2>
          <p>Try a broader keyword, switch back to all categories, or open the full archive below.</p>
        </div>
      `;
      return;
    }

    const post = activePosts[0];
    spotlightCard.innerHTML = `
      <span class="spotlight-label">${isFiltering ? "Top match" : "Latest spotlight"}</span>
      <div class="spotlight-media">
        <img
          src="${post.image}"
          alt="${post.title}"
          loading="eager"
          decoding="async"
        />
      </div>
      <div class="spotlight-copy">
        <p class="spotlight-meta">${post.category} · ${post.platform}</p>
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
        <a
          class="text-link light-link"
          href="${post.url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open article <i class="bi bi-arrow-up-right"></i>
        </a>
      </div>
    `;
  };

  const renderTopics = () => {
    if (!topicsGrid) return;

    const topicCards = Object.keys(categoryMeta)
      .map((category) => {
        const count = posts.filter((post) => post.category === category).length;
        const status = count > 0 ? `${count} post${count === 1 ? "" : "s"}` : "More planned";

        return `
          <article class="topic-card reveal">
            <span class="topic-name">${category}</span>
            <strong>${status}</strong>
            <p>${categoryMeta[category].description}</p>
          </article>
        `;
      })
      .join("");

    topicsGrid.innerHTML = topicCards;
  };

  const renderFilterButtons = () => {
    if (!filterGroup) return;

    const filterButtons = ["All", ...categories]
      .map((category) => {
        const isActive = state.category === category;
        return `
          <button
            class="filter-button${isActive ? " is-active" : ""}"
            type="button"
            data-category="${category}"
          >
            ${category}
          </button>
        `;
      })
      .join("");

    filterGroup.innerHTML = filterButtons;

    filterGroup.querySelectorAll(".filter-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.getAttribute("data-category") || "All";
        renderFilterButtons();
        renderArchive();
      });
    });
  };

  const getFilteredPosts = () => {
    const query = state.query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        state.category === "All" || post.category === state.category;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        post.title,
        post.excerpt,
        post.category,
        ...(post.tags || []),
      ]
      .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  };

  const renderFeatured = (filteredPosts) => {
    if (!featuredGrid) return;

    const isFiltering = hasActiveFilters();
    const featuredPosts = isFiltering
      ? filteredPosts.slice(0, 3)
      : posts.filter((post) => post.featured).slice(0, 3);

    if (featuredPosts.length === 0) {
      featuredGrid.innerHTML = `
        <article class="post-card post-card-empty">
          <div class="post-body">
            <div class="post-meta">
              <span class="post-category">Search</span>
              <span class="post-platform">No matches</span>
            </div>
            <h3>No featured result for this search.</h3>
            <p>Adjust the keyword or category filter and the matching posts will appear here immediately.</p>
          </div>
        </article>
      `;
      return;
    }

    featuredGrid.innerHTML = featuredPosts
      .map((post) => createPostCard(post, "featured"))
      .join("");
  };

  const renderArchive = (filteredPosts) => {
    if (!archiveGrid || !resultsCount || !emptyState) return;

    resultsCount.textContent = `${filteredPosts.length} post${
      filteredPosts.length === 1 ? "" : "s"
    } shown below`;

    archiveGrid.innerHTML = filteredPosts
      .map((post) => createPostCard(post, "archive"))
      .join("");

    emptyState.hidden = filteredPosts.length !== 0;
  };

  const renderListings = () => {
    const filteredPosts = getFilteredPosts();
    renderSpotlight(filteredPosts);
    renderFeatured(filteredPosts);
    renderArchive(filteredPosts);
  };

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      state.query = target.value;
      renderListings();
    });
  }

  renderSpotlight(posts);
  renderTopics();
  renderFilterButtons();
  renderFeatured(posts);
  renderArchive(posts);
})();

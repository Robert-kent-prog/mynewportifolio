(() => {
  "use strict";

  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = siteNav
    ? Array.from(siteNav.querySelectorAll('a[href^="#"]'))
    : [];
  const revealElements = document.querySelectorAll(".reveal");
  const currentYear = document.getElementById("current-year");
  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const submitButton = document.getElementById("submit-button");

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  if (menuToggle && siteNav) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    };

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
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  if (navLinks.length > 0) {
    const sections = navLinks
      .map((link) => {
        const targetId = link.getAttribute("href");
        return targetId ? document.querySelector(targetId) : null;
      })
      .filter(Boolean);

    let ticking = false;

    const updateActiveLink = () => {
      const scrollPosition = window.scrollY + 160;
      let activeId = sections[0]?.id ?? "";

      sections.forEach((section) => {
        if (section instanceof HTMLElement && scrollPosition >= section.offsetTop) {
          activeId = section.id;
        }
      });

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const requestActiveLinkUpdate = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          updateActiveLink();
          ticking = false;
        });
      }
    };

    updateActiveLink();
    window.addEventListener("scroll", requestActiveLinkUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestActiveLinkUpdate);
  }

  if (form && formStatus && submitButton) {
    const setStatus = (message, type = "") => {
      formStatus.textContent = message;
      formStatus.classList.remove("is-success", "is-error");

      if (type === "success") {
        formStatus.classList.add("is-success");
      }

      if (type === "error") {
        formStatus.classList.add("is-error");
      }
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      const recipient = form.dataset.recipient || "robertmuendo23@gmail.com";
      const formData = new FormData(form);
      const name = String(formData.get("your-name") || "").trim();
      const email = String(formData.get("your-email") || "").trim();
      const subject = String(formData.get("your-subject") || "").trim();
      const message = String(formData.get("your-message") || "").trim();

      const emailBody = [
        "Hello Robert,",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n");

      const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(recipient)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(emailBody)}`;

      const mailtoUrl =
        `mailto:${recipient}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(emailBody)}`;

      submitButton.disabled = true;
      setStatus("Opening your email draft...");

      try {
        const gmailWindow = window.open(gmailUrl, "_blank", "noopener,noreferrer");

        if (!gmailWindow) {
          window.location.href = mailtoUrl;
        }

        setStatus(
          "Your draft is ready. Review it and send it from your email app.",
          "success",
        );
      } catch (error) {
        window.location.href = mailtoUrl;
        setStatus(
          "Opening your default mail app with the draft details.",
          "success",
        );
      } finally {
        submitButton.disabled = false;
      }
    });
  }
})();

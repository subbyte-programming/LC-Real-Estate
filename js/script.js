(() => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");
  const scrollProgress = document.querySelector("#scroll-progress");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 45);
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  };

  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
  document.querySelector("#current-year").textContent = new Date().getFullYear();

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const hero = document.querySelector(".hero");
  const cameraImage = hero.querySelector(".hero-image img");
  const marketCardImage = hero.querySelector(".market-card-image img");
  const marketCardKicker = hero.querySelector(".market-card-kicker");
  const marketCardTitle = hero.querySelector(".market-card-title");
  const slideCount = hero.querySelector("[data-slide-count]");
  const slideDots = [...hero.querySelectorAll("[data-slide-to]")];
  const cameraZoomOutput = hero.querySelector(".camera-zoom-level");
  const cameraZoomIn = hero.querySelector('[data-camera="in"]');
  const cameraZoomOut = hero.querySelector('[data-camera="out"]');
  const baseZoom = 1.04;
  const minZoom = baseZoom;
  const maxZoom = 2.5;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let cameraZoom = baseZoom;
  let cameraYaw = 0;
  let cameraPitch = 0;
  let focusX = 50;
  let focusY = 50;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartYaw = 0;
  let dragStartPitch = 0;
  let slideIndex = 0;
  let slideTransition;
  let heroIsVisible = true;
  const heroSlides = [
    {
      src: "images/main-banner1.jpg",
      alt: "Contemporary home surrounded by considered landscaping",
      kicker: "LOCAL PERSPECTIVE · 01",
      title: ["A smarter move.", "Starts right here."]
    },
    {
      src: "images/main-banner2.jpg",
      alt: "Modern property architecture in the Dallas Fort Worth area",
      kicker: "ROOM TO GROW · 02",
      title: ["Opportunity.", "Grounded in Texas."]
    },
    {
      src: "images/main-banner3.jpg",
      alt: "Welcoming modern home ready for its next chapter",
      kicker: "YOUR NEXT CHAPTER · 03",
      title: ["Find your place.", "Make it yours."]
    }
  ];

  const renderCamera = () => {
    cameraImage.style.setProperty("--camera-zoom", cameraZoom.toFixed(2));
    cameraImage.style.setProperty("--camera-rotate-y", `${cameraYaw.toFixed(2)}deg`);
    cameraImage.style.setProperty("--camera-rotate-x", `${cameraPitch.toFixed(2)}deg`);
    cameraImage.style.setProperty("--camera-x", `${(-cameraYaw * 1.8).toFixed(1)}px`);
    cameraImage.style.setProperty("--camera-y", `${(cameraPitch * 1.5).toFixed(1)}px`);
    cameraImage.style.setProperty("--camera-focus-x", `${focusX.toFixed(1)}%`);
    cameraImage.style.setProperty("--camera-focus-y", `${focusY.toFixed(1)}%`);
    cameraZoomOutput.value = `${Math.round((cameraZoom / baseZoom) * 100)}%`;
    cameraZoomIn.disabled = cameraZoom >= maxZoom;
    cameraZoomOut.disabled = cameraZoom <= minZoom;
  };

  const setZoom = (zoom) => {
    cameraZoom = clamp(zoom, minZoom, maxZoom);
    renderCamera();
  };

  const setCameraAngle = (yaw, pitch, x = focusX, y = focusY) => {
    cameraYaw = clamp(yaw, -14, 14);
    cameraPitch = clamp(pitch, -9, 9);
    focusX = clamp(x, 0, 100);
    focusY = clamp(y, 0, 100);
    renderCamera();
  };

  const showSlide = (nextIndex) => {
    const normalizedIndex = (nextIndex + heroSlides.length) % heroSlides.length;
    if (normalizedIndex === slideIndex) return;

    slideIndex = normalizedIndex;
    const slide = heroSlides[slideIndex];
    clearTimeout(slideTransition);
    cameraZoom = baseZoom;
    setCameraAngle(0, 0, 50, 50);
    cameraImage.style.opacity = "0";
    marketCardImage.style.opacity = "0";
    slideCount.textContent = `0${slideIndex + 1} / 0${heroSlides.length}`;
    marketCardKicker.lastChild.textContent = ` ${slide.kicker}`;
    marketCardTitle.querySelector("span").textContent = slide.title[0];
    marketCardTitle.querySelector("em").textContent = slide.title[1];
    slideDots.forEach((dot, index) => {
      const isActive = index === slideIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
    renderCamera();

    slideTransition = window.setTimeout(() => {
      cameraImage.src = slide.src;
      cameraImage.alt = slide.alt;
      marketCardImage.src = slide.src;
      requestAnimationFrame(() => {
        cameraImage.style.opacity = "1";
        marketCardImage.style.opacity = "1";
      });
    }, reducedMotion ? 0 : 180);
  };

  hero.querySelector('[data-slide="previous"]').addEventListener("click", () => showSlide(slideIndex - 1));
  hero.querySelector('[data-slide="next"]').addEventListener("click", () => showSlide(slideIndex + 1));
  slideDots.forEach((dot) => {
    dot.addEventListener("click", () => showSlide(Number(dot.dataset.slideTo)));
  });
  if (!reducedMotion) {
    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        heroIsVisible = entry.isIntersecting;
      });
      heroObserver.observe(hero);
    }
    window.setInterval(() => {
      if (!hero.matches(":hover") && !hero.contains(document.activeElement)
        && document.visibilityState === "visible" && heroIsVisible && dragPointerId === null) {
        showSlide(slideIndex + 1);
      }
    }, 7000);
  }

  const isControlTarget = (target) => target instanceof Element
    && Boolean(target.closest("a, button, input, select, textarea, .hero-content, .hero-market-card, .hero-camera-controls"));

  const setAngleFromPointer = (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    setCameraAngle((x - 0.5) * 11, (y - 0.5) * -6, x * 100, y * 100);
  };

  hero.querySelectorAll("[data-camera]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.camera === "in") setZoom(cameraZoom + 0.18);
      if (button.dataset.camera === "out") setZoom(cameraZoom - 0.18);
      if (button.dataset.camera === "reset") {
        cameraZoom = baseZoom;
        setCameraAngle(0, 0, 50, 50);
      }
    });
  });
  renderCamera();

  hero.addEventListener("pointermove", (event) => {
    if (dragPointerId !== null || isControlTarget(event.target)) return;
    if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) setAngleFromPointer(event);
  });
  hero.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || isControlTarget(event.target)) return;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartYaw = cameraYaw;
    dragStartPitch = cameraPitch;
    hero.classList.add("is-dragging");
    event.preventDefault();
  });

  window.addEventListener("pointermove", (event) => {
    if (event.pointerId !== dragPointerId) return;
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setCameraAngle(
      dragStartYaw + (event.clientX - dragStartX) * 0.22,
      dragStartPitch - (event.clientY - dragStartY) * 0.16,
      x,
      y
    );
  });
  window.addEventListener("pointerup", (event) => {
    if (event.pointerId !== dragPointerId) return;
    const dragDistance = event.clientX - dragStartX;
    dragPointerId = null;
    hero.classList.remove("is-dragging");
    if (event.pointerType === "touch" && Math.abs(dragDistance) > 65) {
      showSlide(slideIndex + (dragDistance < 0 ? 1 : -1));
    }
  });
  window.addEventListener("pointercancel", () => {
    dragPointerId = null;
    hero.classList.remove("is-dragging");
  });
  hero.addEventListener("pointerleave", () => {
    if (dragPointerId === null && window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
      setCameraAngle(0, 0, 50, 50);
    }
  });
  hero.addEventListener("wheel", (event) => {
    if ((!event.ctrlKey && !event.metaKey) || isControlTarget(event.target)) return;
    event.preventDefault();
    setZoom(cameraZoom + (event.deltaY < 0 ? 0.12 : -0.12));
  }, { passive: false });
  hero.addEventListener("keydown", (event) => {
    if (event.target !== hero) return;
    const angleStep = 2;
    if (event.key === "ArrowLeft") setCameraAngle(cameraYaw - angleStep, cameraPitch);
    else if (event.key === "ArrowRight") setCameraAngle(cameraYaw + angleStep, cameraPitch);
    else if (event.key === "ArrowUp") setCameraAngle(cameraYaw, cameraPitch - angleStep);
    else if (event.key === "ArrowDown") setCameraAngle(cameraYaw, cameraPitch + angleStep);
    else if (event.key === "+" || event.key === "=") setZoom(cameraZoom + 0.18);
    else if (event.key === "-") setZoom(cameraZoom - 0.18);
    else if (event.key === "0") {
      cameraZoom = baseZoom;
      setCameraAngle(0, 0, 50, 50);
    } else return;
    event.preventDefault();
  });

  document.querySelectorAll("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelector("#interest").value = link.dataset.interest;
    });
  });

  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty("--tilt-x", `${x * 5}deg`);
        card.style.setProperty("--tilt-y", `${y * -5}deg`);
        if (card.classList.contains("service-card") || card.classList.contains("hub-card")) {
          card.style.setProperty("--pointer-x", `${((x + 0.5) * 100).toFixed(1)}%`);
          card.style.setProperty("--pointer-y", `${((y + 0.5) * 100).toFixed(1)}%`);
        }
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });

    document.querySelectorAll("[data-depth]").forEach((surface) => {
      surface.addEventListener("pointermove", (event) => {
        const bounds = surface.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        const image = surface.querySelector("img");
        if (surface.classList.contains("hero-image")) {
          image.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0) scale(1.04)`;
        } else {
          image.style.transform = `perspective(1000px) rotateY(${x * 2.5}deg) rotateX(${y * -2.5}deg) scale(1.035)`;
        }
      });
      surface.addEventListener("pointerleave", () => {
        const image = surface.querySelector("img");
        image.style.removeProperty("transform");
      });
    });
  }

  const contactForm = document.querySelector("#contact-form");
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const subject = `Website inquiry: ${formData.get("interest")}`;
    const body = [
      `Name: ${formData.get("name")}`,
      `Phone: ${formData.get("phone")}`,
      `Email: ${formData.get("email")}`,
      `Interested in: ${formData.get("interest")}`,
      "",
      "Message:",
      formData.get("message") || "(No message provided)"
    ].join("\n");
    const mailto = `mailto:info@thelcrealestategroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.querySelector("#form-note").textContent = "Your email app should open with your inquiry ready to send. If it doesn’t, email info@thelcrealestategroup.com.";
    window.location.href = mailto;
  });
})();

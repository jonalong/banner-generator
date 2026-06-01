/* ===================================================================
 * 힐오 배너 생성기 · Main JS (Tailwind 버전)
 * - focus highlight: inline color toggle (selector chain 제거)
 * - tab/dropzone 활성화: data-attribute 토글
 * =================================================================== */

(() => {
  "use strict";

  // ============================================================
  // State
  // ============================================================
  const state = {
    mode: "home", // "home" | "regional"
    badge1: "",
    badge2: "",
    tag: "",
    hospitalName: "",
    location: "",
    imageDataUrl: "",
    gradient: {
      startColor: "#000000",
      startOpacity: 62,
      endColor: "#000000",
      endOpacity: 0,
    },
    tagTextColor: "#4f4f4f",
  };

  // ============================================================
  // Colors (Tailwind config 와 동일하게 유지)
  // ============================================================
  const COLOR = {
    brand:     "#14CC62", // primary-500
    highlight: "#2AEC7C", // primary-400 (focus highlight)
    white:     "#FFFFFF",
    tagDefault:"#4f4f4f",
  };

  // ============================================================
  // DOM References
  // ============================================================
  const $ = (id) => document.getElementById(id);

  const input = {
    badge1: $("badge1"),
    badge2: $("badge2"),
    tag: $("tag"),
    hospitalName: $("hospitalName"),
    location: $("location"),
  };

  const imageInput = $("imageInput");
  const uploadDropzone = $("uploadDropzone");
  const uploadPlaceholder = $("uploadPlaceholder");
  const uploadPreview = $("uploadPreview");
  const uploadPreviewImg = $("uploadPreviewImg");
  const uploadRemove = $("uploadRemove");

  const banner = $("bannerPreview");
  const bannerImage = $("bannerImage");
  const bannerOverlay = $("bannerOverlay");
  const chipBadge1 = $("chipBadge1");
  const chipBadge2 = $("chipBadge2");
  const textBadge1 = $("textBadge1");
  const textBadge2 = $("textBadge2");
  const textTag = $("textTag");
  const textHospitalName = $("textHospitalName");
  const textLocation = $("textLocation");

  const grad = {
    startColor: $("gradStartColor"),
    startHex: $("gradStartHex"),
    endColor: $("gradEndColor"),
    endHex: $("gradEndHex"),
  };
  const tagTextColorPicker = $("tagTextColor");
  const tagTextHex = $("tagTextHex");

  const downloadBtn = $("downloadBtn");
  const toast = $("toast");

  // ============================================================
  // Utility
  // ============================================================
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

  const showToast = (() => {
    let timer = null;
    return (message) => {
      toast.textContent = message;
      toast.hidden = false;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { toast.hidden = true; }, 2400);
    };
  })();

  const hexToRgba = (hex, opacityPercent) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    const a = (opacityPercent / 100).toFixed(3);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const isValidHex = (str) => /^#[0-9A-Fa-f]{6}$/.test(str);

  const sanitizeFileName = (str) =>
    str.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").substring(0, 40) || "untitled";

  const formatDate = () => {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd}`;
  };

  // ============================================================
  // Mode (Tab) Handling
  // ============================================================
  const tabs = document.querySelectorAll("[data-mode-btn]");

  const MODE_PLACEHOLDERS = {
    home: {
      badge1: "차별점 뱃지",
      badge2: "차별점 뱃지",
      tag: "위치입력(시,군,구)",
      hospitalName: "병원명 입력",
      location: "설명 문구 입력",
    },
    regional: {
      badge1: "차별점 뱃지",
      badge2: "차별점 뱃지",
      tag: "태그 영역(지역)",
      hospitalName: "병원명 입력",
      location: "",
    },
  };

  // mode별 banner content padding (regional은 우측 큰 패딩)
  const applyBannerLayout = () => {
    const content = banner.querySelector(".banner-content");
    if (!content) return;
    if (state.mode === "regional") {
      content.style.padding = "2.25em 22.5em 2.25em 2.25em";
      textLocation.style.display = "none";
      // regional은 병원명 글자 작아짐 + 더 진한 그림자
      textHospitalName.style.fontSize = "3.75em";
      textHospitalName.style.lineHeight = "1.2";
      textHospitalName.style.textShadow = "0 0 0.75em rgba(0,0,0,0.25)";
    } else {
      content.style.padding = "2.25em 3em 3em";
      textLocation.style.display = "";
      textHospitalName.style.fontSize = "4.125em";
      textHospitalName.style.lineHeight = "1.0909";
      textHospitalName.style.textShadow = "";
    }
  };

  const setMode = (mode) => {
    if (mode !== "home" && mode !== "regional") return;
    state.mode = mode;

    // 탭 active toggle (data-attribute 기반)
    tabs.forEach((t) => {
      t.dataset.active = t.dataset.modeBtn === mode ? "true" : "false";
    });

    // banner dataset 변경 (CSS aspect-ratio 자동 적용)
    banner.dataset.mode = mode;

    // mode-only 요소 표시/숨김
    document.querySelectorAll("[data-mode-only]").forEach((el) => {
      el.hidden = el.dataset.modeOnly !== mode;
    });

    applyBannerLayout();
    renderBanner();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.modeBtn));
  });

  // ============================================================
  // Image Handling
  // ============================================================
  const validateImageFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast("PNG 또는 JPG 파일만 업로드할 수 있어요.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast("이미지는 5MB 이하만 업로드할 수 있어요.");
      return false;
    }
    return true;
  };

  const readImageFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageFile = async (file) => {
    if (!validateImageFile(file)) return;
    try {
      const dataUrl = await readImageFile(file);
      state.imageDataUrl = dataUrl;
      uploadPreviewImg.src = dataUrl;
      uploadPlaceholder.hidden = true;
      uploadPreview.hidden = false;
      renderBanner();
    } catch (err) {
      showToast("이미지를 불러오지 못했어요.");
    }
  };

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  });

  uploadRemove.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    state.imageDataUrl = "";
    imageInput.value = "";
    uploadPreviewImg.src = "";
    uploadPreview.hidden = true;
    uploadPlaceholder.hidden = false;
    renderBanner();
  });

  // Drag & drop
  ["dragenter", "dragover"].forEach((evt) => {
    uploadDropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadDropzone.dataset.dragover = "true";
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    uploadDropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadDropzone.dataset.dragover = "false";
    });
  });
  uploadDropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageFile(file);
  });

  // ============================================================
  // Render Banner
  // ============================================================
  const renderBanner = () => {
    if (state.imageDataUrl) {
      bannerImage.src = state.imageDataUrl;
      bannerImage.classList.remove("hidden");
    } else {
      bannerImage.removeAttribute("src");
      bannerImage.classList.add("hidden");
    }

    const ph = MODE_PLACEHOLDERS[state.mode] || MODE_PLACEHOLDERS.home;
    textBadge1.textContent = state.badge1 || ph.badge1;
    textBadge2.textContent = state.badge2 || ph.badge2;
    textTag.textContent = state.tag || ph.tag;
    textHospitalName.textContent = state.hospitalName || ph.hospitalName;
    textLocation.textContent = state.location || ph.location;

    applyGradient();
    applyTagTextColor();
  };

  const applyGradient = () => {
    const startRgba = hexToRgba(state.gradient.startColor, state.gradient.startOpacity);
    const endRgba = hexToRgba(state.gradient.endColor, state.gradient.endOpacity);

    if (state.mode === "regional") {
      bannerOverlay.style.background =
        `linear-gradient(259.985deg, ${endRgba} 32.622%, ${startRgba} 75.626%)`;
    } else {
      bannerOverlay.style.background =
        `linear-gradient(to right, ${startRgba} 0%, ${endRgba} 69.096%)`;
    }
  };

  const applyTagTextColor = () => {
    textTag.style.color = state.tagTextColor;
  };

  // ============================================================
  // Focus Highlight (inline style 직접 토글)
  // ============================================================
  const FOCUS_TARGETS = {
    badge1: [chipBadge1, textBadge1],
    badge2: [chipBadge2, textBadge2],
    tag: [textTag],
    hospitalName: [textHospitalName],
    location: [textLocation],
  };

  const setBannerFocus = (field) => {
    // 모든 focus highlight 원복
    Object.entries(FOCUS_TARGETS).forEach(([key, els]) => {
      els.forEach((el) => {
        if (key === "tag") {
          // tag는 사용자 지정 컬러로 복귀
          el.style.color = state.tagTextColor;
        } else {
          el.style.color = ""; // CSS class 정의(text-white)로 복귀
        }
      });
    });

    // 새 focus 적용
    if (field && FOCUS_TARGETS[field]) {
      FOCUS_TARGETS[field].forEach((el) => {
        el.style.color = COLOR.highlight;
      });
    }
  };

  Object.entries(input).forEach(([key, el]) => {
    if (!el) return;
    el.addEventListener("focus", () => setBannerFocus(key));
    el.addEventListener("blur", () => setBannerFocus(null));
    el.addEventListener("input", () => {
      state[key] = el.value.trim();
      renderBanner();
    });
  });

  // ============================================================
  // Gradient Handlers
  // ============================================================
  const onGradStartColor = (val) => {
    if (!isValidHex(val)) return;
    state.gradient.startColor = val.toLowerCase();
    grad.startColor.value = state.gradient.startColor;
    grad.startHex.value = val.toUpperCase();
    applyGradient();
  };

  const onGradEndColor = (val) => {
    if (!isValidHex(val)) return;
    state.gradient.endColor = val.toLowerCase();
    grad.endColor.value = state.gradient.endColor;
    grad.endHex.value = val.toUpperCase();
    applyGradient();
  };

  grad.startColor.addEventListener("input", (e) => onGradStartColor(e.target.value));
  grad.endColor.addEventListener("input", (e) => onGradEndColor(e.target.value));
  grad.startHex.addEventListener("input", (e) => {
    let v = e.target.value;
    if (!v.startsWith("#")) v = "#" + v;
    if (isValidHex(v)) onGradStartColor(v);
  });
  grad.endHex.addEventListener("input", (e) => {
    let v = e.target.value;
    if (!v.startsWith("#")) v = "#" + v;
    if (isValidHex(v)) onGradEndColor(v);
  });

  // ============================================================
  // Tag Text Color
  // ============================================================
  const onTagTextColor = (val) => {
    if (!isValidHex(val)) return;
    state.tagTextColor = val.toLowerCase();
    tagTextColorPicker.value = state.tagTextColor;
    tagTextHex.value = val.toUpperCase();
    applyTagTextColor();
  };

  tagTextColorPicker.addEventListener("input", (e) => onTagTextColor(e.target.value));
  tagTextHex.addEventListener("input", (e) => {
    let v = e.target.value;
    if (!v.startsWith("#")) v = "#" + v;
    if (isValidHex(v)) onTagTextColor(v);
  });

  // ============================================================
  // Download
  // ============================================================
  const prepareRenderTarget = () =>
    new Promise((resolve) => {
      const clone = banner.cloneNode(true);
      const isRegional = state.mode === "regional";
      const exportWidth = 1029;
      const exportHeight = isRegional ? 343 : 480;

      clone.style.position = "fixed";
      clone.style.top = "-9999px";
      clone.style.left = "-9999px";
      clone.style.width = `${exportWidth}px`;
      clone.style.height = `${exportHeight}px`;
      clone.style.aspectRatio = "auto";
      clone.style.borderRadius = "0";
      clone.style.maxWidth = "none";
      document.body.appendChild(clone);

      const img = clone.querySelector("img");
      if (img && img.getAttribute("src")) {
        if (img.complete && img.naturalWidth > 0) {
          requestAnimationFrame(() => resolve(clone));
        } else {
          img.onload = () => requestAnimationFrame(() => resolve(clone));
          img.onerror = () => requestAnimationFrame(() => resolve(clone));
        }
      } else {
        requestAnimationFrame(() => resolve(clone));
      }
    });

  const handleDownload = async () => {
    if (typeof html2canvas === "undefined") {
      showToast("렌더 라이브러리를 로드하지 못했어요.");
      return;
    }
    if (!state.hospitalName.trim()) {
      showToast("병원 명을 입력해주세요.");
      input.hospitalName.focus();
      return;
    }
    if (!state.imageDataUrl) {
      showToast("이미지를 첨부해주세요.");
      return;
    }

    downloadBtn.disabled = true;
    const originalHTML = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<span class="text-[18px] leading-[19.8px] font-bold tracking-[-0.025em]">생성 중...</span>';

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const renderTarget = await prepareRenderTarget();
      const isRegional = state.mode === "regional";

      const canvas = await html2canvas(renderTarget, {
        backgroundColor: null,
        useCORS: true,
        scale: 3,
        width: 1029,
        height: isRegional ? 343 : 480,
        logging: false,
      });

      renderTarget.remove();

      const link = document.createElement("a");
      const modeKey = state.mode === "regional" ? "regional" : "home";
      const fileName = `healio_banner_${modeKey}_${sanitizeFileName(state.hospitalName)}_${formatDate()}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();

      showToast("다운로드되었어요.");
    } catch (err) {
      console.error(err);
      showToast("다운로드에 실패했어요.");
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = originalHTML;
    }
  };

  downloadBtn.addEventListener("click", handleDownload);

  // ============================================================
  // Init
  // ============================================================
  setMode(state.mode);
})();

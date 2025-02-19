// Global variable for folder
let defaultLocalTemplateFolder = localStorage.getItem("defaultLocalTemplateFolder") || "DefaultFolder";
document.getElementById("chooseFolderBtn").addEventListener("click", function() {
  document.getElementById("folderInput").click();
});
document.getElementById("folderInput").addEventListener("change", function(e) {
  const files = e.target.files;
  Array.from(files).forEach(file => {
    if(file.name.toLowerCase().endsWith(".html")) {
      let reader = new FileReader();
      reader.onload = function(ev) {
        let relativePath = file.webkitRelativePath;
        let folder = relativePath.split("/")[0] || "Unknown";
        addLocalTemplateToList(file.name, ev.target.result, folder);
      }
      reader.readAsText(file);
    }
  });
});

// Undo/Redo Stacks
let undoStack = [];
let redoStack = [];

// Tab Functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});
// By default, show the landing tab
document.getElementById('landingTab').classList.add('active');
tabButtons[0].classList.add('active');

// "Get Started" Button - Switch to Basic Settings Tab
document.getElementById('getStartedBtn').addEventListener('click', () => {
  tabButtons.forEach(b => b.classList.remove('active'));
  tabContents.forEach(tc => tc.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="basicTab"]').classList.add('active');
  document.getElementById('basicTab').classList.add('active');
});

// Font Selection Functionality
const fontsList = [
  { name: "Arial", category: "sans-serif" },
  { name: "Helvetica Neue", category: "sans-serif" },
  { name: "Montserrat", category: "sans-serif" },
  { name: "Times New Roman", category: "serif" },
  { name: "Georgia", category: "serif" },
  { name: "Roboto", category: "sans-serif" },
  { name: "Open Sans", category: "sans-serif" },
  { name: "Lato", category: "sans-serif" },
  { name: "Oswald", category: "sans-serif" },
  { name: "Raleway", category: "sans-serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Ubuntu", category: "sans-serif" },
  { name: "PT Sans", category: "sans-serif" },
  { name: "Source Sans Pro", category: "sans-serif" },
  { name: "Poppins", category: "sans-serif" },
  { name: "Noto Sans", category: "sans-serif" },
  { name: "Noto Serif", category: "serif" },
  { name: "Roboto Condensed", category: "sans-serif" },
  { name: "Dancing Script", category: "script" },
  { name: "Inconsolata", category: "monospace" }
];
let selectedFont = "'Montserrat', sans-serif";
const fontFamilySearchInput = document.getElementById('fontFamilySearch');
const fontFamilyContainer = document.getElementById('fontFamilyContainer');
function renderFontList(filter = "") {
  fontFamilyContainer.innerHTML = "";
  const filtered = fontsList.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
  filtered.forEach(f => {
    const fontDiv = document.createElement('div');
    fontDiv.textContent = f.name;
    fontDiv.style.fontFamily = f.name + ", sans-serif";
    fontDiv.style.padding = "5px";
    fontDiv.style.cursor = "pointer";
    if (selectedFont.indexOf(f.name) !== -1) {
      fontDiv.style.backgroundColor = "#4A88F6";
      fontDiv.style.color = "#fff";
    }
    fontDiv.addEventListener('click', () => {
      selectedFont = f.name + ", sans-serif";
      renderFontList(fontFamilySearchInput.value);
    });
    fontFamilyContainer.appendChild(fontDiv);
  });
}
fontFamilySearchInput.addEventListener('input', function() { renderFontList(this.value); });
renderFontList();

// Pages & Navigation
const pagesContainer = document.getElementById('pagesContainer');
const addPageBtn = document.getElementById('addPageBtn');
let pageCount = 0;
let pages = [];
addPageBtn.addEventListener('click', () => { createPageEditor(null); });
function createPageEditor(parentPage) {
  const pageId = pageCount++;
  const pageObj = { id: pageId, title: "Untitled Page", layout: "single", sections: [], subPages: [], importedParts: null };
  if (parentPage) { pageObj.parent = parentPage.id; parentPage.subPages.push(pageObj); }
  else { pages.push(pageObj); }
  const pageDiv = document.createElement('div');
  pageDiv.classList.add('pageItem');
  pageDiv.setAttribute('data-pageid', pageId);
  const pageLevel = parentPage ? "Sub-page" : "Page";
  pageDiv.innerHTML = `
    <div class="pageHeader">
      <h3>${pageLevel} Editor (ID: ${pageId})</h3>
      <button class="removePageBtn">Remove</button>
    </div>
    <div class="field">
      <label>Page Title:</label>
      <input type="text" class="pageTitleInput" value="${pageLevel} ${pageId}">
    </div>
    <div class="field">
      <label>Layout Style:</label>
      <select class="pageLayoutSelect">
        <option value="single">Single Column</option>
        <option value="two">Two Columns</option>
        <option value="grid">Grid</option>
        <option value="masonry">Masonry</option>
        <option value="cards">Cards</option>
        <option value="three">Three Columns</option>
        <option value="heroGrid">Hero + Grid</option>
        <option value="splitBanner">Split Banner</option>
        <option value="minimalist">Minimalist</option>
        <option value="ReferencedSiteLayout">ReferencedSiteLayout</option>
        <option value="raw">Raw Template</option>
      </select>
    </div>
    <h4 style="margin:10px 0; color:#fff;">Sections</h4>
    <div class="sectionContainer"></div>
    <div class="buttons">
      <button class="addSectionBtn" style="background:#28A745;">Add Section</button>
      ${!parentPage ? '<button class="addSubPageBtn" style="background:#5bc0de;">Add Sub-Page</button>' : ''}
    </div>
  `;
  if (parentPage) {
    const parentDiv = pagesContainer.querySelector(`.pageItem[data-pageid="${parentPage.id}"]`);
    if (!parentDiv) { pagesContainer.appendChild(pageDiv); }
    else { parentDiv.insertAdjacentElement('afterend', pageDiv); }
  } else { pagesContainer.appendChild(pageDiv); }
  pageDiv.querySelector('.removePageBtn').addEventListener('click', () => { removePage(pageObj, pageDiv); });
  const titleInput = pageDiv.querySelector('.pageTitleInput');
  titleInput.addEventListener('input', (e) => { pageObj.title = e.target.value.trim(); });
  pageObj.title = titleInput.value;
  const layoutSelect = pageDiv.querySelector('.pageLayoutSelect');
  layoutSelect.addEventListener('change', (e) => { pageObj.layout = e.target.value; });
  pageObj.layout = layoutSelect.value;
  const sectionContainer = pageDiv.querySelector('.sectionContainer');
  pageDiv.querySelector('.addSectionBtn').addEventListener('click', () => { createSectionEditor(pageObj, sectionContainer); });
  if (!parentPage) {
    const addSubPageBtn = pageDiv.querySelector('.addSubPageBtn');
    if(addSubPageBtn) { addSubPageBtn.addEventListener('click', () => { createPageEditor(pageObj); }); }
  }
}
function removePage(pageObj, pageDiv) {
  if (pageObj) { pageObjSubSearch(pageObj.id, pages); }
  pageDiv.remove();
}
function pageObjSubSearch(id, pageArr) {
  for (let i = 0; i < pageArr.length; i++) {
    if (pageArr[i].id === id) { pageArr.splice(i, 1); return true; }
    else if (pageArr[i].subPages.length > 0) {
      const found = pageObjSubSearch(id, pageArr[i].subPages);
      if (found) return true;
    }
  }
  return false;
}

// Section Editor
function createSectionEditor(pageObj, containerEl, fetchedSectionData = null) {
  const sectionData = fetchedSectionData || {
    heading: "", paragraph: "", iconLibrary: "none", iconValue: "",
    art: "", image: "", bgType: "none", bgColor: "#ffffff", bgImage: "",
    headingColor: "", paragraphColor: "", breakCount: 0, paragraphIndent: 0, customHTML: null
  };
  pageObj.sections.push(sectionData);
  const secDiv = document.createElement('div');
  secDiv.classList.add('sectionItem');
  secDiv.innerHTML = `
    <div class="reorder-btns">
      <button class="moveUpBtn">&#9650;</button>
      <button class="moveDownBtn">&#9660;</button>
    </div>
    <div class="field">
      <label>Section Heading:</label>
      <input type="text" class="secHeading" placeholder="Optional heading">
    </div>
    <div class="field">
      <label>Section Paragraph:</label>
      <textarea rows="4" class="secParagraph" placeholder="Enter paragraph"></textarea>
    </div>
    <div class="field">
      <label>Breaks after Heading:</label>
      <input type="number" class="secBreakCount" value="0" min="0">
    </div>
    <div class="field">
      <label>Paragraph Indentation (px):</label>
      <input type="number" class="secParagraphIndent" value="0" min="0">
    </div>
    <div class="field">
      <label>Icon Library:</label>
      <select class="iconLibrarySelect">
        <option value="none">No Icon</option>
        <option value="fontAwesome">Font Awesome</option>
        <option value="materialIcons">Google Material Icons</option>
        <option value="nounProject">Noun Project (URL)</option>
      </select>
    </div>
    <div class="field">
      <div class="iconValueContainer" style="margin:5px 0;"><div class="iconValueFields"></div></div>
    </div>
    <div class="field">
      <label>Art/Image URL (Optional):</label>
      <input type="text" class="secArt" placeholder="https://example.com/art.jpg">
    </div>
    <div class="field">
      <label>Image URL (Optional):</label>
      <input type="text" class="secImage" placeholder="Optional image URL">
    </div>
    <hr style="margin:10px 0; border-top:1px solid #444;">
    <div class="field">
      <label>Section Background Type:</label>
      <select class="bgTypeSelect">
        <option value="none">No Override</option>
        <option value="color">Color</option>
        <option value="graphic">Graphic</option>
      </select>
    </div>
    <div class="field bgColorField" style="display:none;">
      <label>Background Color:</label>
      <input type="color" class="secBgColor" value="#ffffff">
    </div>
    <div class="field bgImageField" style="display:none;">
      <label>Background Image URL:</label>
      <input type="text" class="secBgImage" placeholder="https://example.com/background.jpg">
    </div>
    <div class="field">
      <label>Heading Text Color:</label>
      <input type="color" class="secHeadingColor" value="">
    </div>
    <div class="field">
      <label>Paragraph Text Color:</label>
      <input type="color" class="secParagraphColor" value="">
    </div>
    <button class="removeSectionBtn" style="background:#d9534f; margin-top:8px;">Remove Section</button>
  `;
  containerEl.appendChild(secDiv);
  const headingInput = secDiv.querySelector('.secHeading');
  const paragraphInput = secDiv.querySelector('.secParagraph');
  const breakCountInput = secDiv.querySelector('.secBreakCount');
  const paragraphIndentInput = secDiv.querySelector('.secParagraphIndent');
  const iconLibrarySelect = secDiv.querySelector('.iconLibrarySelect');
  const iconValueContainer = secDiv.querySelector('.iconValueContainer .iconValueFields');
  const artInput = secDiv.querySelector('.secArt');
  const imageInput = secDiv.querySelector('.secImage');
  const bgTypeSelect = secDiv.querySelector('.bgTypeSelect');
  const bgColorField = secDiv.querySelector('.bgColorField');
  const bgImageField = secDiv.querySelector('.bgImageField');
  const secBgColor = secDiv.querySelector('.secBgColor');
  const secBgImage = secDiv.querySelector('.secBgImage');
  const secHeadingColor = secDiv.querySelector('.secHeadingColor');
  const secParagraphColor = secDiv.querySelector('.secParagraphColor');
  const removeSectionBtn = secDiv.querySelector('.removeSectionBtn');
  const moveUpBtn = secDiv.querySelector('.moveUpBtn');
  const moveDownBtn = secDiv.querySelector('.moveDownBtn');
  headingInput.value = sectionData.heading;
  paragraphInput.value = sectionData.paragraph;
  breakCountInput.value = sectionData.breakCount;
  paragraphIndentInput.value = sectionData.paragraphIndent;
  iconLibrarySelect.value = sectionData.iconLibrary;
  artInput.value = sectionData.art;
  imageInput.value = sectionData.image;
  bgTypeSelect.value = sectionData.bgType;
  secBgColor.value = sectionData.bgColor;
  secBgImage.value = sectionData.bgImage;
  secHeadingColor.value = sectionData.headingColor;
  secParagraphColor.value = sectionData.paragraphColor;
  function updateBgFields() {
    if (bgTypeSelect.value === "color") {
      bgColorField.style.display = "block";
      bgImageField.style.display = "none";
    } else if (bgTypeSelect.value === "graphic") {
      bgColorField.style.display = "none";
      bgImageField.style.display = "block";
    } else {
      bgColorField.style.display = "none";
      bgImageField.style.display = "none";
    }
  }
  updateBgFields();
  bgTypeSelect.addEventListener('change', () => {
    sectionData.bgType = bgTypeSelect.value;
    updateBgFields();
  });
  secBgColor.addEventListener('input', e => { sectionData.bgColor = e.target.value; });
  secBgImage.addEventListener('input', e => { sectionData.bgImage = e.target.value.trim(); });
  secHeadingColor.addEventListener('input', e => { sectionData.headingColor = e.target.value; });
  secParagraphColor.addEventListener('input', e => { sectionData.paragraphColor = e.target.value; });
  headingInput.addEventListener('input', e => { sectionData.heading = e.target.value; });
  paragraphInput.addEventListener('input', e => { sectionData.paragraph = e.target.value; });
  breakCountInput.addEventListener('input', e => { sectionData.breakCount = parseInt(e.target.value, 10) || 0; });
  paragraphIndentInput.addEventListener('input', e => { sectionData.paragraphIndent = parseInt(e.target.value, 10) || 0; });
  artInput.addEventListener('input', e => { sectionData.art = e.target.value.trim(); });
  imageInput.addEventListener('input', e => { sectionData.image = e.target.value.trim(); });
  iconLibrarySelect.addEventListener('change', () => {
    sectionData.iconLibrary = iconLibrarySelect.value;
    renderIconField();
  });
  function renderIconField() {
    iconValueContainer.innerHTML = "";
    const currentLib = iconLibrarySelect.value;
    if (currentLib === "none") { sectionData.iconValue = ""; return; }
    else if (currentLib === "fontAwesome") {
      const selectEl = document.createElement('select');
      selectEl.innerHTML = `
        <option value="">(Select an icon)</option>
        <option value="fa fa-user">User</option>
        <option value="fa fa-star">Star</option>
        <option value="fa fa-heart">Heart</option>
        <option value="fa fa-check">Check</option>
        <option value="fa fa-cog">Cog</option>
      `;
      selectEl.value = sectionData.iconValue;
      selectEl.addEventListener('change', e => { sectionData.iconValue = e.target.value; });
      iconValueContainer.appendChild(selectEl);
    } else if (currentLib === "materialIcons") {
      const inputEl = document.createElement('input');
      inputEl.type = "text";
      inputEl.placeholder = "e.g. 'face', 'home'";
      inputEl.value = sectionData.iconValue || "";
      inputEl.addEventListener('input', e => { sectionData.iconValue = e.target.value.trim(); });
      iconValueContainer.appendChild(inputEl);
    } else if (currentLib === "nounProject") {
      const inputEl = document.createElement('input');
      inputEl.type = "text";
      inputEl.placeholder = "Icon URL";
      inputEl.value = sectionData.iconValue || "";
      inputEl.addEventListener('input', e => { sectionData.iconValue = e.target.value.trim(); });
      iconValueContainer.appendChild(inputEl);
    }
  }
  renderIconField();
  removeSectionBtn.addEventListener('click', () => {
    const idx = pageObj.sections.indexOf(sectionData);
    if (idx !== -1) { pageObj.sections.splice(idx, 1); }
    secDiv.remove();
  });
  moveUpBtn.addEventListener('click', () => {
    const idx = pageObj.sections.indexOf(sectionData);
    if (idx > 0) {
      [pageObj.sections[idx - 1], pageObj.sections[idx]] = [pageObj.sections[idx], pageObj.sections[idx - 1]];
      containerEl.insertBefore(secDiv, containerEl.children[idx - 1]);
    }
  });
  moveDownBtn.addEventListener('click', () => {
    const idx = pageObj.sections.indexOf(sectionData);
    if (idx < pageObj.sections.length - 1) {
      [pageObj.sections[idx], pageObj.sections[idx + 1]] = [pageObj.sections[idx + 1], pageObj.sections[idx]];
      containerEl.insertBefore(secDiv, containerEl.children[idx + 2]);
    }
  });
}

// Dummy functions for icons and layout CSS
function checkIconUse(pageObj, lib) { return false; }
function getReferencedLayoutCSS(pageObj) { return ""; }
// FIXED getLayoutCSS function now returns layout-specific CSS
function getLayoutCSS(layout) {
  switch(layout) {
    case "single":
      return ".layout-container { grid-template-columns: 1fr; }";
    case "two":
      return ".layout-container { grid-template-columns: 1fr 1fr; }";
    case "grid":
      return ".layout-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }";
    case "masonry":
      return ".layout-container { column-count: 3; column-gap: 20px; }";
    case "cards":
      return ".layout-container { display: flex; flex-wrap: wrap; gap: 20px; }";
    case "three":
      return ".layout-container { grid-template-columns: 1fr 1fr 1fr; }";
    case "heroGrid":
      return ".layout-container { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }";
    case "splitBanner":
      return ".layout-container { display: flex; }";
    case "minimalist":
      return ".layout-container { padding: 10px; }";
    case "ReferencedSiteLayout":
      return "";
    case "raw":
      return "";
    default:
      return "";
  }
}

// Build Sections HTML for Preview
function buildSectionsHTML(sections, pageId) {
  return sections.map((section, index) => {
    if(section.customHTML) return section.customHTML;
    return `
      <div class="layout-item droppable" data-page-id="${pageId}" data-section-index="${index}" style="position: relative;">
        <h2>${section.heading || "Section " + index}</h2>
        <p>${section.paragraph || ""}</p>
        <div class="image-dropzone">
          ${ section.image 
            ? `<img src="${section.image}" alt="" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover;">`
            : `<div>Drop image here</div>` }
        </div>
      </div>
    `;
  }).join("");
}

// Import Layout Functionality
const importHtmlBtn = document.getElementById('importHtmlBtn');
const manualHtmlInput = document.getElementById('manualHtmlInput');
importHtmlBtn.addEventListener('click', () => {
  const htmlString = manualHtmlInput.value.trim();
  if (!htmlString) { alert("Please paste HTML code."); return; }
  const parts = separateHTMLParts(htmlString);
  showImportOptions(parts, (selectedParts) => {
    const pageId = prompt("Enter the Page ID to import these parts (e.g., 0, 1):");
    if (pageId === null) return;
    const targetPage = findPageById(parseInt(pageId, 10), pages);
    if (!targetPage) { alert("Page not found."); return; }
    targetPage.importedParts = selectedParts;
    targetPage.layout = "ReferencedSiteLayout";
    const pageDiv = document.querySelector(`.pageItem[data-pageid="${targetPage.id}"]`);
    const layoutSelect = pageDiv.querySelector('.pageLayoutSelect');
    if (layoutSelect) { layoutSelect.value = "ReferencedSiteLayout"; }
    alert("Imported selected HTML parts into the page!");
  });
});
function separateHTMLParts(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  let headContent = doc.head ? doc.head.innerHTML : "";
  let bodyContent = doc.body ? doc.body.innerHTML : "";
  let styleContent = "";
  let scriptContent = "";
  const styleElements = doc.head ? doc.head.querySelectorAll("style") : [];
  styleElements.forEach(styleEl => {
    styleContent += styleEl.outerHTML;
    headContent = headContent.replace(styleEl.outerHTML, "");
  });
  const scriptElements = doc.querySelectorAll("script");
  scriptElements.forEach(scriptEl => {
    scriptContent += scriptEl.outerHTML;
    if (scriptEl.parentNode.tagName.toLowerCase() === "head") {
      headContent = headContent.replace(scriptEl.outerHTML, "");
    } else if (scriptEl.parentNode.tagName.toLowerCase() === "body") {
      bodyContent = bodyContent.replace(scriptEl.outerHTML, "");
    }
  });
  return { head: headContent.trim(), style: styleContent.trim(), body: bodyContent.trim(), scripts: scriptContent.trim() };
}
function showImportOptions(parts, callback) {
  const overlay = document.createElement('div');
  overlay.className = "import-overlay";
  const modal = document.createElement('div');
  modal.className = "import-modal";
  modal.innerHTML = `
    <h3>Select HTML Parts to Import</h3>
    <div><input type="checkbox" id="importHead" checked> <label for="importHead">Head (meta, title, etc.)</label></div>
    <div><input type="checkbox" id="importStyle" checked> <label for="importStyle">Style (CSS)</label></div>
    <div><input type="checkbox" id="importBody" checked> <label for="importBody">Body (Content)</label></div>
    <div><input type="checkbox" id="importScripts" checked> <label for="importScripts">Scripts (JS)</label></div>
    <div style="margin-top:15px; text-align:right;">
      <button id="cancelImport">Cancel</button>
      <button id="confirmImport" style="margin-left:10px;">Confirm</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  document.getElementById('cancelImport').addEventListener('click', () => { document.body.removeChild(overlay); });
  document.getElementById('confirmImport').addEventListener('click', () => {
    const selectedParts = {};
    if (document.getElementById('importHead').checked) { selectedParts.head = parts.head; }
    if (document.getElementById('importStyle').checked) { selectedParts.style = parts.style; }
    if (document.getElementById('importBody').checked) { selectedParts.body = parts.body; }
    if (document.getElementById('importScripts').checked) { selectedParts.scripts = parts.scripts; }
    document.body.removeChild(overlay);
    callback(selectedParts);
  });
}
function findPageById(id, pageArr) {
  for (let p of pageArr) {
    if (p.id === id) return p;
    if (p.subPages && p.subPages.length > 0) {
      const found = findPageById(id, p.subPages);
      if (found) return found;
    }
  }
  return null;
}

// Media Sidebar Search & Drag/Drop (Pexels API)
const mediaSearchInput = document.getElementById('mediaSearchInput');
const mediaSearchBtn = document.getElementById('mediaSearchBtn');
const mediaResults = document.getElementById('mediaResults');
mediaSearchBtn.addEventListener('click', async () => {
  const query = mediaSearchInput.value.trim();
  if (!query) { mediaResults.innerHTML = "<p style='color:red;'>Please enter a search term.</p>"; return; }
  mediaResults.innerHTML = "Searching...";
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=50`, {
      headers: { Authorization: "2mxS3gi2IIXAmd4anXuVaaNs5k98X0F6KaTpszZYFCJstNfWXVH71gN1" }
    });
    if (!response.ok) { mediaResults.innerHTML = "<p style='color:red;'>Error fetching images.</p>"; return; }
    const data = await response.json();
    const images = data.photos || [];
    if (!images.length) { mediaResults.innerHTML = "<p style='color:#bbb;'>No results found.</p>"; return; }
    mediaResults.innerHTML = "";
    images.forEach(imgObj => {
      const thumbUrl = imgObj.src.small;
      const largeUrl = imgObj.src.large;
      const altText = imgObj.alt || "No description";
      const wrapper = document.createElement('div');
      wrapper.classList.add('imageResult');
      wrapper.innerHTML = `<img src="${thumbUrl}" alt="${altText}" style="max-width:100%;">`;
      wrapper.setAttribute('draggable', 'true');
      wrapper.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData("text/plain", largeUrl);
      });
      mediaResults.appendChild(wrapper);
    });
  } catch (err) { console.error(err); mediaResults.innerHTML = "<p style='color:red;'>Failed to retrieve images.</p>"; }
});

// Local Image Handler
const localImageInput = document.getElementById('localImageInput');
localImageInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('imageResult');
      wrapper.innerHTML = `<img src="${event.target.result}" alt="Local Image" style="max-width:100%;">`;
      wrapper.setAttribute('draggable', 'true');
      wrapper.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData("text/plain", event.target.result);
      });
      mediaResults.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  } else { alert("Please select a valid image file."); }
});

// Preview & Code Generation
function buildPageHTML(pageObj, isPreviewNav) {
  if (pageObj.layout === "raw" && pageObj.rawHTML) { return pageObj.rawHTML; }
  const gFont = selectedFont || "Arial, sans-serif";
  const fontName = gFont.split(',')[0].replace(/['"]/g, '').trim();
  const googleFonts = {
    "Montserrat": "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700&display=swap",
    "Roboto": "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
    "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap",
    "Lato": "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
    "Oswald": "https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap",
    "Raleway": "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap",
    "Merriweather": "https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap",
    "Ubuntu": "https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap",
    "PT Sans": "https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap",
    "Source Sans Pro": "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap",
    "Poppins": "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
  };
  let fontLink = "";
  if (googleFonts[fontName]) { fontLink = `<link href="${googleFonts[fontName]}" rel="stylesheet">`; }
  const pageTitle = pageObj.title.trim() || "Untitled Page";
  if (pageObj.layout === "ReferencedSiteLayout" && pageObj.importedParts) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  ${ checkIconUse(pageObj, "fontAwesome") ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">` : "" }
  ${ checkIconUse(pageObj, "materialIcons") ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />` : "" }
  ${fontLink}
  <style>
    body {
      background-color: ${globalBgColor.value};
      ${globalBgImage.value ? `background-image: url('${globalBgImage.value}'); background-size: cover; background-repeat: no-repeat;` : ''}
      color: ${globalTextColor.value};
      font-family: ${gFont};
      font-size: ${globalFontSize.value}px;
      line-height: ${globalLineHeight.value};
      margin: 0; padding: 0;
    }
    a { color: ${globalLinkColor.value}; }
    ${ pageObj.importedParts.style || '' }
  </style>
  ${ pageObj.importedParts.head || '' }
</head>
<body>
  ${ includeNav.checked && isTopLevel(pageObj) ? buildNavHTML(pages, isPreviewNav) : '' }
  ${ pageObj.importedParts.body || '' }
  ${ pageObj.importedParts.scripts || '' }
</body>
</html>`.trim();
  }
  const sectionsHTML = buildSectionsHTML(pageObj.sections, pageObj.id);
  let navHTML = "";
  if (includeNav.checked && isTopLevel(pageObj)) { navHTML = buildNavHTML(pages, isPreviewNav); }
  let layoutCSS = (pageObj.layout === "ReferencedSiteLayout") ? getReferencedLayoutCSS(pageObj) : getLayoutCSS(pageObj.layout);
  const usedFA = checkIconUse(pageObj, "fontAwesome");
  const usedMI = checkIconUse(pageObj, "materialIcons");
  const faLink = usedFA ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">\n` : "";
  const materialIconsLink = usedMI ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />\n` : "";
  const gBg = globalBgColor.value;
  const gTxt = globalTextColor.value;
  const gHead = globalHeadingColor.value;
  const gFontSize = globalFontSize.value;
  const gLineHeight = globalLineHeight.value;
  const gLinkColor = globalLinkColor.value;
  const gBgImage = globalBgImage.value.trim();
  const customCSS = globalCustomCSS.value;
  const metaDesc = "Page: " + pageTitle;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title data-page-id="${pageObj.id}">${pageTitle}</title>
  <meta name="description" content="${metaDesc}">
  ${faLink}${materialIconsLink}${fontLink}
  <style>
    body {
      background-color: ${gBg};
      ${gBgImage ? `background-image: url('${gBgImage}'); background-size: cover; background-repeat: no-repeat;` : ''}
      color: ${gTxt};
      font-family: ${gFont};
      font-size: ${gFontSize}px;
      line-height: ${gLineHeight};
      margin: 0; padding: 0;
    }
    a { color: ${gLinkColor}; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    h1, h2, h3 { color: ${gHead}; margin-bottom: 15px; }
    p { margin-bottom: 15px; }
    ${layoutCSS}
    nav { background: ${gHead}; padding: 15px; }
    nav ul {
      list-style: none; display: flex; gap: 20px; margin: 0; padding: 0; align-items: center;
    }
    nav li { position: relative; }
    nav a { color: ${gBg}; text-decoration: none; font-weight: bold; }
    .submenu {
      position: absolute; display: none; top: 50px; left: 0;
      background-color: ${gHead}; padding: 10px; border-radius: 5px;
    }
    .submenu li { margin: 5px 0; }
    .has-submenu:hover .submenu { display: flex; flex-direction: column; }
    .has-submenu > a::after { content: " \\25BC"; margin-left: 5px; font-size: 0.8em; }
    .layout-container {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 20px;
    }
    .layout-container .layout-item {
      background-color: ${gBg}; color: ${gTxt}; padding: 20px; border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: transform 0.2s ease;
    }
    .layout-container .layout-item:hover { transform: translateY(-3px); }
    ${customCSS}
  </style>
</head>
<body>
  ${navHTML}
  <div class="container">
    <h1>${pageTitle}</h1>
    <div class="layout-container">
      ${sectionsHTML}
    </div>
  </div>
</body>
</html>`.trim();
}
function flattenPages(pageArr) {
  let result = [];
  for (let p of pageArr) {
    result.push(p);
    if (p.subPages && p.subPages.length > 0) {
      result = result.concat(flattenPages(p.subPages));
    }
  }
  return result;
}
function pageFilename(pg) {
  const t = pg.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/gi, '');
  return t ? t + ".html" : "page-" + pg.id + ".html";
}
function isTopLevel(pageObj) { return pages.includes(pageObj); }
// Build Navigation HTML
function buildNavHTML(pageArr, isPreviewNav) {
  let navHTML = `<nav><ul>`;
  pageArr.forEach(p => {
    const filename = pageFilename(p);
    if (p.subPages.length > 0) {
      navHTML += `
        <li class="has-submenu">
          <a href="${isPreviewNav ? '#' : filename}" onclick="${isPreviewNav ? `openPageInPreview('${filename}')` : ''}">${p.title}</a>
          <ul class="submenu">
      `;
      p.subPages.forEach(sp => {
        const subFilename = pageFilename(sp);
        navHTML += `
          <li><a href="${isPreviewNav ? '#' : subFilename}" onclick="${isPreviewNav ? `openPageInPreview('${subFilename}')` : ''}">${sp.title}</a></li>
        `;
      });
      navHTML += `</ul></li>`;
    } else {
      navHTML += `
        <li>
          <a href="${isPreviewNav ? '#' : filename}" onclick="${isPreviewNav ? `openPageInPreview('${filename}')` : ''}">${p.title}</a>
        </li>
      `;
    }
  });
  navHTML += `</ul></nav>`;
  return navHTML;
}

// Fetch Remote Templates from GitHub
fetch('https://api.github.com/repos/mpalmero197/webbuilder/contents/')
  .then(response => response.json())
  .then(data => {
    const templateFiles = data.filter(file => file.name.startsWith('template-') && file.type === 'file');
    const remoteTemplateListContainer = document.getElementById('remoteTemplateListContainer');
    templateFiles.forEach(file => {
      let baseName = file.name.replace(/^template-/, '').replace(/\.[^/.]+$/, '');
      let displayName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + ' Template';
      const templateDiv = document.createElement('div');
      templateDiv.classList.add('templateItem');
      templateDiv.innerHTML = `<h3>${displayName}</h3>`;
      const button = document.createElement('button');
      button.textContent = 'Apply Template';
      button.addEventListener('click', () => {
        fetch(file.download_url)
          .then(resp => resp.text())
          .then(htmlContent => {
            const previewFrame = document.getElementById('previewFrame');
            previewFrame.srcdoc = htmlContent;
            const newPage = {
              id: pageCount++,
              title: displayName,
              layout: "raw",
              rawHTML: htmlContent,
              sections: [],
              subPages: []
            };
            pages = [newPage];
            pagesContainer.innerHTML = "";
            createPageEditor(newPage, null);
            alert('Remote template loaded.');
          })
          .catch(err => console.error('Error loading template:', err));
      });
      templateDiv.appendChild(button);
      remoteTemplateListContainer.appendChild(templateDiv);
    });
  })
  .catch(err => console.error('Error fetching templates:', err));

// Local Template Functions
function addLocalTemplateToList(filename, content, folder) {
  const localTemplateListContainer = document.getElementById('localTemplateListContainer');
  const templateDiv = document.createElement('div');
  templateDiv.classList.add('templateItem');
  const displayName = filename.replace(/^template-/, '').replace(/\.html$/i, '');
  templateDiv.innerHTML = `<h3>${displayName} (Local, Folder: ${folder || "None"})</h3>`;
  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply Template';
  applyButton.addEventListener('click', () => {
     const previewFrame = document.getElementById('previewFrame');
     previewFrame.srcdoc = content;
     const newPage = {
        id: pageCount++,
        title: displayName,
        layout: "raw",
        rawHTML: content,
        sections: [],
        subPages: []
     };
     pages = [newPage];
     pagesContainer.innerHTML = "";
     createPageEditor(newPage, null);
     alert('Local template loaded.');
  });
  templateDiv.appendChild(applyButton);
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete Template';
  deleteButton.style.background = '#d9534f';
  deleteButton.addEventListener('click', () => {
    if (confirm("Delete this template?")) {
      let localTemplates = JSON.parse(localStorage.getItem("localTemplates") || "[]");
      localTemplates = localTemplates.filter(t => t.filename !== filename);
      localStorage.setItem("localTemplates", JSON.stringify(localTemplates));
      templateDiv.remove();
      alert("Template deleted.");
    }
  });
  templateDiv.appendChild(deleteButton);
  localTemplateListContainer.appendChild(templateDiv);
}
function loadLocalTemplates() {
  const localTemplates = JSON.parse(localStorage.getItem("localTemplates") || "[]");
  localTemplates.forEach(template => { addLocalTemplateToList(template.filename, template.content, template.folder); });
}
window.addEventListener("load", loadLocalTemplates);

// Save Current Template
document.getElementById("saveTemplateBtn").addEventListener("click", function() {
  const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  if (!iframeDoc) { alert("Preview not loaded."); return; }
  const templateHTML = iframeDoc.documentElement.outerHTML;
  let fileName = prompt("Enter filename for template (e.g., template-myLayout):", "template-");
  if (fileName) {
    fileName = fileName.trim();
    if (!fileName.toUpperCase().endsWith(".HTML")) { fileName += ".HTML"; }
    let folderName = defaultLocalTemplateFolder;
    let localTemplates = JSON.parse(localStorage.getItem("localTemplates") || "[]");
    localTemplates.push({ filename: fileName, content: templateHTML, folder: folderName });
    localStorage.setItem("localTemplates", JSON.stringify(localTemplates));
    addLocalTemplateToList(fileName, templateHTML, folderName);
    const blob = new Blob([templateHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Template saved as " + fileName + "\nFolder: " + folderName);
  }
});

// Change Text Color Functionality
document.getElementById("changeTextColorBtn").addEventListener("click", function() {
  const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  const selection = iframeDoc.getSelection();
  if (selection.isCollapsed) { alert("Select text in preview pane."); return; }
  document.getElementById("textColorPicker").click();
});
document.getElementById("textColorPicker").addEventListener("input", function() {
  const color = this.value;
  const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  iframeDoc.body.focus();
  iframeDoc.execCommand("styleWithCSS", false, true);
  iframeDoc.execCommand("foreColor", false, color);
});

// Full Screen Toggle for Preview Pane
document.getElementById('fullscreenBtn').addEventListener('click', function() {
  const previewFrame = document.getElementById('previewFrame');
  if (!document.fullscreenElement) {
    previewFrame.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen();
  }
});

// View Source & Update Element
let viewSourceEnabled = false;
const toggleViewSourceBtn = document.getElementById('toggleViewSourceBtn');
const viewSourcePanel = document.getElementById('viewSourcePanel');
toggleViewSourceBtn.addEventListener('click', function() {
  viewSourceEnabled = !viewSourceEnabled;
  this.textContent = viewSourceEnabled ? "Disable View Source" : "Enable View Source";
  const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  if (viewSourceEnabled) { attachViewSourceListeners(iframeDoc); }
  else { detachViewSourceListeners(iframeDoc); removeHighlight(); viewSourcePanel.style.display = "none"; }
});
function attachViewSourceListeners(doc) {
  if (!doc) return;
  doc.addEventListener('mouseover', handleElementMouseOver);
  doc.addEventListener('mouseout', handleElementMouseOut);
  doc.addEventListener('click', handleElementClick);
  if (doc.head) {
    const titleElem = doc.head.querySelector('title');
    if (titleElem) { titleElem.style.cursor = 'pointer'; titleElem.addEventListener('click', handleElementClick); }
  }
}
function detachViewSourceListeners(doc) {
  if (!doc) return;
  doc.removeEventListener('mouseover', handleElementMouseOver);
  doc.removeEventListener('mouseout', handleElementMouseOut);
  doc.removeEventListener('click', handleElementClick);
  if (doc.head) {
    const titleElem = doc.head.querySelector('title');
    if (titleElem) { titleElem.removeEventListener('click', handleElementClick); }
  }
}
function handleElementMouseOver(e) {
  e.stopPropagation();
  const target = e.target;
  target.style.outline = "2px solid red";
  viewSourcePanel.textContent = target.outerHTML;
  viewSourcePanel.style.top = (e.clientY + 10) + "px";
  viewSourcePanel.style.left = (e.clientX + 10) + "px";
  viewSourcePanel.style.display = "block";
}
function handleElementMouseOut(e) {
  e.stopPropagation();
  e.target.style.outline = "";
  viewSourcePanel.style.display = "none";
}
function handleElementClick(e) {
  const target = e.target;
  if (target.tagName.toLowerCase() === 'a') {
    const href = target.getAttribute('href');
    if (href && href.startsWith('#')) return;
  }
  e.preventDefault();
  e.stopPropagation();
  const elementHTML = target.outerHTML;
  const editPanel = document.getElementById('editElementPanel');
  const editTextarea = document.getElementById('editElementTextarea');
  editTextarea.value = elementHTML;
  editTextarea.select();
  editPanel.style.display = 'block';
  window.currentlySelectedElement = target;
}
function removeHighlight() {
  const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  if (iframeDoc) { iframeDoc.querySelectorAll('*').forEach(elem => { elem.style.outline = ""; }); }
}
function performUpdateElement() {
  const newHTML = document.getElementById('editElementTextarea').value;
  if (!newHTML.trim()) {
    if (window.currentlySelectedElement) {
      if (window.currentlySelectedElement.tagName.toLowerCase() === 'title') {
        alert("Cannot delete title element.");
        return false;
      }
      const pageId = window.currentlySelectedElement.getAttribute('data-page-id');
      const sectionIndex = window.currentlySelectedElement.getAttribute('data-section-index');
      if (pageId !== null && sectionIndex !== null) {
        const targetPage = findPageById(parseInt(pageId, 10), pages);
        if (targetPage) { targetPage.sections.splice(parseInt(sectionIndex, 10), 1); }
      }
      window.currentlySelectedElement.parentNode.removeChild(window.currentlySelectedElement);
      window.currentlySelectedElement = null;
      document.getElementById('editElementPanel').style.display = 'none';
      return true;
    }
    return false;
  }
  if (window.currentlySelectedElement) {
    if (window.currentlySelectedElement.tagName.toLowerCase() === 'title') {
      const pageId = window.currentlySelectedElement.getAttribute('data-page-id');
      if (pageId !== null) {
        const targetPage = findPageById(parseInt(pageId, 10), pages);
        if (targetPage) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newHTML;
          const newTitleElem = tempDiv.querySelector('title');
          if (newTitleElem) {
            const newTitleText = newTitleElem.textContent;
            targetPage.title = newTitleText;
            const pageDiv = document.querySelector(`.pageItem[data-pageid="${pageId}"]`);
            if (pageDiv) {
              const titleInput = pageDiv.querySelector('.pageTitleInput');
              if (titleInput) { titleInput.value = newTitleText; }
            }
            document.getElementById('editElementPanel').style.display = 'none';
            window.currentlySelectedElement = null;
            return true;
          } else { alert("Invalid title HTML."); return false; }
        }
      }
    } else {
      const pageId = window.currentlySelectedElement.getAttribute('data-page-id');
      const sectionIndex = window.currentlySelectedElement.getAttribute('data-section-index');
      if (pageId !== null && sectionIndex !== null) {
        const targetPage = findPageById(parseInt(pageId, 10), pages);
        if (targetPage && targetPage.sections[parseInt(sectionIndex, 10)]) {
          targetPage.sections.splice(parseInt(sectionIndex, 10), 1, { customHTML: newHTML });
        }
      }
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newHTML;
      const newElem = tempDiv.firstElementChild;
      if (newElem) {
        if (pageId !== null && sectionIndex !== null) {
          newElem.setAttribute('data-page-id', pageId);
          newElem.setAttribute('data-section-index', sectionIndex);
        }
        window.currentlySelectedElement.parentNode.replaceChild(newElem, window.currentlySelectedElement);
        window.currentlySelectedElement = null;
        document.getElementById('editElementPanel').style.display = 'none';
        return true;
      } else { alert("Invalid HTML."); return false; }
    }
  }
  return false;
}
document.getElementById('pushUpdatesBtn').addEventListener('click', function() {
  if (performUpdateElement()) {
    try {
      removeHighlight();
      const updatedHTML = previewFrame.contentDocument.documentElement.outerHTML;
      generatedCode.value = updatedHTML;
    } catch (err) { console.error("Error:", err); }
  }
});
document.getElementById('updateElementBtn').addEventListener('click', function() { performUpdateElement(); });
document.getElementById('deleteElementBtn').addEventListener('click', function() {
  if (window.currentlySelectedElement) {
    if (window.currentlySelectedElement.tagName.toLowerCase() === 'title') {
      alert("Cannot delete title element.");
      return;
    }
    const pageId = window.currentlySelectedElement.getAttribute('data-page-id');
    const sectionIndex = window.currentlySelectedElement.getAttribute('data-section-index');
    if (pageId !== null && sectionIndex !== null) {
      const targetPage = findPageById(parseInt(pageId, 10), pages);
      if (targetPage) { targetPage.sections.splice(parseInt(sectionIndex, 10), 1); }
    }
    window.currentlySelectedElement.parentNode.removeChild(window.currentlySelectedElement);
    window.currentlySelectedElement = null;
    document.getElementById('editElementPanel').style.display = 'none';
    alert("Element deleted.");
  } else { alert("No element selected."); }
});
const previewFrame = document.getElementById('previewFrame');
function makeAllElementsDropZones() {
  const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  const allElements = iframeDoc.body.querySelectorAll("*");
  allElements.forEach(el => {
    el.addEventListener("dragover", function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });
    el.addEventListener("drop", function(e) {
      e.preventDefault();
      e.stopPropagation();
      const imgUrl = e.dataTransfer.getData("text/plain");
      if (imgUrl) {
        const prevBackground = el.style.backgroundImage;
        undoStack.push({ element: el, background: prevBackground });
        redoStack = [];
        el.style.backgroundImage = `url('${imgUrl}')`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.backgroundRepeat = "no-repeat";
        el.style.filter = "none";
      }
    });
  });
}
previewFrame.addEventListener('load', function() {
  const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  iframeDoc.body.contentEditable = "true";
  iframeDoc.body.spellcheck = false;
  iframeDoc.body.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  makeAllElementsDropZones();
  if (viewSourceEnabled) { attachViewSourceListeners(iframeDoc); }
});
// Undo/Redo Buttons
document.getElementById("undoBtn").addEventListener("click", function() {
  if (undoStack.length > 0) {
    const lastAction = undoStack.pop();
    const element = lastAction.element;
    const currentBackground = element.style.backgroundImage;
    redoStack.push({ element: element, background: currentBackground });
    element.style.backgroundImage = lastAction.background;
  } else { alert("Nothing to undo."); }
});
document.getElementById("redoBtn").addEventListener("click", function() {
  if (redoStack.length > 0) {
    const lastAction = redoStack.pop();
    const element = lastAction.element;
    const currentBackground = element.style.backgroundImage;
    undoStack.push({ element: element, background: currentBackground });
    element.style.backgroundImage = lastAction.background;
  } else { alert("Nothing to redo."); }
});
const previewBtn = document.getElementById('previewBtn');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const generatedCode = document.getElementById('generatedCode');
let siteMap = {};
previewBtn.addEventListener('click', () => {
  if (pages.length === 0) {
    previewFrame.srcdoc = "<p style='color:red;'>No pages defined.</p>";
    return;
  }
  siteMap = {};
  const flatList = flattenPages(pages);
  flatList.forEach(pg => {
    const code = buildPageHTML(pg, true);
    const fname = pageFilename(pg);
    siteMap[fname] = code;
  });
  const homePage = pages[0];
  const homeFilename = pageFilename(homePage);
  previewFrame.srcdoc = siteMap[homeFilename];
});
window.openPageInPreview = function(filename) {
  if (siteMap[filename]) { previewFrame.srcdoc = siteMap[filename]; }
};
generateBtn.addEventListener('click', () => {
  let allCode = "";
  if (pages.length === 0) { allCode = "<!-- No pages defined -->"; }
  else {
    siteMap = {};
    const flatList = flattenPages(pages);
    flatList.forEach(pg => {
      const pgCode = buildPageHTML(pg, false);
      const fname = pageFilename(pg);
      pg.filename = fname;
      siteMap[fname] = pgCode;
      allCode += `<!-- PAGE: ${fname} -->\n${pgCode}\n\n`;
    });
  }
  generatedCode.value = allCode.trim();
});
clearBtn.addEventListener('click', () => {
  selectedFont = "'Montserrat', sans-serif";
  fontFamilySearchInput.value = "";
  renderFontList();
  globalBgColor.value = "#ffffff";
  globalTextColor.value = "#000000";
  globalHeadingColor.value = "#000000";
  includeNav.checked = false;
  globalFontSize.value = "16";
  globalLineHeight.value = "1.6";
  globalLinkColor.value = "#4A88F6";
  globalBgImage.value = "";
  globalCustomCSS.value = "";
  pageCount = 0;
  pages = [];
  pagesContainer.innerHTML = "";
  manualHtmlInput.value = "";
  previewFrame.srcdoc = "";
  generatedCode.value = "";
  siteMap = {};
  tabButtons.forEach(b => b.classList.remove('active'));
  tabContents.forEach(tc => tc.classList.remove('active'));
  tabButtons[0].classList.add('active');
  tabContents[0].classList.add('active');
});
const codeSearchInput = document.getElementById('codeSearchInput');
const codeReplaceInput = document.getElementById('codeReplaceInput');
const replaceAllBtn = document.getElementById('replaceAllBtn');
const exportHTMLBtn = document.getElementById('exportHTMLBtn');
let searchIndex = 0;
document.getElementById('nextBtn').addEventListener('click', function() {
  const query = codeSearchInput.value;
  if (!query) { alert("Enter a search term."); return; }
  const codeText = generatedCode.value;
  const foundIndex = codeText.indexOf(query, searchIndex);
  if (foundIndex === -1) { alert("No more matches. Restarting."); searchIndex = 0; }
  else {
    generatedCode.focus();
    generatedCode.setSelectionRange(foundIndex, foundIndex + query.length);
    const computedStyle = window.getComputedStyle(generatedCode);
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
    const substring = generatedCode.value.substring(0, foundIndex);
    const lineNumber = substring.split("\n").length - 1;
    generatedCode.scrollTop = lineNumber * lineHeight;
    searchIndex = foundIndex + query.length;
  }
});
document.getElementById('prevBtn').addEventListener('click', function() {
  const query = codeSearchInput.value;
  if (!query) { alert("Enter a search term."); return; }
  const codeText = generatedCode.value;
  const currentStart = generatedCode.selectionStart;
  const foundIndex = codeText.lastIndexOf(query, currentStart - 1);
  if (foundIndex === -1) { alert("No previous matches found."); }
  else {
    generatedCode.focus();
    generatedCode.setSelectionRange(foundIndex, foundIndex + query.length);
    const computedStyle = window.getComputedStyle(generatedCode);
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
    const substring = generatedCode.value.substring(0, foundIndex);
    const lineNumber = substring.split("\n").length - 1;
    generatedCode.scrollTop = lineNumber * lineHeight;
    searchIndex = foundIndex;
  }
});
replaceAllBtn.addEventListener('click', function() {
  const searchText = codeSearchInput.value;
  const replaceText = codeReplaceInput.value;
  if (!searchText) { alert("Enter text to search for."); return; }
  const codeContent = generatedCode.value;
  const updatedCode = codeContent.split(searchText).join(replaceText);
  generatedCode.value = updatedCode;
});
exportHTMLBtn.addEventListener('click', function() {
  const codeContent = generatedCode.value;
  if (!codeContent) { alert("No generated code to export."); return; }
  const parser = new DOMParser();
  const doc = parser.parseFromString(codeContent, "text/html");
  doc.body.removeAttribute("contenteditable");
  const cleanedHTML = doc.documentElement.outerHTML;
  const blob = new Blob([cleanedHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "exported_site.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// THEME TOGGLE SWITCH LOGIC
const themeToggleSwitch = document.getElementById('themeToggleSwitch');
themeToggleSwitch.addEventListener('change', () => {
  document.body.classList.toggle('light-theme');
});

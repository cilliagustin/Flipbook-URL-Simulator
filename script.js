document.addEventListener("DOMContentLoaded", function () {
    // Attach input event listeners to all relevant input fields
    document.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", updateUrl);
    });
  
    // Attach change event listener to the checkboxes
    document.getElementById("BdInFolder").addEventListener("change", updateUrl);
    document.getElementById("domainRoot").addEventListener("change", updateUrl);
  
    // Function to add a new folder input field
    window.addFolder = function () {
      const folderContainer = document.getElementById("folderContainer");
      const newFolderInput = document.createElement("input");
      newFolderInput.type = "text";
      newFolderInput.className = "folderName";
      newFolderInput.placeholder = "Enter folder name";
      newFolderInput.addEventListener("input", updateUrl);
      folderContainer.appendChild(newFolderInput);
  
      // Add corresponding folder structure in the admin section
      updateAdminPanel(
        document.getElementById("accountName").value.trim(),
        Array.from(document.querySelectorAll(".folderName"))
          .map((input) => input.value.trim())
          .filter((value) => value),
        document.getElementById("flipbookName").value.trim(),
        document.getElementById("BdInFolder").checked
      );
    };
  
    // Function to sanitize user input for URL purposes only
    function sanitizeUrlPart(input) {
      return input.trim().toLowerCase().replace(/\s+/g, "-");
    }
  
    // Function to update the generated URL based on user inputs
    function updateUrl() {
      const accountName = document.getElementById("accountName").value.trim();
      const folderInputs = document.querySelectorAll(".folderName");
      const folders = Array.from(folderInputs)
        .map((input) => input.value.trim())
        .filter((value) => value);
      const flipbookName = document.getElementById("flipbookName").value.trim();
      const brandedDomain = document.getElementById("brandedDomain").value;
      const domainRoot = document.getElementById("domainRoot").checked;
      const useBrandedDomainInFolder = document.getElementById("BdInFolder").checked;
  
      let url = "https://";
      let mainDomain = "viewer.ipaper.io";
      let accountNamePart = "";
      let folderPath = "";
      let flipbookPath = "";
  
      // Determine the main domain based on user input
      if (brandedDomain) {
        mainDomain = brandedDomain;
        if (!domainRoot && accountName) {
          accountNamePart = `/${sanitizeUrlPart(accountName)}`;
        }
      } else {
        // Default viewer domain, always include account name if available
        if (accountName) {
          accountNamePart = `/${sanitizeUrlPart(accountName)}`;
        }
      }
  
      // Construct the folder path if there are folders
      if (folders.length > 0) {
        folderPath = "/" + folders.map(sanitizeUrlPart).join("/");
      }
  
      // Add the flipbook name to the path if provided
      if (flipbookName) {
        flipbookPath = `/${sanitizeUrlPart(flipbookName)}`;
      }
  
      // Construct and display the full URL with color coding
      document.getElementById("generatedUrl").innerHTML = `
                  <span class="blue-text">${url}${mainDomain}</span>
                  ${
                    accountNamePart
                      ? '<span class="orange-text">' + accountNamePart + "</span>"
                      : ""
                  }
                  ${
                    folderPath
                      ? '<span class="green-text">' + folderPath + "</span>"
                      : ""
                  }
                  ${
                    flipbookPath
                      ? '<span class="red-text">' + flipbookPath + "</span>"
                      : ""
                  }
              `;
  
      // Update admin panel elements
      updateAdminPanel(accountName, folders, flipbookName, useBrandedDomainInFolder);
    }
  
    // Function to update the account name, folder structure, and flipbook name in the admin section
    function updateAdminPanel(accountName, folders, flipbookName, useBrandedDomainInFolder) {
      // Update account name
      document.getElementById("accountTitle").textContent =
        accountName || "Account Name";
  
      // Update folder structure
      const foldersContainer = document.querySelector(".foldersContainer");
      foldersContainer.innerHTML = ""; // Clear existing folders
  
      folders.forEach((folderName, index) => {
        addAdminFolder(index, folderName); // No sanitization needed for display
      });
  
      // Update flipbook level class after updating folders
      updateFlipbookLevel(folders.length);
  
      // Update flipbook name
      const flipbookElem = document.querySelector("#flipbook-level p");
      if (flipbookElem) {
        flipbookElem.textContent = flipbookName || "Flipbook";
      }
  
      // Update URLs in admin panel based on checkbox
      const accountUrlSpan = document.querySelector(".acc-url-text");
      if (useBrandedDomainInFolder) {
        accountUrlSpan.textContent = "";
      } else {
        accountUrlSpan.textContent = accountName && !document.getElementById("domainRoot").checked
          ? `/${sanitizeUrlPart(accountName)}`
          : "";
      }
  
      // Call to update URLs in the admin section
      updateUrlsInAdmin();
    }
  
    // Function to add a folder structure in the admin section
    function addAdminFolder(level, folderName = "Folder") {
      const foldersContainer = document.querySelector(".foldersContainer");
  
      // Create elements for the folder structure
      const lineDiv = document.createElement("div");
      lineDiv.className = "line";
  
      const levelDiv = document.createElement("div");
      levelDiv.className = `level level-${level}`;
  
      const arrowImg = document.createElement("img");
      arrowImg.src = "media/arrow.png";
      arrowImg.alt = "Arrow";
  
      const folderImg = document.createElement("img");
      folderImg.src = "media/folder.png";
      folderImg.alt = "Folder";
  
      const folderText = document.createElement("p");
      folderText.className = "leveltext";
      folderText.textContent = folderName; // No sanitization needed for display
  
      const dots = document.createElement("p");
      dots.className = "dots";
      dots.textContent = "...";
  
      // Create the folder URL section
      const folderURL = document.createElement("p");
      folderURL.className = "folderURL";
  
      // Build the URL path for this folder
      const folderPath = Array.from(document.querySelectorAll(".folderName"))
        .slice(0, level + 1)
        .map(input => sanitizeUrlPart(input.value.trim()))
        .filter(value => value)
        .join("/");
  
      // Determine if we should exclude the first level
      const domainRoot = document.getElementById("domainRoot").checked;
      const useBrandedDomainInFolder = document.getElementById("BdInFolder").checked;
      let adjustedFolderPath = folderPath;
  
      // Remove the first level folder name if both checkboxes are checked
      if (domainRoot && useBrandedDomainInFolder) {
        if (level > 0) {
          adjustedFolderPath = folderPath.split('/').slice(1).join('/'); // Remove first segment
        } else {
          adjustedFolderPath = ""; // Exclude folder name at first level
        }
      }
  
      // Create the URL spans
      const baseUrlSpan = document.createElement("span");
      baseUrlSpan.className = "blue-text base-url-text";
      baseUrlSpan.textContent = document.getElementById("brandedDomain").value.trim()
        ? `https://${document.getElementById("brandedDomain").value.trim()}`
        : "https://viewer.ipaper.io";
  
      const accountUrlSpan = document.createElement("span");
      accountUrlSpan.className = "orange-text acc-url-text";
      const accountName = document.getElementById("accountName").value.trim();
      accountUrlSpan.textContent = accountName && !document.getElementById("domainRoot").checked
        ? `/${sanitizeUrlPart(accountName)}`
        : "";
  
      const folderUrlSpan = document.createElement("span");
      folderUrlSpan.className = "green-text folder-url";
      folderUrlSpan.textContent = adjustedFolderPath ? `/${adjustedFolderPath}` : "";
  
      document.getElementById("folder-in-flipbook").textContent = folderUrlSpan.textContent;
  
      // Assemble the URL section with parentheses outside spans
      folderURL.innerHTML = `(<span class="blue-text base-url-text">${baseUrlSpan.textContent}</span><span class="orange-text acc-url-text">${accountUrlSpan.textContent}</span><span class="green-text folder-url">${folderUrlSpan.textContent}</span>)`;
  
      // Append elements to the container
      levelDiv.appendChild(arrowImg);
      levelDiv.appendChild(folderImg);
      levelDiv.appendChild(folderText);
      lineDiv.appendChild(levelDiv);
      lineDiv.appendChild(folderURL); // Append the folder URL section here
      lineDiv.appendChild(dots);
      foldersContainer.appendChild(lineDiv);
    }
  
    // Function to update the flipbook level class based on the number of folders
    function updateFlipbookLevel(folderCount) {
      const flipbookLine = document.getElementById("flipbook-level");
  
      // Remove any existing class that starts with 'level-'
      flipbookLine.classList.forEach((className) => {
        if (className.startsWith("level-")) {
          flipbookLine.classList.remove(className);
        }
      });
  
      // Add the new level class based on current folder count
      const newLevelClass = `level-${folderCount}`;
      flipbookLine.classList.add(newLevelClass);
  
      // Call to update URLs in the admin section
      updateUrlsInAdmin();
    }
  
    // New function to update all URLs in the admin section
    function updateUrlsInAdmin() {
      const brandedDomain = document.getElementById("brandedDomain").value;
      const baseUrl = brandedDomain
        ? `https://${brandedDomain}`
        : "https://viewer.ipaper.io";
  
      // Update all elements with the class 'base-url-text'
      document.querySelectorAll(".base-url-text").forEach((element) => {
        element.textContent = baseUrl;
      });
  
      const accountName = document.getElementById("accountName").value.trim();
      const domainRoot = document.getElementById("domainRoot").checked;
      const useBrandedDomainInFolder = document.getElementById("BdInFolder").checked;
      const sanitizedAccountName = sanitizeUrlPart(accountName);
  
      let accountUrlPart = "";
      if (accountName && !domainRoot && !useBrandedDomainInFolder) {
        accountUrlPart = `/${sanitizedAccountName}`;
      }
  
      // Update account URL for elements with class 'acc-url-text'
      document.querySelectorAll(".acc-url-text").forEach((element) => {
        element.textContent = accountUrlPart;
      });
  
      const flipbookName = sanitizeUrlPart(
        document.getElementById("flipbookName").value
      );
  
      // Update the flipbook URL extension element with the sanitized flipbook name
      const flipbookUrlExtensionElement = document.getElementById(
        "flipbook-url-extension"
      );
      if (flipbookUrlExtensionElement) {
        flipbookUrlExtensionElement.textContent = flipbookName
          ? `/${flipbookName}`
          : "/Flipbook";
      }
  
      // Update the <p id="accountURL"> element
      const accountURL = document.getElementById("accountURL");
      accountURL.innerHTML = `(<span class="blue-text base-url-text">${!useBrandedDomainInFolder ? baseUrl:"https://viewer.ipaper.io"}</span><span class="orange-text acc-url-text">${accountUrlPart}</span>)`;
    }
  
    // Initial call to set the flipbook class
    updateFlipbookLevel(document.querySelectorAll(".folderName").length);
  });
  
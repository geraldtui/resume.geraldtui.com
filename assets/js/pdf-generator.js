// Opens the dedicated /print layout and triggers the browser print dialog.
function print() {
  const printWindow = window.open("/print", "_blank");
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 500);
  };
}

// Generates a multi-page A4 PDF from the /print layout, matching the
// GT Resume 2026 PDF look.
function generatePDF() {
  const printURL = new URL("print", window.location.href).href;

  fetch(printURL)
    .then((response) => response.text())
    .then((html) => {
      // Parse the fetched print page so we extract only the resume markup,
      // keeping the same DOM the print stylesheet targets.
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const resume = doc.querySelector(".resume-wrapper");

      const container = document.createElement("div");
      if (resume) {
        container.appendChild(document.importNode(resume, true));
      } else {
        container.innerHTML = html;
      }
      // Render off-screen at the true A4 width so html2canvas captures the
      // print layout (not the on-screen site layout).
      container.style.width = "210mm";
      container.style.background = "#ffffff";
      container.classList.add("print-page");
      document.body.appendChild(container);

      const name = document.querySelector(".name").textContent.trim();
      const filename = `${name.replace(/\s+/g, "_")}_Resume.pdf`;

      const opt = {
        // [top, left, bottom, right] in mm — vertical margins keep headings
        // that land at the top of pages 2 and 3 away from the paper edge.
        margin: [14, 0, 14, 0],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          windowWidth: container.scrollWidth,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
          before: [".recommendations-section"],
          avoid: [
            ".item",
            ".section-title",
            ".container-block",
            ".experiences-section .item",
            ".recommendations-section",
            ".publications-section",
          ],
        },
      };

      html2pdf()
        .set(opt)
        .from(container)
        .save()
        .then(() => document.body.removeChild(container))
        .catch((err) => {
          console.error("Error generating PDF:", err);
          if (container.parentNode) {
            document.body.removeChild(container);
          }
        });
    })
    .catch((err) => console.error("Error fetching print layout:", err));
}

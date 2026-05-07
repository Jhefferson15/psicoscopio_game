import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Service to handle PDF generation for the game board and cards.
 * Simplified for maximum reliability and synchronization.
 */
export const PdfService = {
  /**
   * Generates a PDF with the board, standard cards, and blank templates.
   * @param {Object} options - Options for generation.
   * @param {HTMLElement} exportContainer - Reference to the hidden container with all pages.
   * @param {Function} onProgress - Callback for progress updates (0 to 100).
   * @param {Function} setPageIndex - React setter to control which page is rendered.
   * @param {number} pageCount - Total number of pages to generate.
   */
  async generateGamePdf({ exportContainer, onProgress, setPageIndex, pageCount }) {
    if (!pageCount || pageCount === 0) {
      console.error('No pages found for export');
      throw new Error('Nenhuma página encontrada para exportação.');
    }

    // High Quality PDF Configuration
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 16 // Increased precision for layout
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    if (onProgress) onProgress(5);

    // Sequential Capture Loop
    for (let i = 0; i < pageCount; i++) {
      // 1. Tell React to render page index 'i'
      if (setPageIndex) {
        setPageIndex(i);
        // Wait longer for complex layouts and font loading
        await new Promise(r => setTimeout(r, 1000));
        
        // Ensure fonts are ready before capture
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      }
      
      // 2. Strict Verification: Find the element and check its index attribute
      let pageEl = null;
      let syncRetry = 0;
      
      while (syncRetry < 15) {
        pageEl = exportContainer.querySelector('.export-page-item');
        const renderedIndex = pageEl ? pageEl.getAttribute('data-page-index') : null;
        
        if (renderedIndex === i.toString()) {
          break;
        }
        
        await new Promise(r => setTimeout(r, 300));
        syncRetry++;
      }

      if (!pageEl) {
        console.warn(`Page element at index ${i} not found in DOM`);
        continue;
      }

      // 3. Capture with Extreme Quality (2K+ Resolution)
      const canvas = await html2canvas(pageEl, {
        scale: 4.0, // Higher scale for 2K+ clarity (around 3200px width)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        imageTimeout: 20000,
        removeContainer: true,
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Normalization Fixes for html2canvas glitches
          const allElements = clonedDoc.getElementById('hidden-pdf-export-container').querySelectorAll('*');
          
          allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            
            // 1. Fix clip-path issues (common in Board tiles)
            if (style.clipPath && style.clipPath !== 'none') {
              // Ensure -webkit prefix is present for better compatibility in some engines
              el.style.webkitClipPath = style.clipPath;
            }
            
            // 2. Remove all transitions and animations to prevent "ghosting"
            el.style.transition = 'none';
            el.style.animation = 'none';
            
            // 3. Remove unwanted outlines/shadows that might appear as "bordas"
            if (el.classList.contains('preview-page-sheet')) {
              el.style.border = 'none';
              el.style.boxShadow = 'none';
            }
          });

          // SVG Geometric Precision
          const svgs = clonedDoc.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.setAttribute('shape-rendering', 'geometricPrecision');
            svg.style.overflow = 'visible';
          });
        }
      });

      // 4. Add to PDF
      if (i > 0) {
        doc.addPage('a4', 'portrait');
      }

      // Using JPEG with 0.91 quality for best balance
      const imgData = canvas.toDataURL('image/jpeg', 0.91);
      doc.addImage(
        imgData, 
        'JPEG', 
        0, 0, 
        pageWidth, pageHeight,
        undefined, 
        'SLOW', // SLOW for better internal jsPDF quality
        0
      );

      // 5. Progress Feedback
      if (onProgress) {
        const progressValue = Math.round(10 + ((i + 1) / pageCount) * 85);
        onProgress(progressValue, { current: i + 1, total: pageCount });
      }
    }

    if (onProgress) onProgress(98);
    
    // Final save
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    doc.save(`Psicoscopio_Kit_Premium_${timestamp}.pdf`);
    
    if (onProgress) onProgress(100);
    
    // Reset to initial state
    if (setPageIndex) setPageIndex(-1);
  }
};

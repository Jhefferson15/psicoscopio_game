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

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    if (onProgress) onProgress(5);

    // Sequential Capture Loop
    for (let i = 0; i < pageCount; i++) {
      // 1. Tell React to render page index 'i'
      if (setPageIndex) {
        setPageIndex(i);
        // Wait for React to unmount/mount the new page
        // We use a longer timeout here to ensure the DOM is fully ready
        await new Promise(r => setTimeout(r, 400));
      }
      
      // 2. Strict Verification: Find the element and check its index attribute
      let pageEl = null;
      let syncRetry = 0;
      
      while (syncRetry < 10) {
        pageEl = exportContainer.querySelector('.export-page-item');
        const renderedIndex = pageEl ? pageEl.getAttribute('data-page-index') : null;
        
        if (renderedIndex === i.toString()) {
          // Success: DOM matches the loop index
          break;
        }
        
        // Wait and retry
        await new Promise(r => setTimeout(r, 200));
        syncRetry++;
      }

      if (!pageEl) {
        console.warn(`Page element at index ${i} not found in DOM`);
        continue;
      }

      // 3. Capture with High Resolution
      const canvas = await html2canvas(pageEl, {
        scale: 2.5, // Standard high resolution
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        imageTimeout: 0,
        removeContainer: true
      });

      // 4. Add to PDF
      if (i > 0) {
        doc.addPage('a4', 'portrait');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      doc.addImage(
        imgData, 
        'JPEG', 
        0, 0, 
        pageWidth, pageHeight,
        undefined, 
        'MEDIUM'
      );

      // 5. Progress Feedback
      if (onProgress) {
        onProgress(0, { current: i + 1, total: pageCount });
      }
    }

    if (onProgress) onProgress(98);
    doc.save('Psicoscopio_Kit_Fisico.pdf');
    if (onProgress) onProgress(100);
    
    // Reset to initial state
    if (setPageIndex) setPageIndex(-1);
  }
};

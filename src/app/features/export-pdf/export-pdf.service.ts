// features/export-pdf/export-pdf.service.ts
import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class ExportPdfService {

    /**
     * Exporta um array de elementos HTML para um único PDF.
     * Cada elemento do array começará em uma nova página.
     */
    async exportElements(elements: HTMLElement[], fileName = 'documento.pdf') {
        if (!elements || elements.length === 0) return;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 210;
        const pageHeight = 297;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            // Se não for a primeira página do PDF, adiciona uma nova página
            if (i > 0) {
                pdf.addPage();
            }

            const canvas = await html2canvas(element, {
                scale: 2, // Aumenta a qualidade
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Se o elemento couber em uma página A4
            if (imgHeight <= pageHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                // Caso o elemento individual seja maior que uma página A4 (transbordo manual)
                let heightLeft = imgHeight;
                let position = 0;

                while (heightLeft > 0) {
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    position -= pageHeight;

                    if (heightLeft > 0) {
                        pdf.addPage();
                    }
                }
            }
        }

        pdf.save(fileName);
    }
}
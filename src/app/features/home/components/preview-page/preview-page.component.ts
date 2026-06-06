import { Component, input, computed, ElementRef, viewChild, effect, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableBlock } from '../../types/block.type';
import { jsPDF } from 'jspdf';

@Component({
    selector: 'app-preview-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './preview-page.component.html',
    styleUrls: ['./preview-page.component.scss']
})
export class PreviewPageComponent {
    public title = input.required<string>();
    public color = input.required<string>();
    public columns = input.required<number>();
    public fontSize = input.required<number>();
    public blocks = input.required<EditableBlock[]>();

    private reportContent = viewChild.required<ElementRef<HTMLElement>>('reportContent');
    public isExporting = signal<boolean>(false)

    private cdr = inject(ChangeDetectorRef);
    // private reportContent = viewChild.required<ElementRef<HTMLElement>>('reportContent');

    public leftColumnBlocks = signal<EditableBlock[]>([]);
    public rightColumnBlocks = signal<EditableBlock[]>([]);
    // public isExporting = signal<boolean>(false);

    constructor() {
        /**
         * Divide matematicamente os blocos ao meio sempre que o array original 
         * ou a propriedade de colunas mudar.
         */
        effect(() => {
            // const allBlocks = this.blocks() || [];

            // console.log(allBlocks.length > 0);
            // console.log(this.columns() == 2);
            
            // if (this.columns() == 2 && allBlocks.length > 0) {
            //     console.log(true);
                
            //     const middleIndex = Math.ceil(allBlocks.length / 2);
            //     this.leftColumnBlocks.set(allBlocks.slice(0, middleIndex));
            //     this.rightColumnBlocks.set(allBlocks.slice(middleIndex));
            // } else {
            //     this.leftColumnBlocks.set(allBlocks);
            //     this.rightColumnBlocks.set([]);
            // }

            this.cdr.detectChanges();
        });
    }

    /**
     * Exportação robusta para PDF Vetorial
     */
    public async exportToPdf() {
        if (this.isExporting()) return;

        this.isExporting.set(true);
        const element = this.reportContent().nativeElement;

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();

        try {
            await pdf.html(element, {
                callback: (doc) => {
                    doc.save(`${this.title().toLowerCase().replace(/ /g, '_') || 'cantos'}.pdf`);
                    this.isExporting.set(false);
                },
                x: 0,
                y: 0,
                width: pdfWidth,
                windowWidth: 794,
                autoPaging: 'text'
            });
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.isExporting.set(false);
        }
    }

    public cssVariables = computed(() => ({
        '--title-color': this.color(),
        '--columns': String(this.columns()),
        '--base-font': `${this.fontSize()}px`,
        '--section-font': `${this.fontSize() + 2}px`,
        '--title-font': `${this.fontSize() + 8}px`,
        '--coral-font': `${this.fontSize() + 1}px`,
    }));
}
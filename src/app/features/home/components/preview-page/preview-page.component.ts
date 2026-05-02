import { Component, input, computed, viewChildren, ElementRef, signal, effect, AfterViewChecked, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { EditableBlock } from '../../types/block.type';

@Component({
    selector: 'app-preview-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './preview-page.component.html',
    styleUrls: ['./preview-page.component.scss']
})
export class PreviewPageComponent implements AfterViewChecked {
    public title = input.required<string>();
    public color = input.required<string>();
    public columns = input.required<number>();
    public fontSize = input.required<number>();
    public blocks = input.required<EditableBlock[]>();

    private cdr = inject(ChangeDetectorRef);
    private pageElements = viewChildren<ElementRef>('pageElement');

    // Armazena as páginas distribuídas
    public pagedBlocks = signal<EditableBlock[][]>([]);

    // Flag para evitar loops infinitos durante o cálculo
    private isCalculating = false;

    constructor() {
        // Reinicia a distribuição apenas quando os blocos originais (data) mudarem
        effect(() => {
            this.buildPages(this.blocks());
        }, { allowSignalWrites: true });
    }

    ngAfterViewChecked() {
        // Se houver overflow, processa na próxima macro-task para evitar erros de ciclo de vida
        if (!this.isCalculating) {
            this.checkOverflow();
        }
    }

    private buildPages(blocks: EditableBlock[]) {
        const pages: EditableBlock[][] = [];
        let currentPage: EditableBlock[] = [];
        let usedHeight = 0;

        // O limite real depende se você usa 1 ou 2 colunas.
        // Se forem 2 colunas, a "altura disponível" é o dobro da altura da página.
        const columns = this.columns();
        const pageHeightLimit = 1000 * columns; // Ajuste conforme a margem (ex: 260mm úteis)

        // Clonamos os blocos para não mexer no sinal original da service
        const blocksToProcess = blocks.map(b => ({ ...b }));

        while (blocksToProcess.length > 0) {
            const block = blocksToProcess.shift()!;
            const blockHeight = this.estimateBlockHeight(block);

            // Caso 1: O bloco cabe inteiro na página atual
            if (usedHeight + blockHeight <= pageHeightLimit) {
                currentPage.push(block);
                usedHeight += blockHeight;
            }
            // Caso 2: O bloco não cabe e precisa ser dividido
            else {
                const availableHeight = pageHeightLimit - usedHeight;

                // Se o espaço disponível for muito pequeno (ex: menos de 2 linhas), 
                // melhor jogar o bloco todo para a próxima página
                if (availableHeight < 20) {
                    pages.push(currentPage);
                    currentPage = [block];
                    usedHeight = blockHeight;
                } else {
                    // DIVISÃO DO CONTEÚDO
                    const { head, tail } = this.splitBlockContent(block, availableHeight);

                    // Adiciona a parte que coube na página atual
                    currentPage.push(head);
                    pages.push(currentPage);

                    // Prepara a próxima página com o resto do texto
                    currentPage = [];
                    usedHeight = 0;

                    // Devolve o "resto" para a fila de processamento (pode precisar dividir de novo)
                    blocksToProcess.unshift(tail);
                }
            }
        }

        if (currentPage.length) {
            pages.push(currentPage);
        }

        this.pagedBlocks.set(pages);
    }

    private splitBlockContent(block: EditableBlock, availableHeight: number): { head: EditableBlock, tail: EditableBlock } {
        const lines = block.content.split('\n');
        const fontSize = this.fontSize();
        const lineHeight = fontSize * 1.4; // Estimativa de leading

        // Quantas linhas cabem no espaço que sobrou?
        const maxLines = Math.floor(availableHeight / lineHeight);

        // Parte 1: O que fica na página atual
        const headText = lines.slice(0, maxLines).join('\n');
        // Parte 2: O que vai para a próxima
        const tailText = lines.slice(maxLines).join('\n');

        return {
            head: { ...block, content: headText, id: block.id + '_p1' },
            tail: { ...block, content: tailText, id: block.id + '_p2' }
        };
    }

    private estimateBlockHeight(block: EditableBlock): number {
        if (!block.content) return 0;

        const lines = block.content.split('\n');
        const fontSize = this.fontSize();
        const lineHeight = fontSize * 1.4; // Multiplicador de linha (standard 1.4)

        // Se o texto for muito longo e a linha quebrar automaticamente (wrap),
        // precisaríamos de uma lógica para contar linhas virtuais.
        // Mas para letras de música (curtas), contar o \n costuma bastar.
        let totalHeight = lines.length * lineHeight;

        // Adiciona margem se for seção
        if (block.type === 'section') {
            totalHeight += 20;
        }

        return totalHeight;
    }

    private checkOverflow() {
        const pages = this.pageElements();
        if (pages.length === 0) return;

        const lastPageIndex = pages.length - 1;
        const lastPageEl = pages[lastPageIndex].nativeElement;
        const contentEl = lastPageEl.querySelector('.content');

        if (!contentEl) return;

        // Verifica se o scrollHeight (tamanho real do texto) 
        // é maior que o clientHeight (espaço disponível na página A4)
        const hasOverflow = contentEl.scrollHeight > contentEl.clientHeight;

        if (hasOverflow) {
            this.isCalculating = true;

            // Usamos setTimeout para tirar a atualização do sinal do ciclo de detecção atual
            setTimeout(() => {
                const currentPages = [...this.pagedBlocks()];
                const currentLastPage = [...currentPages[lastPageIndex]];

                if (currentLastPage.length > 1) {
                    // Move o último bloco para uma nova página ou para a página seguinte
                    const movedBlock = currentLastPage.pop();

                    if (movedBlock) {
                        currentPages[lastPageIndex] = currentLastPage;

                        // Se já existir uma próxima página, adiciona no início dela, 
                        // se não, cria uma nova
                        currentPages.push([movedBlock]);

                        this.pagedBlocks.set(currentPages);
                        this.cdr.detectChanges();
                    }
                }
                this.isCalculating = false;
            }, 0);
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
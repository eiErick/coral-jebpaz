import { Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { HomeService } from './home.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { BlockType } from './types/block.type';
import { BlockItemComponent } from "../../shared/components/bloco/bloco.component";
import { PreviewPageComponent } from "./components/preview-page/preview-page.component";

type MenuAction = 'titulo' | 'verso' | 'refrao' | 'restaurar';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [HeaderComponent, BlockItemComponent, PreviewPageComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    @ViewChild('page', { read: ElementRef }) page!: ElementRef;

    private homeService = inject(HomeService);

    public blocks = this.homeService.blocks;

    public showConfirmReset = signal(false);

    public headerConfig = this.homeService.getHeaderConfig();

    public isMenuOpen = signal(false);

    public onMoveBlock(id: string, direction: 'up' | 'down'): void {
        this.homeService.moveBlock(id, direction);
    }

    public onDeleteBlock(id: string): void {
        this.homeService.removeBlock(id);
    }

    public onUpdateBlockContent(id: string, content: string): void {
        this.homeService.updateContent(id, content);
    }

    public toggleMenu(): void {
        this.isMenuOpen.update(v => !v);
    }

    public addBlock(type: BlockType): void {
        this.homeService.addBlock(type);
        this.isMenuOpen.set(false);
    }

    public onReset(): void {
        if (this.showConfirmReset()) {
            this.homeService.clearAll();
            this.showConfirmReset.set(false);
        } else {
            this.showConfirmReset.set(true); // Primeira confirmação
        }
    }

    public closeMenu(): void {
        this.isMenuOpen.set(false);
    }
    public onAction(action: MenuAction): void {
        if (action === 'restaurar') {
            this.onReset();
            return;
        }

        // Mapeia o clique do menu para a criação do bloco
        const typeMap: Record<string, BlockType> = {
            'titulo': 'section',
            'verso': 'verse',
            'refrao': 'chorus'
        };

        if (typeMap[action]) {
            this.addBlock(typeMap[action]); // Chama o seu método addBlock
        }

        this.closeMenu(); // Fecha o menu flutuante [cite: 30]
    }

    @HostListener('document:click', ['$event'])
    public handleClickOutside(event: MouseEvent): void {
        const target = event.target as HTMLElement;

        if (!target.closest('.fab-container')) {
            this.closeMenu();
        }
    }

    @HostListener('document:keydown.escape')
    public handleEsc(): void {
        this.closeMenu();
    }

    public onTitleChange(value: string): void {
        this.homeService.setTitle(value);
    }

    public onColorChange(value: string): void {
        this.homeService.setColor(value);
    }

    public onColumnsChange(value: 1 | 2): void {
        this.homeService.setColumns(value);
    }

    public onFontSizeChange(value: number): void {
        this.homeService.setFontSize(value);
    }

    public onExportPdf(): void {
        window.print();
    }
}
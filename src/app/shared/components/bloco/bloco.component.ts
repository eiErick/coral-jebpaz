import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockType } from '../../../features/home/types/block.type';

@Component({
    selector: 'app-bloco',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bloco.componet.html',
    styleUrls: ['./bloco.componet.scss']
})
export class BlockItemComponent {
    public type = input.required<BlockType>();
    public content = input.required<string>();

    public move = output<'up' | 'down'>();
    public delete = output<void>();
    public contentChange = output<string>();
    // Novo Output para mudança de tipo
    public typeChange = output<BlockType>();

    public isConfirmingDelete = signal<boolean>(false);

    public onTextChange(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        this.contentChange.emit(textarea.value);
    }

    // Método para capturar a mudança no Select
    public onTypeChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.typeChange.emit(select.value as BlockType);
    }

    public handleDelete(): void {
        if (this.isConfirmingDelete()) {
            this.delete.emit();
            this.isConfirmingDelete.set(false);
        } else {
            this.isConfirmingDelete.set(true);
            setTimeout(() => this.isConfirmingDelete.set(false), 3000);
        }
    }

    public getBlockColor(): string {
        switch (this.type()) {
            case 'section': return 'var(--color-primary-500)';
            case 'chorus': return 'var(--color-warning)';
            case 'verse': return 'var(--color-neutral-500)';
            default: return 'var(--color-neutral-200)';
        }
    }
}
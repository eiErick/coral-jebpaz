import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockType, EditableBlock } from '../../../features/home/types/block.type';

@Component({
    selector: 'app-bloco',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bloco.componet.html',
    styleUrls: ['./bloco.componet.scss']
})
export class BlockItemComponent {
    // Inputs usando Signals
    public type = input.required<BlockType>();
    public content = input.required<string>();

    // Outputs para comunicação com o Smart Component
    public move = output<'up' | 'down'>();
    public delete = output<void>();
    public contentChange = output<string>();

    // Estado interno para controle de confirmação de exclusão
    public isConfirmingDelete = signal<boolean>(false);

    public onTextChange(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        this.contentChange.emit(textarea.value);
    }

    public handleDelete(): void {
        if (this.isConfirmingDelete()) {
            this.delete.emit();
            this.isConfirmingDelete.set(false);
        } else {
            this.isConfirmingDelete.set(true);
            // Opcional: resetar confirmação após 3 segundos
            setTimeout(() => this.isConfirmingDelete.set(false), 3000);
        }
    }

    public getBlockColor(): string {
        switch (this.type()) {
            case 'section': return 'var(--color-primary-500)';
            case 'chorus': return 'var(--color-warning)';
            case 'verse': return 'var(--color-neutral-400)';
            default: return 'var(--color-neutral-200)';
        }
    }
}
import { Injectable, signal } from '@angular/core';
import { HeaderConfig } from './types/header-config.type';
import { BlockType, EditableBlock } from './types/block.type';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    private blocksSignal = signal<EditableBlock[]>([]);
    public blocks = this.blocksSignal.asReadonly();
    private readonly _headerConfig = signal<HeaderConfig>({
        title: '',
        color: '#16436C',
        columns: 1,
        fontSize: 12
    });

    public getHeaderConfig() {
        return this._headerConfig;
    }

    public setTitle(value: string): void {
        this._headerConfig.update(state => ({ ...state, title: value }));
    }

    public setColor(value: string): void {
        this._headerConfig.update(state => ({ ...state, color: value }));
    }

    public setColumns(value: 1 | 2): void {
        this._headerConfig.update(state => ({ ...state, columns: value }));
    }

    public setFontSize(value: number): void {
        this._headerConfig.update(state => ({ ...state, fontSize: value }));
    }

    public addBlock(type: BlockType): void {
        const newBlock: EditableBlock = {
            id: crypto.randomUUID(), // Gera ID único
            type: type,
            content: '', // Inicia vazio para o textarea [cite: 25]
            order: this.blocksSignal().length
        };

        // Atualiza o signal: isso dispara a reatividade no HTML da Home 
        this.blocksSignal.update(currentBlocks => [...currentBlocks, newBlock]);
    }

    public removeBlock(id: string): void {
        this.blocksSignal.update(state => state.filter(b => b.id !== id));
    }

    public moveBlock(id: string, direction: 'up' | 'down'): void {
        const list = [...this.blocksSignal()];
        const index = list.findIndex(b => b.id === id);
        if ((direction === 'up' && index > 0) || (direction === 'down' && index < list.length - 1)) {
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
            this.blocksSignal.set(list);
        }
    }

    public updateContent(id: string, content: string): void {
        this.blocksSignal.update(state =>
            state.map(b => b.id === id ? { ...b, content } : b)
        );
    }

    public clearAll(): void {
        this.blocksSignal.set([]);
    }
}
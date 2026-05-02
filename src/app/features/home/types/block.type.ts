export type BlockType = 'section' | 'verse' | 'chorus';

export interface EditableBlock {
    id: string;
    type: BlockType;
    content: string;
    order: number;
}
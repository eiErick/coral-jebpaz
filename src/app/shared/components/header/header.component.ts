import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    @Input() title = '';
    @Input() color = '#16436C';
    @Input() columns: 1 | 2 = 1;
    @Input() fontSize = 12;

    @Output() titleChange = new EventEmitter<string>();
    @Output() colorChange = new EventEmitter<string>();
    @Output() columnsChange = new EventEmitter<1 | 2>();
    @Output() fontSizeChange = new EventEmitter<number>();
    @Output() exportPdf = new EventEmitter<void>();

    public fontSizes = Array.from({ length: 11 }, (_, i) => i + 10);
}
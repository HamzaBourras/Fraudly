import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningService } from '../service/learning.service';

@Component({
  selector: 'app-chapter-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter-form.html'
})
export class ChapterForm implements OnInit {
  @Input() courseId!: string;
  @Input() chapter: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  editingChapter: any = { title: '', index: 1 };
  showLinkInput = false;
  linkUrl = '';

  constructor(private learningService: LearningService) {}

  ngOnInit() {
    if (this.chapter) this.editingChapter = { ...this.chapter };
  }

  // Inside chapter-form.ts

// 1. Update onFileSelected
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.chapter?.id) {
      // Correct Order: (file, type, lien, chapterId)
      this.learningService.uploadResource(file, 'PDF', file.name, this.chapter.id)
        .subscribe(() => alert("File uploaded!"));
    }
  }

// 2. Update uploadLink
  uploadLink() {
    if (this.linkUrl && this.chapter?.id) {
      // Correct Order: (file, type, lien, chapterId)
      this.learningService.uploadResource(null, 'LINK', this.linkUrl, this.chapter.id)
        .subscribe(() => {
          alert("Link saved!");
          this.linkUrl = '';
          this.showLinkInput = false;
        });
    }
  }

  saveChapter() {
    const payload = { title: this.editingChapter.title, index: this.editingChapter.index, courseId: this.courseId };

    if (this.chapter?.id) {
      this.learningService.updateChapter(this.chapter.id, payload as any).subscribe(() => this.saved.emit());
    } else {
      this.learningService.createChapter(this.courseId, payload as any).subscribe(() => this.saved.emit());
    }
  }
}

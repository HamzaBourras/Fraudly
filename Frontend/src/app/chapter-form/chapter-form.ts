import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningService } from '../service/learning.service';
import { forkJoin, of } from 'rxjs';

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

  // Staging for resources
  pendingFiles: File[] = [];
  pendingLinks: string[] = [];
  loading = false;

  constructor(
    private learningService: LearningService,
    private cdr: ChangeDetectorRef
  ) {}

  formatExternalUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }

  ngOnInit() {
    if (this.chapter) {
      this.editingChapter = { ...this.chapter };
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.pendingFiles.push(file);
      this.cdr.detectChanges();
    }
  }

  removePendingFile(index: number) {
    this.pendingFiles.splice(index, 1);
  }

  addPendingLink() {
    if (this.linkUrl.trim()) {
      this.pendingLinks.push(this.linkUrl.trim());
      this.linkUrl = '';
      this.showLinkInput = false;
      this.cdr.detectChanges();
    }
  }

  removePendingLink(index: number) {
    this.pendingLinks.splice(index, 1);
  }

  saveChapter() {
    if (!this.editingChapter.title.trim()) return;

    this.loading = true;
    const payload = { title: this.editingChapter.title.trim() };

    const obs$ = this.chapter?.id
      ? this.learningService.updateChapter(this.chapter.id, payload)
      : this.learningService.createChapter(this.courseId, payload);

    obs$.subscribe({
      next: (savedChapter) => {
        const currentChapterId = savedChapter.id;

        const uploads = [
          ...this.pendingFiles.map(f =>
            this.learningService.uploadResource(f, f.type || 'application/octet-stream', '', currentChapterId)
          ),
          ...this.pendingLinks.map(l =>
            this.learningService.uploadResource(null, 'lien', l, currentChapterId)
          ),
        ];

        if (uploads.length > 0) {
          forkJoin(uploads).subscribe({
            next: () => {
              this.loading = false;
              this.saved.emit();
            },
            error: (err) => {
              console.error("Resource upload failed", err);
              this.loading = false;
              this.saved.emit(); // Still emit saved if metadata worked
            }
          });
        } else {
          this.loading = false;
          this.saved.emit();
        }
      },
      error: (err) => {
        this.loading = false;
        alert("Failed to save chapter: " + (err.error?.message || err.message));
      }
    });
  }
}

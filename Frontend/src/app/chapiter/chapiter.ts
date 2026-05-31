import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { LearningService } from '../service/learning.service';
import { AuthService } from '../core/services/auth.service';
import { Chapter } from '../models/learning.model';

@Component({
  selector: 'app-chapiter',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './chapiter.html',
  styleUrl: './chapiter.css',
})
export class Chapiter implements OnInit {
  chapters: Chapter[] = [];
  loading = true;
  error = '';
  courseId = '';
  isTeacher = false;

  // Modal state
  showChapterModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingChapter: Chapter | null = null;

  // Modal form state
  modalTitle = '';
  modalError = '';
  modalSaving = false;

  // Resource staging
  pendingFiles: File[] = [];
  pendingLinks: string[] = [];
  linkInput = '';
  showLinkInput = false;

  // Delete state
  deletingId: string | null = null;

  constructor(
    private learningService: LearningService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') ?? '';
    this.isTeacher = this.authService.isProfessor();
    this.loadChapters();
  }

  loadChapters(): void {
    this.loading = true;
    this.learningService.getCourseById(this.courseId).subscribe({
      next: (course: any) => {
        this.chapters = course.chapters ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load chapters.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // --- Modal open/close ---

  openAddModal(): void {
    this.modalMode = 'add';
    this.editingChapter = null;
    this.modalTitle = '';
    this.modalError = '';
    this.modalSaving = false;
    this.pendingFiles = [];
    this.pendingLinks = [];
    this.linkInput = '';
    this.showLinkInput = false;
    this.showChapterModal = true;
  }

  openEditModal(chapter: Chapter): void {
    this.modalMode = 'edit';
    this.editingChapter = chapter;
    this.modalTitle = chapter.title;
    this.modalError = '';
    this.modalSaving = false;
    this.pendingFiles = [];
    this.pendingLinks = [];
    this.linkInput = '';
    this.showLinkInput = false;
    this.showChapterModal = true;
  }

  closeModal(): void {
    this.showChapterModal = false;
    this.editingChapter = null;
    this.modalTitle = '';
    this.modalError = '';
    this.modalSaving = false;
    this.pendingFiles = [];
    this.pendingLinks = [];
    this.linkInput = '';
    this.showLinkInput = false;
  }

  // --- Resource staging ---

  addFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(f => this.pendingFiles.push(f));
      input.value = ''; // reset so same file can be re-added after removal
      this.cdr.detectChanges();
    }
  }

  removeFile(index: number): void {
    this.pendingFiles.splice(index, 1);
    this.cdr.detectChanges();
  }

  addLink(): void {
    const link = this.linkInput.trim();
    if (!link) return;
    this.pendingLinks.push(link);
    this.linkInput = '';
    this.showLinkInput = false;
    this.cdr.detectChanges();
  }

  removeLink(index: number): void {
    this.pendingLinks.splice(index, 1);
    this.cdr.detectChanges();
  }

  // --- Save ---

  saveChapter(): void {
    if (!this.modalTitle.trim()) {
      this.modalError = 'Chapter title is required.';
      return;
    }
    this.modalSaving = true;
    this.modalError = '';

    if (this.modalMode === 'edit' && this.editingChapter) {
      this.learningService.updateChapter(this.editingChapter.id, {
        title: this.modalTitle.trim(),
      }).subscribe({
        next: (updated) => {
          this.chapters = this.chapters.map(c => c.id === updated.id ? updated : c);
          this.modalSaving = false;
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.modalError = err?.error?.message || 'Failed to update chapter.';
          this.modalSaving = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      // CREATE — then upload any pending resources
      this.learningService.createChapter(this.courseId, {
        title: this.modalTitle.trim(),
      }).subscribe({
        next: (chapter) => {
          const newChapterId = chapter.id;
          const uploads = [
            ...this.pendingFiles.map(f =>
              this.learningService.uploadResource(f, f.type || 'application/octet-stream', '', newChapterId)
            ),
            ...this.pendingLinks.map(link =>
              this.learningService.uploadResource(null, 'lien', link, newChapterId)
            ),
          ];

          const done$ = uploads.length > 0 ? forkJoin(uploads) : of([]);
          done$.subscribe({
            next: () => {
              this.modalSaving = false;
              this.closeModal();
              this.loadChapters();
            },
            error: () => {
              // Chapter created, but some uploads failed — still refresh
              this.modalSaving = false;
              this.closeModal();
              this.loadChapters();
            },
          });
        },
        error: (err) => {
          this.modalError = err?.error?.message || 'Failed to create chapter.';
          this.modalSaving = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  // --- Delete ---

  deleteChapter(chapterId: string): void {
    this.deletingId = chapterId;
    this.learningService.deleteChapter(chapterId).subscribe({
      next: () => {
        this.chapters = this.chapters.filter(c => c.id !== chapterId);
        this.deletingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.deletingId = null;
        this.cdr.detectChanges();
      },
    });
  }

  navigateToDetail(chapterId: string): void {
    this.router.navigate(['/chapiter-detail', chapterId]);
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LearningService } from '../service/learning.service';
import { AuthService } from '../core/services/auth.service';
import { Chapter, Resource } from '../models/learning.model';

@Component({
  selector: 'app-chapiter-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chapiter-detail.html',
})
export class ChapiterDetailComponent implements OnInit {
  chapter: Chapter | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private learningService: LearningService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const chapterId = this.route.snapshot.paramMap.get('chapterId') ?? '';

    this.learningService.getChapterById(chapterId).subscribe({
      next: (chapter) => {
        this.chapter = chapter;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load chapter.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getFileIcon(mimeType: string): string {
    if (!mimeType) return '📎';
    if (mimeType === 'lien') return '🔗';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📎';
  }

  openResource(resource: Resource): void {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
    }
  }

  goBack(): void {
    this.location.back();
  }
}
